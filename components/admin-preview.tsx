"use client";

import { useState } from "react";
import { DemoToolbar } from "./demo-toolbar";
import { PreviewControls } from "./preview-controls";
import { StaffLogin } from "./staff-login";

export function AdminPreview({ embedded = false }: { embedded?: boolean }) {
  const [mode, setMode] = useState<"pc" | "sp">("pc");
  if (embedded) return <StaffLogin embedded />;
  return <div className={`presentation admin-preview is-${mode}`}>
    <DemoToolbar current="admin" />
    <PreviewControls mode={mode} onChange={setMode} />
    <div className="admin-preview-canvas">
      <div className="admin-preview-frame">
        <div className="device-speaker" aria-hidden="true" />
        <iframe title="社内管理の表示プレビュー" src="/admin?preview=sp" />
        <div className="device-home" aria-hidden="true" />
      </div>
      {mode === "sp" && <p>スマートフォン表示・375 × 740px</p>}
    </div>
  </div>;
}
