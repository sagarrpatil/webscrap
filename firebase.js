import firebase from 'firebase';
var firebaseConfig = {
 apiKey: "AIzaSyCitIWt3V5aai8NG4tyI2KF_Ui-ZlCrb44",
  authDomain: "nsedata-ff96f.firebaseapp.com",
  databaseURL: "https://nsedata-ff96f-default-rtdb.firebaseio.com",
  projectId: "nsedata-ff96f",
  storageBucket: "nsedata-ff96f.appspot.com",
  messagingSenderId: "388400964319",
  appId: "1:388400964319:web:6304a98cb08fd6c0513f6a",
  measurementId: "G-W7W4SBFEBV"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const storage = firebase.storage();
  export  {
    storage, firebase as default
  }