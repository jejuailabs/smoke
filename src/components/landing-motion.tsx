"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Locale } from "@/lib/i18n";

// Update compositor transforms only when scrolling; no perpetual render loop.
function useScrollScene(paused: boolean) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = false;
    const paint = () => {
      frame = 0;
      const still = paused || reduced.matches;
      element.dataset.still = String(still);
      const rect = element.getBoundingClientRect();
      const progress = reduced.matches ? 0.65 : paused
        ? Number(element.style.getPropertyValue("--scene-progress") || "0.65")
        : Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - window.innerHeight)));
      element.style.setProperty("--scene-progress", String(progress));
      element.style.setProperty("--scene-turn", `${-24 + progress * 30}deg`);
      element.style.setProperty("--scene-tilt", `${16 - progress * 20}deg`);
      element.style.setProperty("--scene-spread", `${Math.sin(progress * Math.PI) * 95}px`);
      element.style.setProperty("--scene-scale", String(0.84 + progress * 0.2));
      element.style.setProperty("--scene-zoom", String(1 + progress * 0.17));
      element.dataset.chapter = String(Math.min(2, Math.floor(progress * 3)));
    };
    const schedule = () => { if (visible && !frame) frame = requestAnimationFrame(paint); };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      element.dataset.visible = String(visible);
      if (visible) schedule();
    });
    observer.observe(element);
    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reduced.addEventListener("change", paint);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduced.removeEventListener("change", paint);
    };
  }, [paused]);
  return ref;
}

const copy = {
  ko: {
    productTitle: <>흩어진 생각이,<br /><em>하나의 실행 화면으로.</em></>,
    productIntro: "제품 가설부터 실험과 판정까지. 각 단계가 연결되는 순간을 만나보세요.",
    chapters: ["가설을 설계하다", "반응을 모으다", "다음 행동을 정하다"],
    signalTitle: <>수많은 반응 속에서,<br /><em>의미 있는 신호를.</em></>,
    signalIntro: "노출, 방문, 가입. 서로 다른 숫자를 같은 기준으로 읽고 다음 실험의 근거를 만듭니다.",
    scroll: "스크롤하며 살펴보기", pause: "모션 멈추기", play: "모션 켜기", skip: "다음 내용으로 ↓",
    sample: "제품 흐름을 설명하는 예시 화면", hypothesis: "제품 가설", hypothesisText: "우리의 고객은 어떤 문제를 해결하고 싶을까?",
    experiment: "실험 반응", decision: "검증 기준", decisionText: "표본과 목표를 함께 확인", next: "내 제품으로 시작하기",
    signals: ["노출", "방문", "가입"],
  },
  en: {
    productTitle: <>Scattered ideas.<br /><em>One connected workspace.</em></>,
    productIntro: "From hypothesis to experiment to decision. See every step come together.",
    chapters: ["Frame the hypothesis", "Gather the response", "Decide what comes next"],
    signalTitle: <>Through all the noise.<br /><em>Find your signal.</em></>,
    signalIntro: "Impressions, visits, signups. Read different signals against shared criteria and build the case for your next test.",
    scroll: "Scroll to explore", pause: "Pause motion", play: "Enable motion", skip: "Continue below ↓",
    sample: "Illustrative product walkthrough", hypothesis: "Hypothesis", hypothesisText: "What problem does our customer want to solve?",
    experiment: "Experiment response", decision: "Validation criteria", decisionText: "Check samples and targets together", next: "Start with your product",
    signals: ["Impressions", "Visits", "Signups"],
  },
} as const;

export function LandingMotion({ locale, variant, publicBase }: { locale: Locale; variant: "product" | "signal"; publicBase: string }) {
  const t = copy[locale];
  const [paused, setPaused] = useState(false);
  const ref = useScrollScene(paused);
  const product = variant === "product";
  const target = product ? "simulation" : "workspace";
  return <section ref={ref} id={`motion-${variant}`} className={`cinema cinema-${variant}`} aria-label={product ? "LaunchOps product walkthrough" : "LaunchOps signal story"}>
    <div className="cinema-sticky">
      {!product && <Image className="cinema-backdrop" src={`${publicBase}/landing/signal-glass.webp`} alt="" fill sizes="100vw" unoptimized />}
      <div className="cinema-grain" aria-hidden="true" />
      <div className="container cinema-content">
        <div className="cinema-heading"><span className="landing-kicker">{product ? "01 / DESIGNED TO CONNECT" : "02 / CLARITY IN MOTION"}</span><h2>{product ? t.productTitle : t.signalTitle}</h2><p>{product ? t.productIntro : t.signalIntro}</p></div>
        {product ? <div className="cinema-device-stage" aria-hidden="true">
          <div className="cinema-device">
            <div className="cinema-device-bar"><span className="cinema-window-dots">● ● ●</span><span>LAUNCHOPS</span><span>WORKSPACE / 01</span></div>
            <div className="cinema-device-layout"><div className="cinema-sidebar"><b>L<span>↗</span></b><i /><i /><i /><i /><small>YOUR NEXT<br />LAUNCH.</small></div>
              <div className="cinema-device-main"><div className="cinema-device-label">PROJECT / NEXT BIG THING <span>● DEMO</span></div><h3>Make your next move.</h3>
                <div className="cinema-layer cinema-hypothesis"><span>01 / {t.hypothesis}</span><strong>{t.hypothesisText}</strong><div className="cinema-tags"><i>Audience</i><i>Problem</i><i>Value</i></div></div>
                <div className="cinema-layer cinema-experiment"><span>02 / {t.experiment}</span><div className="cinema-chart">{[28, 45, 35, 62, 53, 76, 67, 90, 82, 100].map((height, index) => <i key={index} style={{ "--bar-height": `${height}%`, "--bar-index": index } as CSSProperties} />)}</div><small>SAMPLE RESPONSE / 10 DAYS</small></div>
                <div className="cinema-layer cinema-decision"><span>03 / {t.decision}</span><div className="cinema-score">76<small>/100</small></div><p>{t.decisionText}</p><b>↗</b></div>
              </div>
            </div>
          </div><div className="cinema-device-shadow" />
        </div> : <div className="cinema-signal-art" aria-hidden="true">
          <svg className="cinema-signal-lines" viewBox="0 0 800 400" fill="none"><path d="M0 70 C260 70 230 200 510 200 S700 95 800 95" /><path d="M0 200 H800" /><path d="M0 330 C260 330 230 200 510 200 S700 305 800 305" /></svg>
          <div className="cinema-orbit orbit-one" /><div className="cinema-orbit orbit-two" />
          <div className="cinema-signal-core"><span>YOUR SIGNAL</span><strong>Clarity.</strong><i>FROM EVIDENCE TO ACTION</i></div>
          {t.signals.map((label, index) => <div key={label} className={`cinema-signal-chip signal-chip-${index}`}><i /><span>{label}</span><b>{["12.8k", "640", "96"][index]}</b></div>)}
        </div>}
        <div className="cinema-bottom"><div>{product ? <ol className="cinema-chapters">{t.chapters.map((label, index) => <li key={label}><span>0{index + 1}</span>{label}</li>)}</ol> : <a className="landing-button bright" href={`${publicBase}/experience/login.html`}>{t.next}<span>↗</span></a>}<p className="cinema-sample">{t.sample}</p></div><div className="cinema-controls"><span>{t.scroll}</span><button type="button" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? "▶" : "Ⅱ"} {paused ? t.play : t.pause}</button><a href={`#${target}`}>{t.skip}</a></div></div>
      </div><div className="cinema-progress" aria-hidden="true"><i /></div>
    </div>
  </section>;
}
