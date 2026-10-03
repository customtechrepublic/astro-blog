// Contact form endpoint (runs on the Worker).
//   1. validate + spam checks (honeypot, optional Turnstile, per-IP rate limit)
//   2. store the submission in KV  (binding CONTACT_KV)
//   3. email it to CONTACT_TO       (binding CONTACT_EMAIL)
// Works with a plain HTML form POST (redirects) or fetch() with JSON (Accept: application/json).
import type { APIRoute } from "astro";
import { EmailMessage } from "cloudflare:email";
import { validateContact } from "../../lib/contact/validate";
import { buildContactMime } from "../../lib/contact/mail";

export const prerender = false;

const RATE_LIMIT = { max: 5, windowSeconds: 600 };
/** Submissions are kept for a year, then expire automatically. */
const RETENTION_SECONDS = 60 * 60 * 24 * 365;

interface ContactEnv {
	CONTACT_KV: KVNamespace;
	CONTACT_EMAIL: SendEmail;
	CONTACT_TO: string;
	CONTACT_FROM: string;
	TURNSTILE_SECRET?: string;
}

async function sha256(s: string) {
	const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
	return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyTurnstile(secret: string, token: string, ip: string) {
	const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
		method: "POST",
		body: new URLSearchParams({ secret, response: token, remoteip: ip }),
	});
	const data = (await res.json()) as { success: boolean };
	return data.success;
}

export const POST: APIRoute = async ({ request, locals, redirect }) => {
	const wantsJson = (request.headers.get("accept") ?? "").includes("application/json");
	const reply = (status: number, body: Record<string, unknown>) => {
		if (wantsJson) {
			return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
		}
		return redirect(
			status < 400 ? "/contact/thanks" : `/contact?error=${encodeURIComponent(String(body.error))}`,
			303,
		);
	};

	const env = locals.runtime?.env as unknown as ContactEnv | undefined;
	if (!env?.CONTACT_KV) return reply(503, { error: "Contact form is not configured." });

	// Parse JSON or form bodies.
	let raw: Record<string, unknown>;
	try {
		const type = request.headers.get("content-type") ?? "";
		raw = type.includes("application/json")
			? ((await request.json()) as Record<string, unknown>)
			: Object.fromEntries(await request.formData());
	} catch {
		return reply(400, { error: "Could not read the form." });
	}

	// Honeypot: real people never fill this hidden field. Pretend success.
	if (String(raw.website ?? "").trim() !== "") return reply(200, { ok: true });

	const ip = request.headers.get("cf-connecting-ip") ?? "unknown";

	if (env.TURNSTILE_SECRET) {
		const token = String(raw["cf-turnstile-response"] ?? "");
		if (!token || !(await verifyTurnstile(env.TURNSTILE_SECRET, token, ip))) {
			return reply(400, { error: "Spam check failed. Please try again." });
		}
	}

	const result = validateContact(raw);
	if (!result.ok) return reply(400, { error: Object.values(result.errors)[0], errors: result.errors });

	// Per-IP rate limit (KV is eventually consistent, so this is a soft limit).
	const ipHash = (await sha256(`cpr-contact:${ip}`)).slice(0, 32);
	const rateKey = `rate:${ipHash}`;
	const count = Number((await env.CONTACT_KV.get(rateKey)) ?? 0);
	if (count >= RATE_LIMIT.max) return reply(429, { error: "Too many messages. Please try again later." });
	await env.CONTACT_KV.put(rateKey, String(count + 1), { expirationTtl: RATE_LIMIT.windowSeconds });

	const receivedAt = new Date().toISOString();
	const id = `${receivedAt.replace(/[:.]/g, "-")}-${crypto.randomUUID().slice(0, 8)}`;
	const cf = (request as Request & { cf?: { country?: string } }).cf;
	const meta = {
		receivedAt,
		country: cf?.country,
		userAgent: request.headers.get("user-agent") ?? undefined,
	};

	// 1) Store first, so nothing is lost if email delivery fails.
	const key = `submission:${id}`;
	const record = { id, ...result.data, ...meta, ipHash, email_status: "pending" as string };
	await env.CONTACT_KV.put(key, JSON.stringify(record), {
		expirationTtl: RETENTION_SECONDS,
		metadata: { name: result.data.name, email: result.data.email, topic: result.data.topic, receivedAt },
	});

	// 2) Email each recipient (EmailMessage takes one recipient).
	const recipients = env.CONTACT_TO.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
	const outcomes = await Promise.allSettled(
		recipients.map((to) =>
			env.CONTACT_EMAIL.send(
				new EmailMessage(
					env.CONTACT_FROM,
					to,
					buildContactMime({ from: env.CONTACT_FROM, to, input: result.data, id, meta }),
				),
			),
		),
	);
	const failed = outcomes
		.map((o, i) => (o.status === "rejected" ? `${recipients[i]}: ${(o.reason as Error)?.message}` : null))
		.filter(Boolean);
	if (failed.length) console.error("[contact] email failed", { id, failed });

	record.email_status =
		failed.length === 0 ? "sent" : failed.length === recipients.length ? "failed" : "partial";
	await env.CONTACT_KV.put(key, JSON.stringify(record), {
		expirationTtl: RETENTION_SECONDS,
		metadata: { name: result.data.name, email: result.data.email, topic: result.data.topic, receivedAt },
	});

	// The message is safely stored either way, so the visitor sees success.
	return reply(200, { ok: true, id });
};
