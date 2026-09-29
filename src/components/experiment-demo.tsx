"use client";

import { useEffect, useState } from "react";
import { channelIds, runMockExperiment, type ChannelId, type ExperimentInput } from "@/lib/mock-experiment";
import { addDemoRun, demoHistoryKey, parseDemoHistory, type DemoRun } from "@/lib/demo-history";
import type { Locale } from "@/lib/i18n";

const texts = {
  ko: { badge: "DEMO · 실제 비용 없음", title: "모의 검증 캠페인", intro: "고객군과 메시지를 정하고 채널을 선택하세요. 고정된 예시 모형으로 성과를 계산하며 광고를 집행하지 않습니다.", audience: "고객군", message: "테스트할 메시지", budget: "모의 예산 (USD)", channels: "채널", run: "모의 실험 실행", result: "모의 실험 결과", spend: "사용 예산", impressions: "노출", clicks: "클릭", sessions: "방문", signups: "가입", activations: "활성화", sample: "표본", decision: "검증 판정", insufficient: "근거 부족", learning: "학습 중", pass: "통과", fail: "반증", source: "데이터 출처: DEMO_MOCK_ADAPTER · 실제 채널 데이터 아님", limitation: "이 결과는 사용 흐름 확인용입니다. 실제 고객 반응이나 PR 주장에 사용할 수 없습니다.", error: "고객군·메시지·예산(1~1,000 USD)·채널을 확인하세요.", history: "최근 모의 실험", historyHelp: "최대 10개를 이 브라우저에만 저장합니다. 다른 기기와 동기화되지 않습니다.", empty: "저장된 모의 실험이 없습니다.", reopen: "다시 보기", clear: "기록 지우기", saveError: "브라우저 저장 공간을 사용할 수 없어 이번 결과는 저장되지 않았습니다.", version: "계산 규칙", runId: "실행 ID", created: "계산 시각", evidence: "모의 근거 기록", evidenceHelp: "아래 각 행은 선택한 채널의 고정 모형 출력입니다. 외부 플랫폼에서 수집한 자료가 아닙니다." },
  en: { badge: "DEMO · no real spend", title: "Mock validation campaign", intro: "Choose an audience, message, and channels. A fixed sample model calculates results without running ads.", audience: "Audience", message: "Message to test", budget: "Mock budget (USD)", channels: "Channels", run: "Run mock experiment", result: "Mock experiment result", spend: "Spend", impressions: "Impressions", clicks: "Clicks", sessions: "Visits", signups: "Signups", activations: "Activations", sample: "samples", decision: "Validation decision", insufficient: "Insufficient evidence", learning: "Learning", pass: "Passed", fail: "Disproved", source: "Source: DEMO_MOCK_ADAPTER · not real channel data", limitation: "This result is for reviewing the workflow. It cannot support customer demand or PR claims.", error: "Check the audience, message, budget (1–1,000 USD), and channels.", history: "Recent mock runs", historyHelp: "Up to 10 runs are saved in this browser only. They do not sync to other devices.", empty: "No saved mock runs yet.", reopen: "Open", clear: "Clear history", saveError: "Browser storage is unavailable, so this result was not saved.", version: "Calculation version", runId: "Run ID", created: "Calculated at", evidence: "Mock evidence record", evidenceHelp: "Each row below is fixed-model output for a selected channel, not data collected from an external platform." },
} as const;

const channelNames: Record<ChannelId, string> = { meta: "Meta", youtube: "YouTube", reddit: "Reddit" };

