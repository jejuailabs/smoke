"use client";

import { useEffect } from "react";

export function ExperienceEntry({ destination, locale }: { destination: string; locale: "ko" | "en" }) {
  useEffect(() => {
    // The reference workspace is a standalone HTML application, not a Next route.
    window.location.replace(destination);
  }, [destination]);
  return <main className="workspace container"><h1>{locale === "ko" ? "내 작업공간으로 이동합니다" : "Opening your workspace"}</h1><a className="button primary" href={destination}>{locale === "ko" ? "작업공간 열기" : "Open workspace"}</a></main>;
}
