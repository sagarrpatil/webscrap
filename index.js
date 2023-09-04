const express = require("express");
const axios = require("axios");
var firebase = require('firebase')
const cors = require('cors');
const app = express();
app.use(cors({
  origin: '*'
}));
const PORT = 9000;
const moment = require('moment');
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
firebase.initializeApp(firebaseConfig)
let database = firebase.database()
var data;
database.ref(`/`).once('value').then(function(snapshot) {
  data =snapshot.val();
})

// setInterval(() => {

  var date=moment().utcOffset("+05:30").format("DDMMYYYY");


    //  if(((moment().utcOffset("+05:30").format("a")=="am" && 
    //       (Number(moment().utcOffset("+05:30").format("hh"))==9 || 
    //       Number(moment().utcOffset("+05:30").format("hh"))==10 || 
    //       Number(moment().utcOffset("+05:30").format("hh"))==11)) || 
    //     (moment().utcOffset("+05:30").format("a")=="pm" &&
    //       (Number(moment().utcOffset("+05:30").format("hh"))==12 || 
    //       Number(moment().utcOffset("+05:30").format("hh"))==1 ||
    //       Number(moment().utcOffset("+05:30").format("hh"))==2 ||
    //       (Number(moment().utcOffset("+05:30").format("hh"))==3 && Number(moment().utcOffset("+05:30").format("mm"))<31)
    //     )) ) && (moment().utcOffset("+05:30").format("dddd")!=="Saturday" && moment().utcOffset("+05:30").format("dddd")!=="Sunday"))
    //     {
          console.log("open")

    //   }else{
    //     database.ref(date+`/status/`).set({status: "close"})
    //     console.log("close")
    // }
// }, 3000000);




app.get('/', (req, res) => {
  res.send({"Keeplive":"keep running", 
  timeOfServer: moment().format("YYYY-MM-DD, hh:mm:ss"),
  time: moment().utcOffset("+05:30").format("YYYY-MM-DD, hh:mm:ss")
})
})

app.listen(process.env.PORT || PORT, () => {
    console.log('listening on *:5000');
});
  