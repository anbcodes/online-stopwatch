import { initializeApp } from "https://cdn.skypack.dev/firebase/app";
import {
  collection,
  doc,
  getFirestore,
  onSnapshot,
  setDoc,
} from "https://cdn.skypack.dev/firebase/firestore";

import {
  createStopwatch,
  makeStopwatch,
  namePrompt,
  setClock,
  stopwatchContainer,
} from "./elements.ts";
import { getUser, init, onLogin, onLogout } from "./auth.ts";

namePrompt.card.addEventListener("click", (e) => {
  e.stopPropagation();
});

const firebaseConfig = {
  apiKey: "AIzaSyCsiyoVm0X11zpy9PWiIm7csII4an2SL0w",
  authDomain: "cloud-watches.firebaseapp.com",
  projectId: "cloud-watches",
  storageBucket: "cloud-watches.appspot.com",
  messagingSenderId: "138490511195",
  appId: "1:138490511195:web:bd228d338a9ff03138247e",
  measurementId: "G-R6QGC30ZY3",
};

const app = initializeApp(firebaseConfig);

init();

const db = getFirestore();

const usersCollection = collection(db, "user");

interface AppData {
  stopwatches: Stopwatch[];
  clockIp?: string;
}

let appData: AppData = { stopwatches: [] };

let userDoc: null | ReturnType<typeof doc> = null;
let unsubFromUserDoc: null | ReturnType<typeof onSnapshot> = null;

const save = () => {
  setDoc(userDoc, appData);
};

onLogin((user) => {
  userDoc = doc(usersCollection, user.uid);
  unsubFromUserDoc = onSnapshot(userDoc, updateStopwatches);
});

onLogout(() => {
  unsubFromUserDoc?.();
});

interface Stopwatch {
  name: string;
  startTime: number;
  prevTime: number;
  running: boolean;
}

const formatTime = (t: number) => {
  const centiSeconds = Math.floor(t / 10);
  const seconds = Math.floor(centiSeconds / 100);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const formattedMinutes = (minutes % 60).toString(10).padStart(2, "0");
  const formattedSeconds = (seconds % 60).toString(10).padStart(2, "0");
  const formattedCentiseconds = (centiSeconds % 100).toString(10).padStart(
    2,
    "0",
  );

  return `${hours}:${formattedMinutes}:${formattedSeconds}.${formattedCentiseconds}`;
};

let stopwatches: {
  stopwatch: Stopwatch;
  el: ReturnType<typeof makeStopwatch>;
}[] = [];

