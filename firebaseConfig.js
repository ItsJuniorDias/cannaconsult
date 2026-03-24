// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBl_M2QuzOqq4zRFI_c57kt7o-Kx36BAfc",
  authDomain: "cannaconsult-18f25.firebaseapp.com",
  projectId: "cannaconsult-18f25",
  storageBucket: "cannaconsult-18f25.firebasestorage.app",
  messagingSenderId: "13574682438",
  appId: "1:13574682438:web:1aac0cb5d9d0fa00eed747",
  measurementId: "G-PSTP48YXX0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