export function ExperimentDemo({ locale }: { locale: Locale }) {
  const t = texts[locale];
  const [input, setInput] = useState<ExperimentInput>({
    audience: locale === "ko" ? "초기 SaaS 창업자" : "Early SaaS founders",
    message: locale === "ko" ? "근거를 갖고 출시하세요" : "Launch with evidence",
    budgetUsd: 300,
    channels: [...channelIds],
  });
  const [result, setResult] = useState<ReturnType<typeof runMockExperiment> | null>(null);
  const [activeRun, setActiveRun] = useState<DemoRun | null>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<DemoRun[]>([]);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setHistory(parseDemoHistory(localStorage.getItem(demoHistoryKey))); } catch { /* Private browsing may disable storage. */ }
      setStorageReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function toggleChannel(id: ChannelId) {
    setInput((current) => ({ ...current, channels: current.channels.includes(id) ? current.channels.filter((item) => item !== id) : [...current.channels, id] }));
    setResult(null);
  }
  function run(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const nextResult = runMockExperiment(input);
      setResult(nextResult); setError("");
      const nextHistory = addDemoRun(history, input, crypto.randomUUID(), new Date().toISOString());
      setActiveRun(nextHistory[0]);
      if (storageReady) {
        try {
          localStorage.setItem(demoHistoryKey, JSON.stringify(nextHistory));
          setHistory(nextHistory);
        } catch { setError(t.saveError); }
      }
    }
    catch { setResult(null); setError(t.error); }
  }

  function reopen(run: DemoRun) {
    setInput(run.input);
    setResult(runMockExperiment(run.input));
    setActiveRun(run);
    setError("");
  }

  function clearHistory() {
    try { localStorage.removeItem(demoHistoryKey); setHistory([]); setError(""); }
    catch { setError(t.saveError); }
  }

  return <main className="workspace container"><div className="workspace-intro"><span className="demo-label">{t.badge}</span><h1>{t.title}</h1><p>{t.intro}</p></div>
    <section className="surface"><form className="experiment-form" onSubmit={run}>
      <label>{t.audience}<input required maxLength={160} value={input.audience} onChange={(event) => { setInput({ ...input, audience: event.target.value }); setResult(null); }} /></label>
      <label>{t.message}<input required maxLength={300} value={input.message} onChange={(event) => { setInput({ ...input, message: event.target.value }); setResult(null); }} /></label>
      <label>{t.budget}<input required type="number" min="1" max="1000" step="0.01" value={input.budgetUsd} onChange={(event) => { setInput({ ...input, budgetUsd: Number(event.target.value) }); setResult(null); }} /></label>
      <fieldset><legend>{t.channels}</legend><div className="channel-options">{channelIds.map((id) => <label key={id}><input type="checkbox" checked={input.channels.includes(id)} onChange={() => toggleChannel(id)} />{channelNames[id]}</label>)}</div></fieldset>
      <div><button className="button primary" type="submit">{t.run}</button></div>
    </form>{error && <p role="alert" className="form-error">{error}</p>}</section>
    <section className="surface experiment-history"><div className="card-heading"><div><span className="overline">DEMO / HISTORY</span><h2>{t.history}</h2></div>{history.length > 0 && <button className="text-button" type="button" onClick={clearHistory}>{t.clear}</button>}</div><p className="rules-help">{t.historyHelp}</p>{storageReady && (history.length ? <ul>{history.map((run) => <li key={run.id}><div><strong>{run.input.audience}</strong><span>{new Date(run.createdAt).toLocaleString(locale)} · {run.input.channels.map((id) => channelNames[id]).join(", ")} · {t.version}: {run.calculationVersion}</span></div><button className="button secondary" type="button" onClick={() => reopen(run)}>{t.reopen}</button></li>)}</ul> : <p>{t.empty}</p>)}</section>
    {result && <section className="surface experiment-results" aria-live="polite"><div className="card-heading"><div><span className="overline">DEMO / RESULT</span><h2>{t.result}</h2></div><span className={`decision-chip ${result.validation.decision}`}>{t[result.validation.decision]}</span></div><p className="rules-help">{t.source}</p>{activeRun && <p className="result-metadata">{t.runId}: {activeRun.id} · {t.created}: {new Date(activeRun.createdAt).toLocaleString(locale)} · {t.version}: {result.validation.calculationVersion}</p>}
      <div className="metric-summary"><div><strong>${result.totals.spendUsd.toFixed(2)}</strong><span>{t.spend}</span></div><div><strong>{result.totals.landingSessions.toLocaleString(locale)}</strong><span>{t.sessions}</span></div><div><strong>{result.totals.signups.toLocaleString(locale)}</strong><span>{t.signups}</span></div><div><strong>{result.totals.activations.toLocaleString(locale)}</strong><span>{t.activations}</span></div></div>
      <div className="table-wrap"><table><thead><tr><th>{t.channels}</th><th>{t.spend}</th><th>{t.impressions}</th><th>{t.clicks}</th><th>{t.sessions}</th><th>{t.signups}</th><th>{t.activations}</th></tr></thead><tbody>{result.channels.map((row) => <tr key={row.channel}><th scope="row">{channelNames[row.channel]}</th><td>${row.spendUsd.toFixed(2)}</td><td>{row.impressions.toLocaleString(locale)}</td><td>{row.clicks.toLocaleString(locale)}</td><td>{row.landingSessions.toLocaleString(locale)}</td><td>{row.signups.toLocaleString(locale)}</td><td>{row.activations.toLocaleString(locale)}</td></tr>)}</tbody></table></div>
      <div className="mock-decision"><strong>{t.decision}: {t[result.validation.decision]} · {result.validation.score}/100</strong><ul>{result.rules.map((rule) => <li key={rule.id}>{rule.label}: {rule.actual.toFixed(1)}% / {rule.target}% · {rule.sample.toLocaleString(locale)} / {rule.minimumSample.toLocaleString(locale)} {t.sample}</li>)}</ul></div><div className="mock-evidence"><h3>{t.evidence}</h3><p>{t.evidenceHelp}</p><ul>{result.channels.map((row) => <li key={row.channel}><strong>{channelNames[row.channel]}</strong><span>{row.source} · {t.sessions} {row.landingSessions.toLocaleString(locale)} · {t.signups} {row.signups.toLocaleString(locale)} · {t.activations} {row.activations.toLocaleString(locale)}</span></li>)}</ul></div><p className="demo-notice">{t.limitation}</p>
    </section>}
  </main>;
}
