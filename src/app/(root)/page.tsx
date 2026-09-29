import { LandingPage } from "@/components/landing-page";

export const metadata = {
  title: "LaunchOps — 반응을 검증하고 알리세요",
  description: "제품 가설, 실험, 검증 기준과 PR 준비를 하나의 작업공간에서 관리하세요.",
};

export default function Home() {
  return <LandingPage locale="ko" />;
}
