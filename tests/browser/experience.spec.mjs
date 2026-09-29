import { test, expect } from '@playwright/test';

const guest = page => page.route('**/experience/js/firebase-config.js', route => route.fulfill({contentType:'text/javascript',body:'export const firebaseConfig = {};'}));

// Isolated browser storage fixture. These tests never write to Firebase.
async function signedInFixture(page) {
  await page.route('https://www.gstatic.com/firebasejs/**/firebase-app.js', route => route.fulfill({contentType:'text/javascript',body:'export const initializeApp = () => ({}); export const getApp = () => ({});'}));
  await page.route('https://www.gstatic.com/firebasejs/**/firebase-auth.js', route => route.fulfill({contentType:'text/javascript',body:`
    export const getAuth = () => ({currentUser:{uid:'browser-test',email:'test@example.invalid'},authStateReady:async()=>{}});
    export class GoogleAuthProvider {} export const signInWithPopup=async()=>{}; export const signOut=async()=>{};
  `}));
  await page.route('https://www.gstatic.com/firebasejs/**/firebase-firestore.js', route => route.fulfill({contentType:'text/javascript',body:`
    const read=()=>JSON.parse(localStorage.getItem('fixture-db')||'{}');
    export const getFirestore=()=>({});
    export const collection=(_, ...parts)=>parts.join('/');
    export const doc=(base,...parts)=>[typeof base==='string'?base:'',...parts].filter(Boolean).join('/');
    export const getDocs=async ref=>({docs:Object.entries(read()).filter(([key])=>key.startsWith(ref+'/')).map(([key,value])=>({id:key.split('/').pop(),data:()=>value}))});
    export const getDoc=async ref=>({exists:()=>!!read()[ref],data:()=>read()[ref]});
    export const setDoc=async(ref,value)=>{if(localStorage.getItem('fixture-fail'))throw Error('Simulated write failure');const data=read();data[ref]=value;localStorage.setItem('fixture-db',JSON.stringify(data));};
    export const deleteDoc=async ref=>{const data=read();delete data[ref];localStorage.setItem('fixture-db',JSON.stringify(data));};
  `}));
}

