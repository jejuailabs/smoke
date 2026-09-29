import Link from "next/link";
import { notFound } from "next/navigation";
import { copy, isLocale } from "@/lib/i18n";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = copy[locale];
  return <main>
    <section className="hero container" id="product"><div className="hero-copy"><span className="eyebrow">● {t.hero.eyebrow}</span><h1>{t.hero.title}</h1><p>{t.hero.description}</p><div className="hero-actions"><Link className="button primary" href={`/${locale}/workspace`}>{t.hero.primary} <span aria-hidden="true">↗</span></Link><Link className="button secondary" href="#workflow">{t.hero.secondary}</Link></div></div>
      <div className="hero-panel" aria-label={t.demo.badge}><div className="panel-top"><span>launchops / validation</span><span className="demo-dot">{t.demo.badge}</span></div><div className="panel-content"><span className="overline">{t.demo.results}</span><div className="panel-score">92<span>/100</span></div><div className="panel-line"><span>Meta</span><strong>84</strong></div><div className="panel-line"><span>YouTube</span><strong>68</strong></div><div className="panel-line"><span>Reddit</span><strong>64</strong></div><div className="panel-note">{t.principles.items[0]}</div></div></div>
    </section>
    <section className="section-muted" id="workflow"><div className="container"><div className="section-heading"><span className="overline">WORKFLOW</span><h2>{t.flow.title}</h2></div><div className="steps">{t.flow.steps.map((step, i) => <article className="step-card" key={step.title}><span className="step-no">0{i + 1}</span><h3>{step.title}</h3><p>{step.body}</p></article>)}</div></div></section>
    <section className="container principles"><div><span className="overline">TRUST</span><h2>{t.principles.title}</h2></div><ul>{t.principles.items.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul></section>
    <section className="container bottom-cta"><div><span className="overline">LAUNCHOPS DEMO</span><h2>{t.demo.title}</h2><p>{t.demo.intro}</p></div><Link className="button lime" href={`/${locale}/workspace`}>{t.hero.primary} <span aria-hidden="true">↗</span></Link></section>
  </main>;
}
