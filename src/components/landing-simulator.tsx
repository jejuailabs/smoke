"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { runMockExperiment, type ChannelId } from "@/lib/mock-experiment";
import type { Locale } from "@/lib/i18n";

const labels = {
  ko: {
    eyebrow: "LIVE SIMULATION · SAMPLE DATA",
    title: "작게 시험하고, 기준으로 판단하세요.",
    intro: "채널과 예산을 바꾸면 예시 반응과 검증 점수가 즉시 다시 계산됩니다.",
    channel: "테스트 채널",
    budget: "모의 예산",
    signals: "예상 반응 흐름",
    impressions: "노출",
    visits: "방문",
    signups: "가입",
    activations: "활성화",
    score: "검증 점수",
    decision: { pass: "기준 통과", insufficient: "표본 부족", fail: "반증", learning: "관찰 중" },
    notice: "예시 데이터로 계산한 시뮬레이션입니다. 광고비 지출이나 실제 고객 반응은 발생하지 않습니다.",
    detail: "시뮬레이션 자세히 보기",
  },
  en: {
    eyebrow: "LIVE SIMULATION · SAMPLE DATA",
    title: "Test small. Decide with clear thresholds.",
    intro: "Change a channel or budget to recalculate sample responses and validation score.",
    channel: "Test channel",
    budget: "Simulated budget",
    signals: "Projected response funnel",
    impressions: "Impressions",
    visits: "Visits",
    signups: "Signups",
    activations: "Activations",
    score: "Validation score",
    decision: { pass: "Passed", insufficient: "More samples needed", fail: "Disproved", learning: "Learning" },
    notice: "Calculated from sample data. No ad spend or real customer response occurs.",
    detail: "Explore the full simulation",
  },
} as const;

const channels: { id: ChannelId; name: string }[] = [
  { id: "meta", name: "Meta" },
  { id: "youtube", name: "YouTube" },
  { id: "reddit", name: "Reddit" },
];

export function LandingSimulator({ locale }: { locale: Locale }) {
  const t = labels[locale];
  const [channel, setChannel] = useState<ChannelId>("meta");
  const [budget, setBudget] = useState(180);
  const simulation = useMemo(() => runMockExperiment({
    audience: "Early-stage founders",
    message: "Validate before launch",
    budgetUsd: budget,
    channels: [channel],
  }), [budget, channel]);
  const { totals, validation } = simulation;
  const values = [
    { label: t.impressions, value: totals.impressions },
    { label: t.visits, value: totals.landingSessions },
    { label: t.signups, value: totals.signups },
    { label: t.activations, value: totals.activations },
  ];

  return <section className="landing-simulation" id="simulation">
    <div className="container simulation-layout">
      <div className="simulation-copy">
        <span className="landing-kicker">{t.eyebrow}</span>
        <h2>{t.title}</h2>
        <p>{t.intro}</p>
        <div className="sim-control"><span>{t.channel}</span><div className="sim-segments" role="group" aria-label={t.channel}>{channels.map(item => <button key={item.id} type="button" className={item.id === channel ? "active" : ""} aria-pressed={item.id === channel} onClick={() => setChannel(item.id)}>{item.name}</button>)}</div></div>
        <label className="sim-control sim-budget"><span>{t.budget} <strong>${budget}</strong></span><input type="range" min="80" max="600" step="20" value={budget} onChange={event => setBudget(Number(event.target.value))} /></label>
        <p className="sim-notice">{t.notice}</p>
        <Link className="landing-text-link" href={`/${locale}/experiments`}>{t.detail} <span aria-hidden="true">↗</span></Link>
      </div>
      <div className="sim-dashboard" aria-live="polite">
        <div className="sim-dash-head"><span className="sim-live-dot" /> LAUNCHOPS / VALIDATION <span>DEMO</span></div>
        <div className="sim-dash-body"><div className="sim-score-panel"><div><span>{t.score}</span><strong>{validation.score}<small>/100</small></strong></div><span className={`sim-decision ${validation.decision}`}>{t.decision[validation.decision]}</span></div>
          <div className="sim-funnel"><h3>{t.signals}</h3>{values.map((item, index) => <div className="sim-funnel-row" key={item.label}><span>{item.label}</span><div className="sim-track"><i style={{ width: `${Math.max(7, Math.round(item.value / (totals.impressions || 1) * 100 * (index ? 2.8 : 1)))}%` }} /></div><strong>{item.value.toLocaleString(locale === "ko" ? "ko-KR" : "en-US")}</strong></div>)}</div>
          <div className="sim-bottom"><span>RULE 01 · SIGNUP RATE</span><strong>{simulation.rules[0].actual.toFixed(1)}%</strong><span>RULE 02 · ACTIVATION</span><strong>{simulation.rules[1].actual.toFixed(1)}%</strong></div>
        </div>
      </div>
    </div>
  </section>;
}
