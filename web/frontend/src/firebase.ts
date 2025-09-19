import { initializeApp, FirebaseOptions, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";

// Tipizzazione avanzata per la config
const firebaseConfig: FirebaseOptions = {
    apiKey: "AIzaSyBq071-8aDYtWkySSk4fuQO6OzZrbwyQVg",
    authDomain: "ai-assistant-ff9ac.firebaseapp.com",
    projectId: "ai-assistant-ff9ac",
    storageBucket: "ai-assistant-ff9ac.appspot.com",
    messagingSenderId: "933832326384",
    appId: "1:933832326384:web:b0a36675b56e2924fb1635",
    measurementId: "G-SE0E98836F"
};

// Inizializza Firebase con tipizzazione
const app: FirebaseApp = initializeApp(firebaseConfig);
const analytics: Analytics = getAnalytics(app);

// Inizializza Auth e Provider Google con tipi
export const auth: Auth = getAuth(app);
export const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();

export default app;