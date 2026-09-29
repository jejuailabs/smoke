const app = document.getElementById('app');
const localHelp = () => {
  app.innerHTML = '<main class="content narrow"><section class="card"><h1>로컬 서버에서 열어 주세요</h1><p>Firebase 로그인은 파일을 직접 여는 방식(file://)에서 실행되지 않습니다.</p><p>현재 프로젝트에서 <code>npm run dev</code>를 실행한 뒤 <a href="http://localhost:3000/ko">http://localhost:3000/ko</a>를 여세요.</p></section></main>';
};

if (location.protocol === 'file:') {
  localHelp();
} else {
  import(new URL('./auth.js', document.currentScript.src).href).catch(error => {
    if (!app.dataset.loadError) app.innerHTML = '<main class="content narrow"><section class="card"><h1>화면을 불러오지 못했습니다</h1><p>인터넷 연결을 확인하고 다시 시도해 주세요.</p><div class="actions"><a class="button primary" href="">다시 시도</a><a class="button secondary" href="../ko">홈으로 돌아가기</a></div></section></main>';
    console.error(error);
  });
}
