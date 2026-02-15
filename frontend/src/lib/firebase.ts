import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

# TODO: fairebaseコンソールから取得して入力のこと！
const firebaseConfig = {
  apiKey: "xxx",
  authDomain: "xxx",
  projectId: "xxx",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
