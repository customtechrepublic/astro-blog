import { SITE } from "../../consts";

export function formatPrice(cents: number | undefined, currency = "AUD"): string {
	if (cents === undefined) return "Price TBA";
	return new Intl.NumberFormat(SITE.locale, { style: "currency", currency }).format(cents / 100);
}
