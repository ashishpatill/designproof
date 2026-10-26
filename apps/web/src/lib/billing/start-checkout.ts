/**
 * Checkout client. Thin on purpose: it POSTs { productId } to
 * `/api/billing/checkout` and either navigates to the returned hosted
 * checkout `{ url }` or surfaces an honest error string in the UI.
 *
 * Contract (match the Frontend Engineer / FE LOOP):
 *   POST /api/billing/checkout  body: { productId: string }
 *   -> 200 { url: string }  redirect to Dodo hosted checkout
 *   -> 501/404/5xx { error: string }  shown verbatim on /pricing
 */

export type CheckoutResult =
  | { ok: true }
  | { ok: false; message: string };

export async function startCheckout(productId: string): Promise<CheckoutResult> {
  if (!productId) {
    return { ok: false, message: "No product configured for this tier yet." };
  }
  try {
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });

    if (res.status === 501 || res.status === 404) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      return {
        ok: false,
        message:
          body?.error ??
          "Checkout isn't wired yet — payment API create is owned by the Frontend Engineer.",
      };
    }

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      return {
        ok: false,
        message: body?.error ?? `Checkout could not start (HTTP ${res.status}).`,
      };
    }

    const body = (await res.json().catch(() => null)) as { url?: string } | null;
    const url = body?.url;
    if (!url || typeof url !== "string") {
      return { ok: false, message: "Checkout responded without a redirect URL." };
    }

    window.location.assign(url);
    return { ok: true };
  } catch {
    return { ok: false, message: "Checkout request failed — network unreachable." };
  }
}
