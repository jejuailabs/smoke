"use client";

import { useRef, useState } from "react";
import { checkArchivePreflight, maxArchiveBytes, type ArchivePreflight } from "@/lib/archive-preflight";
import type { Locale } from "@/lib/i18n";

type CheckState = ArchivePreflight | "checking" | "read_error" | null;

const texts = {
  ko: {
    badge: "DEMO · 파일 전송 없음", title: "제품 파일 사전 점검", intro: "ZIP 파일의 이름, 크기, 시작 바이트만 이 브라우저에서 확인합니다. 파일은 서버로 전송하거나 실행하지 않습니다.", product: "제품명", file: "제품 ZIP", limit: "최대 100 MB · .zip 파일", selected: "선택한 파일", status: "점검 결과", checking: "파일 시작 부분을 확인하는 중입니다.", ready_for_worker_scan: "기본 형식 확인 완료. 업로드와 격리 워커의 전체 검사는 아직 연결되지 않았습니다.", missing_file: "ZIP 파일을 선택하세요.", file_too_large: "파일이 100 MB 제한을 넘었습니다.", invalid_zip_header: "ZIP 확장자 또는 시작 바이트가 올바르지 않습니다.", read_error: "파일을 읽을 수 없습니다. 다른 파일을 선택하세요.", stages: "이후 필요한 단계", stage1: "비공개 저장소 업로드와 권한 확인", stage2: "격리 워커에서 압축파일 전체 검사", stage3: "격리 빌드·실행과 만료되는 미리보기", notice: "이 화면의 통과 표시는 안전성 검증이나 실행 가능 판정이 아닙니다. 전체 압축 검사와 실행은 별도 격리 환경에서만 진행해야 합니다." },
  en: {
    badge: "DEMO · no file transfer", title: "Product file preflight", intro: "Only the ZIP name, size, and opening bytes are checked in this browser. The file is neither uploaded nor executed.", product: "Product name", file: "Product ZIP", limit: "Up to 100 MB · .zip file", selected: "Selected file", status: "Preflight result", checking: "Checking the opening bytes.", ready_for_worker_scan: "Basic format check passed. Upload and full isolated-worker scanning are not connected yet.", missing_file: "Choose a ZIP file.", file_too_large: "The file exceeds the 100 MB limit.", invalid_zip_header: "The ZIP extension or opening bytes are invalid.", read_error: "The file could not be read. Choose another file.", stages: "Required next stages", stage1: "Private storage upload and permission check", stage2: "Full archive scan in an isolated worker", stage3: "Isolated build and expiring preview", notice: "Passing this check does not establish safety or runnability. The full archive scan and execution must happen in separate isolation." },
} as const;

export function IntakeDemo({ locale }: { locale: Locale }) {
  const t = texts[locale];
  const selection = useRef(0);
  const [productName, setProductName] = useState("");
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [status, setStatus] = useState<CheckState>(null);

  async function checkFile(file: File | undefined) {
    const current = ++selection.current;
    if (!file) { setFileInfo(null); setStatus("missing_file"); return; }
    setFileInfo({ name: file.name, size: file.size });
    if (file.size > maxArchiveBytes) { setStatus("file_too_large"); return; }
    setStatus("checking");
    try {
      const header = new Uint8Array(await file.slice(0, 4).arrayBuffer());
      if (current === selection.current) setStatus(checkArchivePreflight(file.name, file.size, header));
    } catch { if (current === selection.current) setStatus("read_error"); }
  }

  return <main className="workspace container"><div className="workspace-intro"><span className="demo-label">{t.badge}</span><h1>{t.title}</h1><p>{t.intro}</p></div>
    <div className="workspace-grid"><section className="surface"><h2>{t.file}</h2><div className="edit-fields"><label>{t.product}<input maxLength={100} value={productName} onChange={(event) => setProductName(event.target.value)} /></label><label>{t.file}<input type="file" accept=".zip,application/zip" onChange={(event) => void checkFile(event.target.files?.[0])} /></label></div><p className="project-hint">{t.limit}</p>{fileInfo && <p className="intake-filename">{t.selected}: <strong>{fileInfo.name}</strong> · {(fileInfo.size / 1024 / 1024).toFixed(2)} MB</p>}{status && <div className={`intake-status ${status === "ready_for_worker_scan" ? "ready" : ""}`} role="status"><strong>{t.status}</strong><p>{t[status]}</p></div>}</section>
    <section className="surface"><h2>{t.stages}</h2><ol className="intake-stages"><li>{t.stage1}</li><li>{t.stage2}</li><li>{t.stage3}</li></ol><p className="demo-notice">{t.notice}</p></section></div>
  </main>;
}
