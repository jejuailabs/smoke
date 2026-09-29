const pages = new Set(['projects', 'new-project', 'dashboard', 'validation-setup', 'integrations', 'new-experiment', 'experiment-detail', 'validation-result', 'pr-channels', 'release-editor', 'distribution-results']);

// Keep sign-in return destinations inside this experience, including /preview.
export function returnDestination(value, currentUrl = location.href) {
  const base = new URL('.', currentUrl);
  const fallback = new URL('projects.html', base);
  if (!value) return fallback.href;
  try {
    const destination = new URL(value, base);
    const file = destination.pathname.slice(base.pathname.length);
    if (destination.origin !== base.origin || !destination.pathname.startsWith(base.pathname) || !pages.has(file.replace(/\.html$/, '')) || !file.endsWith('.html')) return fallback.href;
    return destination.href;
  } catch { return fallback.href; }
}

export function authErrorMessage(error) {
  return ({
    'auth/popup-closed-by-user': 'Google 로그인 창이 닫혔습니다. 다시 시도할 수 있습니다.',
    'auth/popup-blocked': '팝업이 차단되었습니다. 이 사이트의 팝업을 허용한 뒤 다시 시도해 주세요.',
    'auth/unauthorized-domain': '현재 주소에서는 로그인할 수 없습니다. 다른 접속 주소를 이용하거나 관리자에게 문의해 주세요.',
    'auth/operation-not-allowed': '로그인을 준비 중입니다. 먼저 데모를 둘러보세요.',
    'auth/network-request-failed': '로그인 서버에 연결하지 못했습니다. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.',
    'auth/unavailable': '현재 로그인에 연결할 수 없습니다. 데모는 계속 이용할 수 있습니다.',
    'auth/account-exists-with-different-credential': '같은 이메일로 가입한 다른 로그인 방식이 있습니다.',
  })[error?.code] || '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.';
}

export function bindAsyncForm(id, callback) {
  document.getElementById(id)?.addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.dataset.saving === 'true') return;
    const submit = form.querySelector('[type="submit"]');
    form.dataset.saving = 'true';
    form.setAttribute('aria-busy', 'true');
    if (submit) submit.disabled = true;
    try { await callback(new FormData(form)); }
    catch (error) { alert(`저장하지 못했습니다: ${error.message}`); }
    finally {
      delete form.dataset.saving;
      form.removeAttribute('aria-busy');
      if (submit?.isConnected) submit.disabled = false;
    }
  });
}
