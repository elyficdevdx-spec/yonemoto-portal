"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon } from "./icons";

export function AppInstallBanner({ onShow }: { onShow: () => void }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return <aside className="app-install-banner" aria-label="米元建設アプリのご案内">
    <button type="button" className="app-install-close" aria-label="アプリの案内を閉じる" onClick={() => setDismissed(true)}><Icon name="close" size={18} /></button>
    <Image className="app-install-icon" src="/images/icon.png" width={56} height={56} sizes="56px" loading="eager" alt="米元建設アプリのアイコン" />
    <div className="app-install-copy"><strong>米元建設</strong><span>住まいの情報をアプリで</span><small>無料</small></div>
    <button type="button" className="app-install-show" aria-label="米元建設アプリを表示" onClick={onShow}>表示</button>
  </aside>;
}
