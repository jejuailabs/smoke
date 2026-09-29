import type { Metadata } from "next";
import Link from "next/link";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { copy, isLocale, locales } from "@/lib/i18n";
import "../globals.css";

const pretendard = localFont({
  src: "../fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

export function generateStaticParams() { return locales.map((locale) => ({ locale })); }

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: locale === "ko" ? "LaunchOps — 반응을 검증하고 알리세요" : "LaunchOps — Validate before you amplify", description: copy[locale].hero.description };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = copy[locale];
  const other = locale === "ko" ? "en" : "ko";
  return <html lang={locale} className={pretendard.variable} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('launchops-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}" }} /></head><body>
    <header className="site-header"><div className="container header-inner">
      <Link className="brand" href={`/${locale}`} aria-label="LaunchOps"><span className="brand-mark" aria-hidden="true">↗</span> LaunchOps</Link>
      <nav aria-label="Main navigation" className="site-nav"><Link href={`/${locale}#product`}>{t.nav.product}</Link><Link href={`/${locale}#workflow`}>{t.nav.workflow}</Link><Link href={`/${locale}/workspace`}>{t.nav.workspace}</Link><Link href={`/${locale}/experiments`}>{t.nav.experiments}</Link><Link href={`/${locale}/intake`}>{t.nav.intake}</Link><Link href={`/${locale}/projects`}>{t.nav.projects}</Link></nav>
      <div className="header-actions"><Link className="lang-link" href={`/${other}`}>{t.nav.language}</Link><ThemeToggle /></div>
    </div></header>
    {children}
    <footer className="site-footer"><div className="container footer-inner"><span>LaunchOps</span><span>{t.footer}</span></div></footer>
  </body></html>;
}
