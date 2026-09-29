import { notFound } from "next/navigation";
import { WorkspaceDemo } from "@/components/workspace-demo";
import { isLocale } from "@/lib/i18n";

export default async function Workspace({ params }: PageProps<"/[locale]/workspace">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <WorkspaceDemo locale={locale} />;
}
