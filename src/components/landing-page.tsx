import Image from "next/image";
import { LandingSimulator } from "@/components/landing-simulator";
import { LandingMotion } from "@/components/landing-motion";
import type { Locale } from "@/lib/i18n";

const content = {
  ko: {
    eyebrow: "THE INTELLIGENCE BEHIND YOUR NEXT LAUNCH",
    title: <>출시 전에 묻고,<br /><em>데이터로 답하다.</em></>,
    intro: "제품을 만드는 속도만큼, 시장을 이해하는 속도도 빨라져야 합니다. LaunchOps는 아이디어에서 검증, 그리고 설득력 있는 출시까지 하나의 흐름으로 연결합니다.",
    primary: "무료로 체험하기",
    secondary: "시뮬레이션 보기",
    heroNote: "직접 조작하는 데모 · 카드 등록 없음",
    metrics: ["제품 가설", "실험 데이터", "검증 기준", "PR 실행"],
    sectionEyebrow: "ONE CONNECTED WORKSPACE",
    sectionTitle: <>감각에 기대던 출시를<br />확인 가능한 과정으로.</>,
    sectionIntro: "어떤 고객에게 무엇을 말할지 정의하고, 작은 실험으로 반응을 살핀 다음, 확인된 근거로 다음 행동을 결정하세요.",
    steps: [
      { no: "01", title: "제품과 가설", body: "제품을 등록하고 고객군, 문제, 가치 제안과 성공 기준을 먼저 정합니다.", icon: "✦" },
      { no: "02", title: "작은 실험", body: "채널별 실험을 계획하고 노출부터 가입·활성화까지 성과를 기록합니다.", icon: "◉" },
      { no: "03", title: "명확한 판정", body: "최소 표본, 필수 지표와 목표를 함께 계산해 검증 상태를 보여줍니다.", icon: "↗" },
      { no: "04", title: "근거 있는 PR", body: "언론사를 고르고 보도자료를 작성해 발송과 후속 반응을 관리합니다.", icon: "✳" },
    ],
    workspaceEyebrow: "FROM SIGNAL TO STORY",
    workspaceTitle: "체험에서 실제 작업으로, 끊김 없이.",
    workspaceIntro: "로그인 없이 예시 프로젝트를 둘러본 뒤, Google 계정으로 시작하면 내 프로젝트와 실험 기록을 저장할 수 있습니다.",
    workspaceActions: ["제품 등록과 가설 설정", "실험 계획 및 수동 성과 기록", "검증 점수와 기준별 판정", "언론사 선택과 보도자료 초안"],
    demo: "로그인 없이 둘러보기",
    finalEyebrow: "READY WHEN YOU ARE",
    finalTitle: "다음 출시의 근거를 만들 시간.",
    finalIntro: "시뮬레이션으로 흐름을 확인하고, 내 제품으로 첫 실험을 시작하세요.",
    finalButton: "Google로 시작하기",
    caveat: "외부 광고 계정 연결과 자동 발송은 현재 제공되지 않습니다. 실제 성과는 직접 입력하고 확인합니다.",
  },
  en: {
    eyebrow: "THE INTELLIGENCE BEHIND YOUR NEXT LAUNCH",
    title: <>Ask before launch.<br /><em>Answer with evidence.</em></>,
    intro: "Market understanding should move as fast as product creation. LaunchOps connects your hypothesis, experiments, decisions, and launch story in one flow.",
    primary: "Try it free",
    secondary: "See the simulation",
    heroNote: "Hands-on demo · No card required",
    metrics: ["Hypothesis", "Experiment data", "Clear thresholds", "PR workflow"],
    sectionEyebrow: "ONE CONNECTED WORKSPACE",
    sectionTitle: <>Turn launch instinct<br />into a clear process.</>,
    sectionIntro: "Define who you serve and what you say. Run a small test, inspect the response, and make your next move with evidence.",
    steps: [
      { no: "01", title: "Product & hypothesis", body: "Register your product and define the audience, problem, value, and success criteria.", icon: "✦" },
      { no: "02", title: "Small experiments", body: "Plan channel tests and record the response from impressions through activation.", icon: "◉" },
      { no: "03", title: "Clear decision", body: "Check sample sizes, required metrics, and targets before calling a result validated.", icon: "↗" },
      { no: "04", title: "Evidence-led PR", body: "Select outlets, prepare a release, and track outreach and follow-up results.", icon: "✳" },
    ],
    workspaceEyebrow: "FROM SIGNAL TO STORY",
    workspaceTitle: "Move from demo to your own workspace.",
    workspaceIntro: "Explore sample projects without signing in. Start with Google to save your own projects and experiments.",
    workspaceActions: ["Product and hypothesis setup", "Experiment planning and manual metrics", "Validation score and rule decisions", "Outlet selection and release drafts"],
    demo: "Explore without signing in",
    finalEyebrow: "READY WHEN YOU ARE",
    finalTitle: "Build the case for your next launch.",
    finalIntro: "Explore the simulation, then start with your own product.",
    finalButton: "Continue with Google",
    caveat: "Ad account integrations and automatic delivery are not available yet. Record and verify actual results manually.",
  },
} as const;

