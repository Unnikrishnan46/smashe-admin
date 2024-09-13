"use sever"

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyBY961_T2ZfNOXq1inGnWI6-pJiyv6L0-I",
  authDomain: "smashe-2ba56.firebaseapp.com",
  databaseURL: 'https://smashe-2ba56-default-rtdb.asia-southeast1.firebasedatabase.app/',
  projectId: "smashe-2ba56",
  storageBucket: "smashe-2ba56.appspot.com",
  messagingSenderId: "612774121540",
  appId: "1:612774121540:web:3746222e2dd7811ba66c11",
  measurementId: "G-6H8S4KWVQR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
// const analytics = getAnalytics(app);


export {app,database};