const updateStopwatches = (doc: any) => {
  const data = doc.data();
  if (!data) return;
  stopwatchContainer.innerHTML = "";
  stopwatches = [];
  appData = data;
  data.stopwatches.forEach((stopwatch: Stopwatch) => {
    const stopwatchEl = makeStopwatch();
    stopwatchContainer.appendChild(stopwatchEl.container);
    stopwatchEl.name.textContent = stopwatch.name;
    const passed = stopwatch.running ? (+new Date() - stopwatch.startTime) : 0;
    stopwatchEl.time.textContent = formatTime(stopwatch.prevTime + passed);

    if (stopwatch.running) {
      stopwatchEl.startStopBtn.classList.add("running");
    }

    stopwatchEl.startStopBtn.addEventListener("click", () => {
      if (!stopwatch.running) {
        stopwatch.startTime = +new Date();
        stopwatch.running = true;
        stopwatchEl.startStopBtn.classList.add("running");
        if (appData.clockIp) {
          fetch(
            `https://${appData.clockIp}/stopwatch/start-time?v=${
              stopwatch.startTime - stopwatch.prevTime
            }`,
            { method: "POST" },
          );

          fetch(`https://${appData.clockIp}/mode?v=stopwatch`, {
            method: "POST",
          });

          fetch(
            `https://${appData.clockIp}/show-ms?v=true`,
            { method: "POST" },
          );
        }
      } else {
        stopwatch.prevTime += +new Date() - stopwatch.startTime;
        stopwatch.running = false;
        stopwatchEl.startStopBtn.classList.remove("running");

        if (appData.clockIp) {
          fetch(
            `https://${appData.clockIp}/show-ms?v=false`,
            { method: "POST" },
          );

          fetch(`https://${appData.clockIp}/mode?v=clock`, {
            method: "POST",
          });
        }
      }
      save();
    });

    stopwatchEl.resetBtn.addEventListener("click", () => {
      stopwatch.prevTime = 0;
      stopwatch.startTime = 0;
      stopwatch.running = false;
      save();
    });

    stopwatchEl.deleteBtn.addEventListener("click", () => {
      appData.stopwatches = appData.stopwatches.filter((v: Stopwatch) =>
        v !== stopwatch
      ), save();
    });

    stopwatchEl.setNameBtn.addEventListener("click", () => {
      namePrompt.container.style.display = "flex";
      namePrompt.container.style.opacity = "100%";
      namePrompt.input.focus();

      const onSubmit = () => {
        stopwatch.name = namePrompt.input.value;
        save();
        stopwatchEl.name.textContent = stopwatch.name;
        removeAll();
      };

      const inputListener = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          onSubmit();
          namePrompt.input.removeEventListener("keydown", inputListener);
        }
        if (e.key === "Escape") {
          removeAll();
        }
      };

      const removeAll = () => {
        namePrompt.submit.removeEventListener("click", onSubmit);
        namePrompt.input.removeEventListener("keydown", inputListener);
        namePrompt.container.removeEventListener("click", removeAll);
        removeEventListener("keydown", inputListener);

        namePrompt.container.style.opacity = "0";
        setTimeout(() => {
          namePrompt.container.style.display = "none";
        }, 200);

        namePrompt.input.value = "";
      };

      addEventListener("keydown", inputListener);

      namePrompt.submit.addEventListener("click", onSubmit);
      namePrompt.input.addEventListener("keydown", inputListener);
      namePrompt.container.addEventListener("click", removeAll);
    });

    stopwatches.push({ stopwatch, el: stopwatchEl });
  });
};

const render = () => {
  stopwatches.forEach(
    ({ stopwatch, el }) => {
      if (stopwatch.running || stopwatch.prevTime === 0) {
        const passed = stopwatch.running
          ? (+new Date() - stopwatch.startTime)
          : 0;
        el.time.textContent = formatTime(stopwatch.prevTime + passed);
      }
    },
  );
  requestAnimationFrame(render);
};

requestAnimationFrame(render);

createStopwatch.addEventListener("click", () => {
  if (!appData.stopwatches && getUser()) {
    appData.stopwatches = [];
  }

  if (appData.stopwatches) {
    appData.stopwatches.push({
      prevTime: 0,
      startTime: 0,
      running: false,
      name: "New stopwatch",
    });
    save();
  }
});

console.log("Hello");

setClock.addEventListener("click", () => {
  const label = namePrompt.container.querySelector("label");
  if (!label) {
    throw new Error("No label");
  }

  label.textContent = "Ip";

  namePrompt.container.style.display = "flex";
  namePrompt.container.style.opacity = "100%";
  namePrompt.input.focus();

  const onSubmit = () => {
    appData.clockIp = namePrompt.input.value;
    save();
    removeAll();
  };

  const inputListener = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      onSubmit();
      namePrompt.input.removeEventListener("keydown", inputListener);
    }
    if (e.key === "Escape") {
      removeAll();
    }
  };

  const removeAll = () => {
    namePrompt.submit.removeEventListener("click", onSubmit);
    namePrompt.input.removeEventListener("keydown", inputListener);
    namePrompt.container.removeEventListener("click", removeAll);
    removeEventListener("keydown", inputListener);

    namePrompt.container.style.opacity = "0";
    setTimeout(() => {
      namePrompt.container.style.display = "none";
    }, 200);
    label.textContent = "Name";

    namePrompt.input.value = "";
  };

  addEventListener("keydown", inputListener);

  namePrompt.submit.addEventListener("click", onSubmit);
  namePrompt.input.addEventListener("keydown", inputListener);
  namePrompt.container.addEventListener("click", removeAll);
});
