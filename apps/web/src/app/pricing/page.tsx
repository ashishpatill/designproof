import type { Metadata } from "next";
import { ProductShell } from "@/components/shell";
import { PricingBoard } from "./PricingBoard";
import "./pricing.css";

export const metadata: Metadata = {
  title: "Plans for DesignProof",
  description:
    "Hosted generation with hard caps. Free is flash-only and capped. Bring-your-own-key stays optional.",
};

/** Locked deck copy — Design Expert plan UX lock §5. */
const DECK =
  "Hosted generation with hard caps. Free is flash-only and capped. Bring-your-own-key stays optional.";

export default function PricingPage() {
  return (
    <ProductShell active="pricing">
      <main className="pr-page">
        <h1 className="pr-page__title">Plans for DesignProof</h1>
        <p className="pr-page__deck">{DECK}</p>
        <PricingBoard />
      </main>
    </ProductShell>
  );
}
