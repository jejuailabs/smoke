import { notFound } from "next/navigation";
import { ExperimentDemo } from "@/components/experiment-demo";
import { isLocale } from "@/lib/i18n";

export default async function Experiments({ params }: PageProps<"/[locale]/experiments">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <ExperimentDemo locale={locale} />;
}