export function LandingPage({ locale }: { locale: Locale }) {
  const t = content[locale];
  const publicBase = process.env.SITE_PREVIEW_EXPORT === "1" ? "/preview" : "";

  return <main className="landing">
    <section className="landing-hero" id="product"><Image className="landing-hero-image" src={`${publicBase}/landing/validation-hero.png`} alt="" aria-hidden="true" fill sizes="100vw" unoptimized preload /><div className="landing-hero-shade" aria-hidden="true" />
      <div className="container landing-hero-inner"><div className="landing-hero-content"><span className="landing-kicker"><i />{t.eyebrow}</span><h1>{t.title}</h1><p>{t.intro}</p><div className="landing-hero-actions"><a className="landing-button bright" href={`${publicBase}/experience/login.html`}>{t.primary}<span aria-hidden="true">↗</span></a><a className="landing-button ghost" href="#simulation">{t.secondary}<span aria-hidden="true">↓</span></a></div><div className="landing-hero-note"><span className="landing-note-icon">✓</span>{t.heroNote}</div></div></div>
      <div className="landing-hero-rail container">{t.metrics.map((metric, index) => <span key={metric}><b>0{index + 1}</b>{metric}</span>)}</div>
    </section>

    <section className="landing-solution" id="solution"><div className="container"><div className="landing-section-head"><div><span className="landing-kicker dark">{t.sectionEyebrow}</span><h2>{t.sectionTitle}</h2></div><p>{t.sectionIntro}</p></div><div className="landing-step-grid">{t.steps.map(step => <article className="landing-step" key={step.no}><div className="landing-step-top"><span>{step.no} / 04</span><i aria-hidden="true">{step.icon}</i></div><h3>{step.title}</h3><p>{step.body}</p><span className="landing-step-arrow" aria-hidden="true">↗</span></article>)}</div></div></section>

    <LandingMotion locale={locale} variant="product" publicBase={publicBase} />
    <LandingSimulator locale={locale} />
    <LandingMotion locale={locale} variant="signal" publicBase={publicBase} />

    <section className="landing-workspace" id="workspace"><div className="container landing-workspace-grid"><div className="landing-workspace-visual" aria-hidden="true"><div className="workspace-window"><div className="workspace-window-head"><span><i /><i /><i /></span><b>LaunchOps / workspace</b></div><div className="workspace-window-body"><div className="workspace-mini-side"><span /><span /><span /><span /></div><div className="workspace-mini-main"><div className="workspace-mini-label" /><div className="workspace-mini-title" /><div className="workspace-mini-cards"><div><span /><strong>76</strong><i /></div><div><span /><strong>3/4</strong><i /></div></div><div className="workspace-mini-chart"><i /><i /><i /><i /><i /><i /><i /></div></div></div></div><div className="workspace-floating-card"><span className="workspace-floating-dot" /> VALIDATION READY <strong>↗</strong></div></div><div className="landing-workspace-copy"><span className="landing-kicker dark">{t.workspaceEyebrow}</span><h2>{t.workspaceTitle}</h2><p>{t.workspaceIntro}</p><ul>{t.workspaceActions.map(item => <li key={item}><span>✓</span>{item}</li>)}</ul><div className="landing-workspace-actions"><a className="landing-button dark" href={`${publicBase}/experience/login.html`}>{t.primary} <span aria-hidden="true">↗</span></a><a className="landing-text-link" href={`${publicBase}/experience/projects.html`}>{t.demo} →</a></div></div></div></section>

    <section className="landing-final"><div className="container landing-final-inner"><div><span className="landing-kicker">{t.finalEyebrow}</span><h2>{t.finalTitle}</h2><p>{t.finalIntro}</p></div><a className="landing-button bright" href={`${publicBase}/experience/login.html`}>{t.finalButton}<span aria-hidden="true">↗</span></a></div><p className="container landing-caveat">{t.caveat}</p></section>
  </main>;
}
