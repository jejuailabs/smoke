import { notFound } from "next/navigation";
import { IntakeDemo } from "@/components/intake-demo";
import { isLocale } from "@/lib/i18n";

export default async function Intake({ params }: PageProps<"/[locale]/intake">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <IntakeDemo locale={locale} />;
}
