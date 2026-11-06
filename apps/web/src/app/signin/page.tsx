import type { Metadata } from "next";
import { ProductShell } from "@/components/shell";
import { SignInCard } from "./SignInCard";
import "./signin.css";

export const metadata: Metadata = {
  title: "Sign in — DesignProof",
  description: "Email magic-link sign-in for hosted generations and paid plans.",
};

/**
 * /signin — magic-link only (Ashish's call, 6 Nov 2026). One email field, one
 * send. No password, no OAuth: honest single path. With Neon Auth unconfigured
 * the card says so instead of pretending to send.
 */
export default function SignInPage() {
  return (
    <ProductShell active="home">
      <main className="sg-page">
        <h1 className="sg-page__title">Sign in to DesignProof</h1>
        <p className="sg-page__deck">
          We email you a one-tap link. No password to remember — the link signs
          you in and returns you to the studio.
        </p>
        <SignInCard />
      </main>
    </ProductShell>
  );
}
