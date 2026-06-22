import type { Metadata } from "next";
import { DocsPage } from "@/components/DocsPage";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Docs — ${APP_NAME}`,
  description: APP_DESCRIPTION,
};

export default function Page() {
  return <DocsPage />;
}
