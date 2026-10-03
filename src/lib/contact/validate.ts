// Contact form validation. Shared by the API route; no runtime deps.

export const TOPICS = ["general", "custom-build", "openwrt", "shop", "partnership", "support"] as const;
export type Topic = (typeof TOPICS)[number];

export interface ContactInput {
	name: string;
	email: string;
	topic: Topic;
	message: string;
}

export const LIMITS = { name: 120, email: 254, message: 5000 } as const;

const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/;

/** Strip control characters (blocks header injection) and trim. */
const clean = (v: unknown) =>
	String(v ?? "")
		.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
		.trim();
const oneLine = (v: unknown) => clean(v).replace(/[\r\n]+/g, " ");

export type ValidationResult =
	{ ok: true; data: ContactInput } | { ok: false; errors: Record<string, string> };

export function validateContact(raw: Record<string, unknown>): ValidationResult {
	const name = oneLine(raw.name);
	const email = oneLine(raw.email).toLowerCase();
	const topic = oneLine(raw.topic) as Topic;
	const message = clean(raw.message);
	const errors: Record<string, string> = {};

	if (!name) errors.name = "Please enter your name.";
	else if (name.length > LIMITS.name) errors.name = `Name must be under ${LIMITS.name} characters.`;

	if (!EMAIL_RE.test(email) || email.length > LIMITS.email)
		errors.email = "Please enter a valid email address.";

	if (!TOPICS.includes(topic)) errors.topic = "Please pick a topic.";

	if (message.length < 10) errors.message = "Message must be at least 10 characters.";
	else if (message.length > LIMITS.message)
		errors.message = `Message must be under ${LIMITS.message} characters.`;

	return Object.keys(errors).length
		? { ok: false, errors }
		: { ok: true, data: { name, email, topic, message } };
}
