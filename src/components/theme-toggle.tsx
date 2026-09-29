"use client";

import { useEffect, useRef } from "react";

export function ThemeToggle() {
  const select = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    const saved = localStorage.getItem("launchops-theme");
    if (saved === "light" || saved === "dark" || saved === "system") {
      document.documentElement.dataset.theme = saved;
      if (select.current) select.current.value = saved;
    }
  }, []);
  return <select ref={select} className="theme-select" aria-label="Theme" defaultValue="system" onChange={(event) => {
    document.documentElement.dataset.theme = event.target.value;
    localStorage.setItem("launchops-theme", event.target.value);
  }}>
    <option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option>
  </select>;
}
