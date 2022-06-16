const express = require("express");
const axios = require("axios");
var firebase = require('firebase')
const cors = require('cors');
const app = express();
app.use(cors({
  origin: '*'
}));
const PORT = 5000;
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

setInterval(() => {

  var date=moment().utcOffset("+05:30").format("DDMMYYYY");
  var niftypcrdata={
    "reqType": "niftypcr",
    "reqDate": ""
  }
  var bankniftypcrdata={
    "reqType": "bankniftypcr",
    "reqDate": ""
  }

     if(((moment().utcOffset("+05:30").format("a")=="am" && 
          (Number(moment().utcOffset("+05:30").format("hh"))==9 || 
          Number(moment().utcOffset("+05:30").format("hh"))==10 || 
          Number(moment().utcOffset("+05:30").format("hh"))==11)) || 
        (moment().utcOffset("+05:30").format("a")=="pm" &&
          (Number(moment().utcOffset("+05:30").format("hh"))==12 || 
          Number(moment().utcOffset("+05:30").format("hh"))==1 ||
          Number(moment().utcOffset("+05:30").format("hh"))==2 ||
          (Number(moment().utcOffset("+05:30").format("hh"))==3 && Number(moment().utcOffset("+05:30").format("mm"))<31)
        )) ) && (moment().utcOffset("+05:30").format("dddd")!=="Saturday" || moment().utcOffset("+05:30").format("dddd")!=="Sunday"))
      {
    console.log("open")
    database.ref(`/status/`).set({status: "open"})
    axios.post("https://api.niftytrader.in/webapi/Option/getOiPcrListData", niftypcrdata).then((response)=>{
      let oiDataMonthPCRNifty=response.data.resultData.oiDatas;
       database.ref(`/nifty/OIMonthPCR/`).set(oiDataMonthPCRNifty);
     })
     axios.post("https://api.niftytrader.in/webapi/Option/getOiPcrListData", bankniftypcrdata).then((response)=>{
       let oiDataMonthPCRNifty=response.data.resultData.oiDatas;
        database.ref(`/banknifty/OIMonthPCR/`).set(oiDataMonthPCRNifty);
      })
      var changeOINifty={reqType: "niftyoichange", reqDate: ""};
      axios.post("https://api.niftytrader.in/webapi/Option/getOiChangeData",changeOINifty).then((response)=>{
      var oiChangeData = response.data.resultData.oiDatas;
      database.ref('/nifty/oiChangeData').set(oiChangeData)
      var calloi=0;
      var putoi=0;
      response.data.resultData.oiDatas.map((oi)=>{
        let callOIMinus= oi.calls_change_oi>=0?oi.calls_change_oi:0;
        let putoivalue=oi.puts_change_oi>=0?oi.puts_change_oi:0;
        if(oi.calls_change_oi>=0)
        putoi=putoi+putoivalue;
        else
        putoi=putoi+putoivalue-oi.calls_change_oi;
        if(oi.puts_change_oi>=0)
        calloi=calloi+callOIMinus;
        else
        calloi=calloi+callOIMinus-oi.puts_change_oi;
      })
      database.ref('/nifty/ChangeInOI/'+moment().utcOffset("+05:30").format("YYYY-MM-DDThh:mm")).set({
        CallOIChange:calloi,
        PutOIChange:putoi
      })
      })
      var bankchangeOINifty={reqType: "bankniftyoichange", reqDate: ""};
      axios.post("https://api.niftytrader.in/webapi/Option/getOiChangeData",bankchangeOINifty).then((response)=>{
        var oiChangeData = response.data.resultData.oiDatas;
        database.ref('/banknifty/oiChangeData').set(oiChangeData)
        var calloi=0;
        var putoi=0;
        response.data.resultData.oiDatas.map((oi)=>{
          let callOIMinus= oi.calls_change_oi>=0?oi.calls_change_oi:0;
          let putoivalue=oi.puts_change_oi>=0?oi.puts_change_oi:0;
          if(oi.calls_change_oi>=0)
          putoi=putoi+putoivalue;
          else
          putoi=putoi+putoivalue-oi.calls_change_oi;
          if(oi.puts_change_oi>=0)
          calloi=calloi+callOIMinus;
          else
          calloi=calloi+callOIMinus-oi.puts_change_oi;
        })
        database.ref('/banknifty/ChangeInOI/'+moment().utcOffset("+05:30").format("YYYY-MM-DDThh:mm")).set({
          CallOIChange:calloi,
          PutOIChange:putoi
        })
        })

        let oimNifty= {reqType: "niftyoilist", reqDate: ""}
        axios.post("https://api.niftytrader.in/webapi/Option/getOiData", oimNifty).then((response)=>{
          database.ref('/nifty/OIMonth').set(response.data.resultData.oiDatas)
        })
        let oimBankNifty= {reqType: "bankniftyoi", reqDate: ""}
        axios.post("https://api.niftytrader.in/webapi/Option/getOiData", oimBankNifty).then((response)=>{
          database.ref('/banknifty/OIMonth').set(response.data.resultData.oiDatas)
        })
}else{
  database.ref(`/status/`).set({status: "close"})
  console.log("close")
}

}, 30000);

app.get('/', (req, res) => {
  res.send({"Keeplive":"keep running", 
  timeOfServer: moment().format("YYYY-MM-DD, hh:mm:ss"),
  time: moment().utcOffset("+05:30").format("YYYY-MM-DD, hh:mm:ss")
})
})

app.listen(process.env.PORT || PORT, () => {
    console.log('listening on *:5000');
});
  