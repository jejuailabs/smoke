import { notFound } from "next/navigation";
import { ProjectApp } from "@/components/project-app";
import { isLocale } from "@/lib/i18n";

export default async function Projects({ params }: PageProps<"/[locale]/projects">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <ProjectApp locale={locale} />;
}
