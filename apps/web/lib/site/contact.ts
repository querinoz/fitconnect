/** Canonical FitConnect brand contact — Meta, Stripe, Supabase, support. */
export const FITCONNECT_CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_FITCONNECT_CONTACT_EMAIL ?? "fitconnectsports@gmail.com";

export const FITCONNECT_INSTAGRAM_HANDLE = "fitconnectsports";
export const FITCONNECT_INSTAGRAM_URL = "https://www.instagram.com/fitconnectsports/";

export function mailto(href = FITCONNECT_CONTACT_EMAIL) {
  return `mailto:${href}`;
}
