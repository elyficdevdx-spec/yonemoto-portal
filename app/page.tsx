import { PresentationPreview } from "@/components/presentation-preview";
import { CustomerPortal } from "@/components/customer-portal";
import { CustomerStage, DEFAULT_CUSTOMER_STAGE } from "@/lib/customer-stage";
import { Suspense } from "react";

async function PreviewContent({ searchParams }: { searchParams: Promise<{ preview?: string; stage?: string }> }) {
  const params = await searchParams;
  const initialStage: CustomerStage = params.stage === "upstream" || params.stage === "downstream" ? params.stage : DEFAULT_CUSTOMER_STAGE;
  return <PresentationPreview embedded={params.preview === "sp"} initialStage={initialStage} />;
}

export default function Home({ searchParams }: { searchParams: Promise<{ preview?: string; stage?: string }> }) {
  return <Suspense fallback={<CustomerPortal stage={DEFAULT_CUSTOMER_STAGE} />}><PreviewContent searchParams={searchParams} /></Suspense>;
}
