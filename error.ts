import { error } from "./elements.ts";

export const displayError = (s: string) => {
  error.textContent = s;
  setTimeout(() => error.textContent = "", 4000);
};
