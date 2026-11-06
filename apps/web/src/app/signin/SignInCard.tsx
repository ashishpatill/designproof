"use client";

import { useState, useTransition } from "react";
import { MAGIC_LINK_CALLBACK_URL, requestMagicLink } from "@/lib/auth-magic";

/**
 * Magic-link sign-in card. States are honest and exhaustive: idle, sending,
 * sent (check your email), and a verbatim error line. Never renders a fake
 * "sent" when the request failed.
 */
export function SignInCard() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  function send() {
    if (busy) return;
    setError(null);
    setBusy(true);
    startTransition(async () => {
      const result = await requestMagicLink(email);
      if (result.ok) {
        setSent(true);
      } else {
        setError(result.message);
      }
      setBusy(false);
    });
  }

  return (
    <section className="sg-card" aria-labelledby="sg-card-title" data-testid="signin-card">
      {sent ? (
        <>
          <h2 id="sg-card-title" className="sg-card__title" data-testid="signin-sent-title">
            Check your email
          </h2>
          <p className="sg-card__body">
            The link is on its way to <strong>{email.trim()}</strong>. Tap it
            and you land back on <code className="sg-card__mono">{MAGIC_LINK_CALLBACK_URL}</code>, signed in.
          </p>
          <p className="sg-card__hint">
            Didn't arrive? Check spam, then send again.
          </p>
          <button
            type="button"
            className="sg-card__link"
            data-testid="signin-resend"
            onClick={() => {
              setSent(false);
              setError(null);
            }}
          >
            Use a different email
          </button>
        </>
      ) : (
        <>
          <h2 id="sg-card-title" className="sg-card__title">Email sign-in</h2>
          <form
            className="sg-card__form"
            data-testid="signin-form"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <label className="sg-card__label" htmlFor="sg-email">
              Email
            </label>
            <input
              id="sg-email"
              className="sg-card__input"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="input-signin-email"
            />
            <button
              type="submit"
              className="sg-card__submit"
              disabled={busy || !email.trim()}
              data-testid="btn-signin-send"
            >
              {busy ? "Sending…" : "Send magic link"}
            </button>
          </form>
          <p data-testid="signin-status" role="status" className="sg-card__status">
            {error}
          </p>
        </>
      )}
    </section>
  );
}
