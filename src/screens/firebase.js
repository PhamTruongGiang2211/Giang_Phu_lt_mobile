// firebase.js
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBLIBGSJWtfDQ1enTffgyxDdLAv_y5itRY",
  authDomain: "meal-recipe-750a5.firebaseapp.com",
  projectId: "meal-recipe-750a5",
  storageBucket: "meal-recipe-750a5.appspot.com", // sửa thành đúng định dạng .app**spot**.com
  messagingSenderId: "434821751329",
  appId: "1:434821751329:web:eae2aba236ce66e3343960",
  measurementId: "G-C0ELL4LS5D",
};

// Khởi tạo app nếu chưa có
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Xuất auth & firestore
const auth = firebase.auth();
const db = firebase.firestore();

export { firebase, auth, db };
