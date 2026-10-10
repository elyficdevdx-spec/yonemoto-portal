import type { Metadata } from "next";
import { AdminPreview } from "@/components/admin-preview";
import { Suspense } from "react";
import "./admin.css";

export const metadata: Metadata = { title: "米元建設工業｜社内管理" };

async function AdminContent({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const params = await searchParams;
  return <AdminPreview embedded={params.preview === "sp"} />;
}

export default function AdminPage({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  return <Suspense fallback={null}><AdminContent searchParams={searchParams} /></Suspense>;
}
