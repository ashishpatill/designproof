"use client";

import { AlertTriangle, Check, Info } from "lucide-react";
import type { UiNotice } from "@/components/report/types";

/**
 * Bottom-centre status dock. Anchored inside the content column so it never
 * covers the critic inspector or the canvas controls at the pane edges.
 */
export function ToastNotice({ notice, onClose }: { notice: UiNotice; onClose: () => void }) {
  const Icon = notice.tone === "success" ? Check : notice.tone === "error" ? AlertTriangle : Info;
  return (
    <div className="dp-toast-layer">
      <div className="dp-toast" data-tone={notice.tone} role={notice.tone === "error" ? "alert" : "status"}>
        <Icon className="dp-toast__icon h-4 w-4" aria-hidden />
        <div className="dp-toast__body">
          <p className="dp-toast__title">{notice.title}</p>
          <p className="dp-toast__message">{notice.message}</p>
        </div>
        <button type="button" onClick={onClose} className="dp-ghost-btn shrink-0" aria-label="Dismiss notice">
          dismiss
        </button>
      </div>
    </div>
  );
}