for (const viewport of [{width:1440,height:1000},{width:390,height:844}]) {
  test(`landing motion, controls and links at ${viewport.width}px`, async ({ page }, info) => {
    await page.setViewportSize(viewport);
    const errors=[];page.on('pageerror', error=>errors.push(error.message));
    await page.goto('/ko');await expect(page.locator('.cinema')).toHaveCount(2);
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const scene=page.locator('#motion-product');
    await scene.evaluate(el=>window.scrollTo({top:el.offsetTop+(el.offsetHeight-innerHeight)*.45,behavior:'instant'}));
    await expect.poll(()=>scene.evaluate(el=>Number(el.style.getPropertyValue('--scene-progress')))).toBeGreaterThan(.35);
    await page.screenshot({path:info.outputPath('product-motion.png')});
    await scene.getByRole('button',{name:'모션 멈추기'}).click();await expect(scene).toHaveAttribute('data-still','true');
    const frozen=await scene.evaluate(el=>el.style.getPropertyValue('--scene-progress'));
    await page.mouse.wheel(0,130);expect(await scene.evaluate(el=>el.style.getPropertyValue('--scene-progress'))).toBe(frozen);
    await scene.getByRole('link',{name:'다음 내용으로'}).click();await expect(page).toHaveURL(/#simulation$/);
    const score=page.locator('.sim-score-panel strong'),before=await score.innerText();
    await page.getByRole('button',{name:'Reddit',exact:true}).click();await expect(page.getByRole('button',{name:'Reddit',exact:true})).toHaveAttribute('aria-pressed','true');
    expect(await score.innerText()).not.toBe(before);
    await page.locator('#motion-signal').evaluate(el=>window.scrollTo({top:el.offsetTop+100,behavior:'instant'}));
    await expect(page.locator('.cinema-backdrop')).toBeVisible();await page.screenshot({path:info.outputPath('signal-motion.png')});
    await page.locator('#motion-signal').getByRole('link',{name:'내 제품으로 시작하기'}).click();await expect(page).toHaveURL(/experience\/login.html$/);
    expect(errors).toEqual([]);
  });
}
test('reduced motion renders scenes in normal flow',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/ko');
  await expect(page.locator('.cinema-sticky').first()).toHaveCSS('position','relative');
  await expect(page.locator('.cinema-controls button').first()).toBeHidden();
  await expect(page.locator('.cinema-signal-chip').first()).toHaveCSS('animation-name','none');
});
test('guest screens, project persistence and login return link',async({page})=>{
  await guest(page);const errors=[];page.on('pageerror',error=>errors.push(error.message));
  for(const file of ['login','projects','dashboard','validation-setup','integrations','new-experiment','experiment-detail','validation-result','pr-channels','release-editor','distribution-results']) {
    await page.goto(`/experience/${file}.html`);await expect(page.locator('#app')).not.toBeEmpty();await expect(page.getByText('화면을 불러오지 못했습니다')).toHaveCount(0);
  }
  await page.goto('/experience/new-project.html');
  await page.getByLabel('제품명',{exact:true}).fill('Browser QA project');await page.getByLabel('제품 URL').fill('https://example.invalid');
  await page.getByLabel('카테고리').fill('SaaS');await page.getByLabel('목표 시장').fill('Founders');
  await page.getByRole('button',{name:'제품 분석 및 가설 생성'}).click();await expect(page).toHaveURL(/validation-setup.html\?project=/);
  await page.reload();await expect(page.getByLabel('고객군',{exact:true})).toHaveValue('Founders');
  await page.getByRole('link',{name:'로그인 / 회원가입',exact:true}).click();await expect(page).toHaveURL(/login.html\?next=validation-setup.html/);
  await expect(page.getByRole('link',{name:'홈으로',exact:false})).toBeVisible();expect(errors).toEqual([]);
});
test('Firebase network failure still leaves the guest demo usable',async({page})=>{
  await page.route('https://www.gstatic.com/firebasejs/**',route=>route.abort());await page.goto('/experience/login.html');
  await expect(page.getByRole('alert')).toContainText('데모는 계속 이용');await page.getByRole('link',{name:'로그인 없이 데모 보기'}).click();
  await expect(page.getByRole('heading',{name:'프로젝트',exact:true})).toBeVisible();
});
test('legacy project route opens the same workspace',async({page})=>{
  await guest(page);await page.goto('/ko/projects');await expect(page).toHaveURL(/experience\/projects.html$/);
  await expect(page.getByRole('heading',{name:'프로젝트',exact:true})).toBeVisible();
});
test('workspace load failure retains retry and account recovery',async({page})=>{
  await signedInFixture(page);
  await page.route('https://www.gstatic.com/firebasejs/**/firebase-firestore.js',route=>route.fulfill({contentType:'text/javascript',body:`
    export const getFirestore=()=>({});export const collection=()=>'';export const doc=()=>'';
    export const getDocs=async()=>{throw Object.assign(Error('Simulated permission failure'),{code:'permission-denied'})};export const getDoc=async()=>({});
    export const setDoc=async()=>{};export const deleteDoc=async()=>{};
  `}));
  await page.goto('/experience/projects.html');
  await expect(page.getByRole('heading',{name:'작업공간을 불러오지 못했습니다'})).toBeVisible();
  await expect(page.getByText('오류 코드: permission-denied')).toBeVisible();
  await expect(page.getByText('관리자가 이 Firebase 프로젝트에 사용자별 보안 규칙을 게시해야 합니다.',{exact:false})).toBeVisible();
  await expect(page.getByRole('button',{name:'다른 계정으로 로그인'})).toBeVisible();
  await expect(page.getByRole('link',{name:'다시 시도',exact:true})).toBeVisible();
});
test('signed-in UI fixture saves projects, metrics and repeat drafts, recovers failed save',async({page})=>{
  await signedInFixture(page);page.on('dialog',dialog=>dialog.accept());await page.goto('/experience/new-project.html');
  await page.getByLabel('제품명',{exact:true}).fill('Persisted QA');await page.getByLabel('제품 URL').fill('https://example.invalid');
  await page.getByLabel('카테고리').fill('Tool');await page.getByLabel('목표 시장').fill('Teams');await page.getByRole('button',{name:'저장',exact:true}).click();await expect(page).toHaveURL(/validation-setup.html/);
  await page.getByLabel('고객 문제').fill('Scattered evidence');await page.getByLabel('핵심 가치 제안').fill('One place');
  await page.getByRole('button',{name:'저장',exact:true}).click();await expect(page).toHaveURL(/dashboard.html/);
  await page.getByRole('link',{name:'새 실험',exact:true}).first().click();await page.getByRole('button',{name:'실험 계획 저장'}).click();await expect(page).toHaveURL(/experiment-detail.html/);
  await page.getByLabel('노출',{exact:true}).fill('2000');await page.getByLabel('방문',{exact:true}).fill('100');await page.getByRole('button',{name:'성과 저장'}).click();await expect(page.getByLabel('노출',{exact:true})).toHaveValue('2000');
  await page.goto('/experience/release-editor.html');await page.getByRole('textbox',{name:'본문',exact:true}).fill('First draft');const save=page.getByRole('button',{name:'초안 저장'});
  await save.click();await expect(save).toBeEnabled();await page.getByRole('textbox',{name:'본문',exact:true}).fill('Second draft');await save.click();await expect(save).toBeEnabled();
  await page.reload();await expect(page.getByRole('textbox',{name:'본문',exact:true})).toHaveValue('Second draft');
  await page.evaluate(()=>localStorage.setItem('fixture-fail','1'));await save.click();await expect(save).toBeEnabled();
  await page.evaluate(()=>localStorage.removeItem('fixture-fail'));await page.getByRole('textbox',{name:'본문',exact:true}).fill('After retry');await save.click();await expect(save).toBeEnabled();
  await page.reload();await expect(page.getByRole('textbox',{name:'본문',exact:true})).toHaveValue('After retry');
});
