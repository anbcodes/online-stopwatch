import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "https://cdn.skypack.dev/firebase/auth";

import { appContainer, auth } from "./elements.ts";
import { displayError } from "./error.ts";

let fireAuth: any = null;

export const init = () => {
  fireAuth = getAuth();
  onAuthStateChanged(fireAuth, (u: any) => {
    user = u;
    if (u) {
      loginListeners.forEach((l) => l(u));
    } else {
      logoutListeners.forEach((l) => l());
    }
  });
};

let user: any | null = null;

const loginListeners: ((user: any) => void)[] = [];
const logoutListeners: (() => void)[] = [];

export const getUser = (): any | null => user;
export const onLogin = (listen: (user: any) => void) =>
  loginListeners.push(listen);
export const onLogout = (listen: () => void) => logoutListeners.push(listen);

onLogin(() => {
  auth.container.style.display = "none";
  appContainer.style.display = "block";
});
onLogout(() => {
  auth.container.style.display = "flex";
  appContainer.style.display = "none";
});

auth.signup.addEventListener("click", () => {
  const password = auth.password.value;
  const email = auth.email.value;
  if (email.length !== 0 && password.length !== 0) {
    createUserWithEmailAndPassword(fireAuth, email, password);
  } else {
    displayError("Email and password must exist");
  }
});

auth.signin.addEventListener("click", () => {
  const password = auth.password.value;
  const email = auth.email.value;
  if (email.length !== 0 && password.length !== 0) {
    signInWithEmailAndPassword(fireAuth, email, password);
  } else {
    displayError("Email and password must exist");
  }
});

const provider = new GoogleAuthProvider();

auth.loginWithGoogleBtn.addEventListener("click", () => {
  signInWithPopup(fireAuth, provider);
});

auth.logout.addEventListener("click", () => {
  signOut(fireAuth);
});
