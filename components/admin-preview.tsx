"use client";

import { useEffect, useRef, useState } from "react";
import { DemoToolbar } from "./demo-toolbar";
import { PreviewControls } from "./preview-controls";
import { StaffLogin } from "./staff-login";
import { usePhoneScale } from "./use-phone-scale";

export function AdminPreview({ embedded = false }: { embedded?: boolean }) {
  const [mode, setMode] = useState<"pc" | "sp">("pc");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { canvasRef, phoneStyle } = usePhoneScale(mode);
  useEffect(() => {
    if (embedded) {
      document.documentElement.classList.add("admin-embedded");
      return () => document.documentElement.classList.remove("admin-embedded");
    }
  }, [embedded]);
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    // Reuse the document to retain login and form state, but discard horizontal
    // offsets left behind when its viewport changes from desktop to phone.
    const resetHorizontalScroll = () => {
      const view = iframe.contentWindow;
      const doc = iframe.contentDocument;
      if (!view || !doc) return;
      view.scrollTo({ left: 0, top: view.scrollY, behavior: "instant" });
      doc.documentElement.scrollLeft = 0;
      if (doc.body) doc.body.scrollLeft = 0;
    };
    const observer = new ResizeObserver(resetHorizontalScroll);
    observer.observe(iframe);
    iframe.addEventListener("load", resetHorizontalScroll);
    const frame = requestAnimationFrame(resetHorizontalScroll);
    return () => { observer.disconnect(); iframe.removeEventListener("load", resetHorizontalScroll); cancelAnimationFrame(frame); };
  }, [mode]);
  if (embedded) return <StaffLogin embedded />;
  return <div className={`presentation admin-preview is-${mode}`}>
    <DemoToolbar current="admin" />
    <PreviewControls mode={mode} onChange={setMode} />
    <div className="admin-preview-canvas" ref={canvasRef} style={phoneStyle}>
      <div className="admin-preview-frame">
        <div className="device-speaker" aria-hidden="true" />
        <iframe ref={iframeRef} width={mode === "sp" ? 375 : "100%"} title="社内管理の表示プレビュー" src="/admin?preview=sp" />
        <div className="device-home" aria-hidden="true" />
      </div>
      {mode === "sp" && <p>スマートフォン表示・375 × 700px</p>}
    </div>
  </div>;
}
