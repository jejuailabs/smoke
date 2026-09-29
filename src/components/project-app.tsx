"use client";

import { useEffect, useState } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { addDoc, collection, doc, getDoc, onSnapshot, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { getFirebaseClient } from "@/lib/firebase-client";
import type { Locale } from "@/lib/i18n";

type Project = { id: string; name: string; market: string; category: string };
const labels = {
  ko: { title: "내 프로젝트", intro: "제품 검증을 시작할 프로젝트를 등록하세요.", setup: "Firebase 환경 설정이 필요합니다. README의 설정 순서를 확인하세요.", login: "Google로 로그인", logout: "로그아웃", loading: "계정을 확인하는 중…", name: "제품명", market: "목표 시장", category: "카테고리", create: "프로젝트 만들기", empty: "아직 프로젝트가 없습니다.", error: "요청을 완료하지 못했습니다. Firebase 설정과 권한을 확인하세요.", saved: "프로젝트가 저장되었습니다.", projectHint: "채널 실험과 샌드박스 실행은 다음 구현 단계에서 연결됩니다." },
  en: { title: "My projects", intro: "Register a product to begin validation.", setup: "Firebase configuration is required. Follow the setup steps in README.", login: "Sign in with Google", logout: "Sign out", loading: "Checking your account…", name: "Product name", market: "Target market", category: "Category", create: "Create project", empty: "No projects yet.", error: "The request failed. Check Firebase setup and permissions.", saved: "Project saved.", projectHint: "Channel experiments and sandbox previews will be connected in a later phase." },
} as const;

export function ProjectApp({ locale }: { locale: Locale }) {
  const t = labels[locale];
  const client = getFirebaseClient();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [market, setMarket] = useState("");
  const [category, setCategory] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!client) return;
    let active = true;
    const unsubscribe = onAuthStateChanged(client.auth, async (current) => {
      if (current) {
        try {
          await setDoc(doc(client.db, "users", current.uid), { email: current.email, displayName: current.displayName, photoURL: current.photoURL, updatedAt: serverTimestamp() }, { merge: true });
          const workspaceRef = doc(client.db, "workspaces", current.uid);
          if (!(await getDoc(workspaceRef)).exists()) {
            await setDoc(workspaceRef, { ownerId: current.uid, memberIds: [current.uid], memberRoles: { [current.uid]: "owner" }, name: current.displayName || "Workspace", updatedAt: serverTimestamp() });
          }
        } catch { if (active) setMessage(t.error); }
      }
      if (active) { setUser(current); setReady(true); }
    });
    return () => { active = false; unsubscribe(); };
  }, [client, t.error]);

  useEffect(() => {
    if (!client || !user) return;
    const projectsQuery = query(collection(client.db, "projects"), where("workspaceId", "==", user.uid));
    return onSnapshot(projectsQuery, (snapshot) => {
      setProjects(snapshot.docs.map((item) => ({ id: item.id, name: item.data().name ?? "", market: item.data().market ?? "", category: item.data().category ?? "" })));
    }, () => setMessage(t.error));
  }, [client, user, t.error]);

  async function login() {
    if (!client) return;
    setBusy(true); setMessage("");
    try {
      await signInWithPopup(client.auth, new GoogleAuthProvider());
    } catch { setMessage(t.error); }
    finally { setBusy(false); }
  }

  async function createProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client || !user || !name.trim() || !market.trim()) return;
    setBusy(true); setMessage("");
    try {
      await addDoc(collection(client.db, "projects"), { workspaceId: user.uid, name: name.trim(), market: market.trim(), category: category.trim(), validationStatus: "draft", createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      setName(""); setMarket(""); setCategory(""); setMessage(t.saved);
    } catch { setMessage(t.error); }
    finally { setBusy(false); }
  }

  return <main className="workspace container"><div className="workspace-intro"><span className="overline">PROJECTS</span><h1>{t.title}</h1><p>{t.intro}</p></div>
    {!client ? <div className="surface"><p role="status">{t.setup}</p></div> : !ready ? <p role="status">{t.loading}</p> : !user ? <div className="surface"><button className="button primary" disabled={busy} onClick={login}>{t.login}</button>{message && <p role="alert">{message}</p>}</div> : <>
      <div className="account-bar"><span>{user.displayName || user.email}</span><button className="text-button" onClick={() => signOut(client.auth)}>{t.logout}</button></div>
      <div className="workspace-grid"><section className="surface"><h2>{t.create}</h2><form className="edit-fields" onSubmit={createProject}><label>{t.name}<input required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} /></label><label>{t.market}<input required maxLength={100} value={market} onChange={(event) => setMarket(event.target.value)} /></label><label>{t.category}<input maxLength={100} value={category} onChange={(event) => setCategory(event.target.value)} /></label><div><button className="button primary" disabled={busy} type="submit">{t.create}</button></div></form></section>
        <section className="surface"><h2>{t.title}</h2>{projects.length ? <ul className="project-list">{projects.map((project) => <li key={project.id}><strong>{project.name}</strong><span>{project.market}{project.category ? ` · ${project.category}` : ""}</span></li>)}</ul> : <p>{t.empty}</p>}<p className="project-hint">{t.projectHint}</p></section></div>
      {message && <p role="status">{message}</p>}
    </>}
  </main>;
}
