"use client";

import type { ReactNode } from "react";
import "./shell.css";

export function AppShell({
  rail,
  children,
}: {
  rail: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="dp-shell">
      {rail}
      <div className="dp-shell__main">
        <div className="dp-shell__body">{children}</div>
      </div>
    </div>
  );
}
