const express = require("express");
const axios = require("axios");
var firebase = require('firebase')
const cors = require('cors');
const FormData = require('form-data');
const app = express();
const cheerio = require('cheerio');

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

  // var date=moment().utcOffset("+05:30").format("DDMMYYYY");
  const getValue = async () => {
  const formData = new FormData();
  let value = "( {46553} ( [0] 4 hour close > [0] 4 hour ema( [0] 4 hour close , 200 ) and [0] 4 hour close >= [0] 4 hour ema( [0] 4 hour close , 55 ) and market cap >= 5000 and [0] 4 hour volume > [0] 4 hour sma( [0] 4 hour close , 20 ) and [0] 4 hour close <= [0] 4 hour ema( [0] 4 hour close , 13 ) ) )"
  formData.append('scan_clause', value);
   axios.get("https://chartink.com/screener/swing-2023-09-02-20?src=wassup").then(resp=>{
    const $ = cheerio.load(resp.data);
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    let config = {
      headers: {
        "X-Csrf-Token": csrfToken,
        "Cookie":"_gid=GA1.2.827473331.1693925088; _s_gads=ID=3e0882b6eabd8844-226daf076be30067:T=1693925087:RT=1693925087:S=ALNI_MaW_UI0AGePvJbmsiOMmkux2C6hOQ; __gpi=UID=00000c3c3485869f:T=1693925087:RT=1693925087:S=ALNI_MZC6oG3JLtvkasF2ZFZiYQtrwQk_w; _ga=GA1.1.428119396.1693925088; _ga_7P3KPC3ZPP=GS1.2.1693925088.1.1.1693925088.0.0.0; "+resp.headers['set-cookie'].join('; ')
      }
    }
      axios.post("https://chartink.com/screener/process", formData, config).then((response)=>{
        console.log(response.data)
        database.ref(`/55emaAbove13Emabelow`).set(response.data);
      })
    })
  }
  getValue();
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
getValue();
})

app.listen(process.env.PORT || PORT, () => {
    console.log('listening on *:' + PORT);
});
  