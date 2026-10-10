import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "米元建設工業｜住まいのマイページ", description: "家づくりの検討からお引き渡し後までをつなぐ顧客向けポータル" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff" };
export default function RootLayout({ children }: LayoutProps<"/">) { return <html lang="ja"><body>{children}</body></html>; }
