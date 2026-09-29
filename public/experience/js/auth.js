import { firebaseConfig } from './firebase-config.js';

const configured = ['apiKey', 'authDomain', 'projectId', 'appId'].every(key => firebaseConfig[key]);
window.LAUNCHOPS_AUTH = {
  user: null,
  available: false,
  signIn: async () => { throw Object.assign(new Error('Login unavailable'), { code: 'auth/unavailable' }); },
  signOut: async () => {},
};

if (configured) try {
  const [{ initializeApp }, authModule] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js')
  ]);
  const { getAuth, GoogleAuthProvider, signInWithPopup, signOut } = authModule;
  const auth = getAuth(initializeApp(firebaseConfig));
  await auth.authStateReady();
  window.LAUNCHOPS_AUTH = {
    user: auth.currentUser,
    available: true,
    signIn: () => signInWithPopup(auth, new GoogleAuthProvider()),
    signOut: () => signOut(auth)
  };
} catch (error) {
  console.warn('Authentication unavailable; guest demo remains available.', error.code || error.name);
}
await import(window.LAUNCHOPS_AUTH.user ? './live-app.js' : './app.js');
