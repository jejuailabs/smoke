export const locales = ["ko", "en"] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export const copy = {
  ko: {
    nav: { product: "제품", workflow: "작동 방식", workspace: "검증 데모", experiments: "모의 실험", intake: "파일 점검", projects: "내 프로젝트", language: "English" },
    hero: { eyebrow: "바이브코딩 제품을 위한 출시 작업 공간", title: "반응을 검증한 뒤, 증거를 가지고 알리세요.", description: "제품을 살펴보고, 고객군과 메시지를 작게 테스트한 다음, 합의한 기준을 통과한 결과만 PR에 사용합니다.", primary: "데모 살펴보기", secondary: "흐름 보기" },
    flow: { title: "한 번의 출시를 검증 가능한 과정으로", steps: [
      { title: "제품 이해", body: "실행 화면과 사용 흐름을 확인하고 가설을 정리합니다." },
      { title: "반응 수집", body: "채널별 테스트와 제품 내 전환을 함께 봅니다." },
      { title: "기준 판정", body: "표본과 필수 전환 기준을 통과했는지 계산합니다." },
      { title: "근거로 PR", body: "확인된 수치만 주장에 연결하고 승인 후 배포합니다." },
    ] },
    principles: { title: "판정의 근거가 보이는 화면", items: ["표본이 부족하면 통과로 표시하지 않습니다.", "제품 미리보기 결과와 실제 고객 반응을 분리합니다.", "외부 지출과 발송은 사용자가 승인합니다."] },
    demo: { badge: "DEMO · 예시 데이터", title: "검증 작업 공간", intro: "이 화면은 제품 흐름을 검토하기 위한 데모입니다. 실제 채널 연결이나 발송은 수행하지 않습니다.", hypothesis: "검증 가설", audience: "고객군", message: "메시지", rule: "검증 기준", results: "판정 결과", score: "검증 점수", state: "판정", evidence: "근거", next: "다음 행동", channels: "채널 성과", sample: "표본", target: "목표", actual: "현재", status: { pass: "통과", insufficient: "근거 부족", fail: "반증", learning: "학습 중" }, actions: { edit: "가설 편집", save: "변경 저장", cancel: "취소", reset: "예시 복원" }, notice: "현재 화면에서만 유지되는 데모입니다. 실제 캠페인이나 PR 발송으로 연결되지 않습니다." },
    footer: "검증된 근거로 출시를 준비하세요.",
  },
  en: {
    nav: { product: "Product", workflow: "How it works", workspace: "Validation demo", experiments: "Mock experiment", intake: "File preflight", projects: "My projects", language: "한국어" },
    hero: { eyebrow: "A launch workspace for vibe coded products", title: "Validate the response. Share the evidence.", description: "Understand your product, test audiences and messages on a small scale, and use only results that pass your agreed thresholds for PR.", primary: "Explore demo", secondary: "See the flow" },
    flow: { title: "Make each launch a measurable process", steps: [
      { title: "Understand", body: "Review the product experience and define a hypothesis." },
      { title: "Collect", body: "Compare channel tests with product conversions." },
      { title: "Decide", body: "Check sample sizes and required conversion thresholds." },
      { title: "Communicate", body: "Tie claims to verified evidence and approve delivery." },
    ] },
    principles: { title: "Evidence behind every decision", items: ["Small samples cannot receive a passing result.", "Product preview observations stay separate from customer response.", "People approve external spending and delivery."] },
    demo: { badge: "DEMO · sample data", title: "Validation workspace", intro: "This demo lets you review the product flow. It does not connect channels or send messages.", hypothesis: "Hypothesis", audience: "Audience", message: "Message", rule: "Validation rules", results: "Decision", score: "Validation score", state: "Result", evidence: "Evidence", next: "Next action", channels: "Channel performance", sample: "Sample", target: "Target", actual: "Current", status: { pass: "Passed", insufficient: "Insufficient evidence", fail: "Disproved", learning: "Learning" }, actions: { edit: "Edit hypothesis", save: "Save changes", cancel: "Cancel", reset: "Restore sample" }, notice: "This demo persists only on the current page. It cannot start campaigns or distribute PR." },
    footer: "Prepare your launch with verified evidence.",
  },
} as const;
