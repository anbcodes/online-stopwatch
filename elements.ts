const ensure = <T extends HTMLElement>(q: string, on = document.body) => {
  const element = on.querySelector(q);
  if (element === null) {
    throw new Error(`Element '${q}' does not exist!`);
  }
  return element as T;
};

export const auth = {
  container: ensure<HTMLDivElement>("#auth-container"),
  loginWithGoogleBtn: ensure<HTMLButtonElement>("#auth-google"),
  email: ensure<HTMLInputElement>("#auth-email"),
  password: ensure<HTMLInputElement>("#auth-password"),
  signin: ensure<HTMLButtonElement>("#auth-signin"),
  signup: ensure<HTMLButtonElement>("#auth-signup"),
  logout: ensure<HTMLButtonElement>("#auth-logout"),
};

export const stopwatchContainer = ensure<HTMLDivElement>(
  "#stopwatches-container",
);

export const appContainer = ensure<HTMLDivElement>(
  "#app-container",
);

export const stopwatchTemplate = ensure<HTMLTemplateElement>(
  "#stopwatch-template",
);

export const makeStopwatch = () => {
  const cloned = stopwatchTemplate.content.cloneNode(true) as HTMLDivElement;
  return {
    template: cloned,
    container: ensure<HTMLDivElement>(".stopwatch-container", cloned),
    name: ensure<HTMLDivElement>(".stopwatch-name", cloned),
    time: ensure<HTMLDivElement>(".stopwatch-time", cloned),
    startStopBtn: ensure<HTMLButtonElement>(".stopwatch-startstop", cloned),
    resetBtn: ensure<HTMLButtonElement>(".stopwatch-reset", cloned),
    deleteBtn: ensure<HTMLButtonElement>(".stopwatch-delete", cloned),
    setNameBtn: ensure<HTMLButtonElement>(".stopwatch-setname", cloned),
  };
};

export const error = ensure<HTMLDivElement>("#error");

export const createStopwatch = ensure<HTMLButtonElement>("#create-stopwatch");

export const namePrompt = {
  input: ensure<HTMLInputElement>("#setname-name"),
  submit: ensure<HTMLInputElement>("#setname-submit"),
  container: ensure<HTMLDivElement>("#setname-prompt"),
  card: ensure<HTMLDivElement>("#setname-prompt .container"),
};

export const setClock = ensure<HTMLButtonElement>("#set-clock");
