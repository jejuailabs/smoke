import { notFound } from "next/navigation";
import { LandingPage } from "@/components/landing-page";
import { isLocale } from "@/lib/i18n";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LandingPage locale={locale} />;
}
