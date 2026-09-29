"use client";

import { useState } from "react";
import { copy, type Locale } from "@/lib/i18n";
import { evaluate, exampleMetrics, type Metric } from "@/lib/validation";

type Hypothesis = { audience: string; message: string };
const examples: Record<Locale, Hypothesis> = {
  ko: { audience: "첫 SaaS 출시를 준비하는 1인 창업자", message: "고객 반응을 검증한 뒤, 증거가 있는 출시 이야기를 만드세요." },
  en: { audience: "Solo founders preparing their first SaaS launch", message: "Validate customer response before writing your launch story." },
};

export function WorkspaceDemo({ locale }: { locale: Locale }) {
  const t = copy[locale].demo;
  const [hypothesis, setHypothesis] = useState<Hypothesis>(examples[locale]);
  const [draft, setDraft] = useState<Hypothesis>(examples[locale]);
  const [editing, setEditing] = useState(false);
  const [metrics, setMetrics] = useState<Metric[]>(exampleMetrics);
  const result = evaluate(metrics);
  const nextAction = {
    ko: { pass: "근거를 확인한 뒤 PR 초안을 검토하세요.", insufficient: "최소 표본을 채운 뒤 다시 판정하세요.", fail: "핵심 전환이 하한선보다 낮습니다. 가설을 재검토하세요.", learning: "필수 활성화 기준을 더 검증하세요." },
    en: { pass: "Review evidence before drafting PR.", insufficient: "Collect the minimum sample before deciding.", fail: "A core conversion is below its lower bound. Revisit the hypothesis.", learning: "Gather more activation evidence before PR." },
  }[locale][result.decision];
  function save() {
    const next = { audience: draft.audience.trim(), message: draft.message.trim() };
    if (!next.audience || !next.message) return;
    setHypothesis(next); setEditing(false);
  }
  function reset() {
    setHypothesis(examples[locale]); setDraft(examples[locale]); setMetrics(exampleMetrics); setEditing(false);
  }
  return <main className="workspace container">
    <div className="workspace-intro"><span className="demo-label">{t.badge}</span><h1>{t.title}</h1><p>{t.intro}</p></div>
    <div className="workspace-grid"><section className="surface hypothesis-card"><div className="card-heading"><div><span className="overline">01 / INPUT</span><h2>{t.hypothesis}</h2></div><button className="text-button" onClick={() => { setDraft(hypothesis); setEditing(true); }}>{t.actions.edit}</button></div>
      {editing ? <div className="edit-fields"><label>{t.audience}<input value={draft.audience} maxLength={160} onChange={(event) => setDraft({ ...draft, audience: event.target.value })} /></label><label>{t.message}<textarea value={draft.message} maxLength={300} rows={3} onChange={(event) => setDraft({ ...draft, message: event.target.value })} /></label><div className="form-actions"><button className="button primary" onClick={save} disabled={!draft.audience.trim() || !draft.message.trim()}>{t.actions.save}</button><button className="button secondary" onClick={() => setEditing(false)}>{t.actions.cancel}</button></div></div> : <dl className="hypothesis-values"><dt>{t.audience}</dt><dd>{hypothesis.audience}</dd><dt>{t.message}</dt><dd>{hypothesis.message}</dd></dl>}
    </section>
    <section className="surface decision-card"><span className="overline">02 / DECISION</span><h2>{t.results}</h2><div className="score-number">{result.score}<small>/100</small></div><div className={`decision-chip ${result.decision}`}>{t.status[result.decision]}</div><p className="decision-explain">{result.passed}/{result.total} {locale === "ko" ? "기준 충족" : "rules met"}</p><p className="decision-next">{nextAction}</p></section></div>
    <section className="surface rules-card"><div className="card-heading"><div><span className="overline">03 / EVIDENCE</span><h2>{t.rule}</h2></div><button className="text-button" onClick={reset}>{t.actions.reset}</button></div><p className="rules-help">{locale === "ko" ? "현재값과 표본을 바꿔 판정 변화를 확인하세요. 최소 표본과 필수 기준이 우선합니다." : "Change current values and samples to see the decision respond. Minimum samples and required rules take priority."}</p><div className="table-wrap"><table><thead><tr><th>{t.evidence}</th><th>{t.actual}</th><th>{t.target}</th><th>{t.sample}</th><th>{t.state}</th></tr></thead><tbody>{metrics.map((metric, index) => <tr key={metric.id}><th scope="row">{metric.label}{metric.required && <span className="required">{locale === "ko" ? "필수" : "Required"}</span>}</th><td><label className="sr-only" htmlFor={`value-${metric.id}`}>{metric.label} {t.actual}</label><input id={`value-${metric.id}`} className="metric-input" type="number" min="0" step="0.1" value={metric.actual} onChange={(event) => setMetrics((current) => current.map((item, i) => i === index ? { ...item, actual: Number(event.target.value) } : item))} />{metric.unit}</td><td>{metric.target}{metric.unit}</td><td><label className="sr-only" htmlFor={`sample-${metric.id}`}>{metric.label} {t.sample}</label><input id={`sample-${metric.id}`} className="metric-input sample-input" type="number" min="0" step="1" value={metric.sample} onChange={(event) => setMetrics((current) => current.map((item, i) => i === index ? { ...item, sample: Math.max(0, Math.floor(Number(event.target.value))) } : item))} /> / {metric.minimumSample.toLocaleString(locale)}</td><td><span className={`rule-status ${metric.sample < metric.minimumSample ? "insufficient" : metric.actual >= metric.target ? "pass" : "learning"}`}>{metric.sample < metric.minimumSample ? t.status.insufficient : metric.actual >= metric.target ? t.status.pass : t.status.learning}</span></td></tr>)}</tbody></table></div></section>
    <section className="surface release-card"><span className="overline">04 / PR</span><h2>{locale === "ko" ? "근거 기반 PR 미리보기" : "Evidence-based PR preview"}</h2>{result.decision === "pass" ? <><p>{locale === "ko" ? "예시 수치로 구성한 초안입니다. 주장마다 사용한 근거를 표시하며 실제 발송 기능은 없습니다." : "A draft from sample metrics. Every claim shows its evidence; no delivery is available."}</p><h3>{hypothesis.message}</h3><ul>{metrics.filter((metric) => metric.actual >= metric.target && metric.sample >= metric.minimumSample).map((metric) => <li key={metric.id}><strong>{metric.label}: {metric.actual}{metric.unit}</strong><span>DEMO-{metric.id} · {metric.sample.toLocaleString(locale)} {locale === "ko" ? "표본" : "samples"}</span></li>)}</ul></> : <p>{locale === "ko" ? "필수 기준과 최소 표본을 통과하면 검토 가능한 초안을 표시합니다." : "A reviewable draft appears after required rules and minimum samples pass."}</p>}</section>
    <p className="demo-notice">{t.notice}</p>
  </main>;
}
