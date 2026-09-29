import { notFound } from "next/navigation";
import { ExperienceEntry } from "@/components/experience-entry";
import { isLocale } from "@/lib/i18n";

export default async function Projects({ params }: PageProps<"/[locale]/projects">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const publicBase = process.env.SITE_PREVIEW_EXPORT === "1" ? "/preview" : "";
  return <ExperienceEntry locale={locale} destination={`${publicBase}/experience/projects.html`} />;
}
