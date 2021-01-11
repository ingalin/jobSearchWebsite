// firebase.js
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAbfxQEJtNgZRkJUgvkv7nJOwcZzoR2A-o",
    authDomain: "project5-2f3c6.firebaseapp.com",
    projectId: "project5-2f3c6",
    storageBucket: "project5-2f3c6.appspot.com",
    messagingSenderId: "693020103862",
    appId: "1:693020103862:web:a1335a3545f882c8eac217",
};

firebase.initializeApp(firebaseConfig);
// this exports the CONFIGURED version of firebase
export default firebase;
