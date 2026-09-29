import type { Metadata } from "next";
import Link from "next/link";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { copy, isLocale, locales } from "@/lib/i18n";
import "../globals.css";
import "../landing.css";
import "../landing-motion.css";

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
  const publicBase = process.env.SITE_PREVIEW_EXPORT === "1" ? "/preview" : "";
  return <html lang={locale} className={pretendard.variable} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('launchops-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}" }} /></head><body>
    <header className="site-header"><div className="container header-inner">
      <Link className="brand" href={`/${locale}`} aria-label="LaunchOps"><span className="brand-mark" aria-hidden="true">↗</span> LaunchOps</Link>
      <nav aria-label="Main navigation" className="site-nav"><Link href={`/${locale}#solution`}>{locale === "ko" ? "솔루션" : "Solution"}</Link><Link href={`/${locale}#simulation`}>{locale === "ko" ? "시뮬레이션" : "Simulation"}</Link><Link href={`/${locale}#workspace`}>{locale === "ko" ? "작업공간" : "Workspace"}</Link><Link href={`/${locale}/intake`}>{t.nav.intake}</Link></nav>
      <div className="header-actions"><Link className="lang-link" href={`/${other}`}>{t.nav.language}</Link><ThemeToggle /><a className="header-cta" href={`${publicBase}/experience/login.html`}>{locale === "ko" ? "체험하기" : "Try it"} <span aria-hidden="true">↗</span></a></div>
    </div></header>
    {children}
    <footer className="site-footer"><div className="container footer-inner"><span>LaunchOps</span><span>{t.footer} · <Link href={`/${locale}/workspace`}>{t.nav.workspace}</Link></span></div></footer>
  </body></html>;
}
