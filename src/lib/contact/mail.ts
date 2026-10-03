// Builds a plain-text MIME message for the Workers `send_email` binding.
// Recipients must be verified destination addresses in Email Routing for
// custompcrepublic.com, and also listed in wrangler.json →
// send_email.allowed_destination_addresses.
import type { ContactInput } from "./validate";

const b64 = (s: string) => {
	const bytes = new TextEncoder().encode(s);
	let bin = "";
	for (const b of bytes) bin += String.fromCharCode(b);
	return btoa(bin);
};
/** RFC 2047 encoded-word so non-ASCII subjects/names survive. */
const encodeHeader = (s: string) => (/^[\x20-\x7E]*$/.test(s) ? s : `=?UTF-8?B?${b64(s)}?=`);
const wrap76 = (s: string) => s.replace(/.{1,76}/g, "$&\r\n");

export function buildContactMime(opts: {
	from: string;
	to: string;
	input: ContactInput;
	id: string;
	meta: { receivedAt: string; country?: string; userAgent?: string };
}): string {
	const { from, to, input, id, meta } = opts;
	const domain = from.split("@")[1] ?? "custompcrepublic.com";
	const body = [
		`New contact form submission from blog.custompcrepublic.com`,
		``,
		`Name:    ${input.name}`,
		`Email:   ${input.email}`,
		`Topic:   ${input.topic}`,
		`When:    ${meta.receivedAt}`,
		meta.country ? `Country: ${meta.country}` : null,
		`ID:      ${id}`,
		``,
		`Message:`,
		`--------`,
		input.message,
		``,
		`--`,
		`Reply directly to this email to answer ${input.name}.`,
		`Stored in KV (cpr-blog-contact) as ${id}.`,
	]
		.filter((l) => l !== null)
		.join("\r\n");

	const headers = [
		`From: ${encodeHeader("CPR Blog Contact")} <${from}>`,
		`To: <${to}>`,
		`Reply-To: ${encodeHeader(input.name)} <${input.email}>`,
		`Subject: ${encodeHeader(`[CPR contact] ${input.topic} — ${input.name}`)}`,
		`Message-ID: <${id}@${domain}>`,
		`Date: ${new Date().toUTCString()}`,
		`MIME-Version: 1.0`,
		`Content-Type: text/plain; charset=UTF-8`,
		`Content-Transfer-Encoding: base64`,
	];
	return `${headers.join("\r\n")}\r\n\r\n${wrap76(b64(body))}`;
}
