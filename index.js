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
        )) ) && (moment().utcOffset("+05:30").format("dddd")!=="Saturday" && moment().utcOffset("+05:30").format("dddd")!=="Sunday"))
        {
    console.log("open")
    database.ref(date+`/status/`).set({status: "open"})
    axios.post("https://api.niftytrader.in/webapi/Option/getOiPcrListData", niftypcrdata).then((response)=>{
      let oiDataMonthPCRNifty=response.data.resultData.oiDatas;
       database.ref(date+`/nifty/OIMonthPCR/`).set(oiDataMonthPCRNifty);
     })
     axios.post("https://api.niftytrader.in/webapi/Option/getOiPcrListData", bankniftypcrdata).then((response)=>{
       let oiDataMonthPCRNifty=response.data.resultData.oiDatas;
        database.ref(date+`/banknifty/OIMonthPCR/`).set(oiDataMonthPCRNifty);
      })
      var changeOINifty={reqType: "niftyoichange", reqDate: ""};
      axios.post("https://api.niftytrader.in/webapi/Option/getOiChangeData",changeOINifty).then((response)=>{
      var oiChangeData = response.data.resultData.oiDatas;
      database.ref(date+'/nifty/oiChangeData').set(oiChangeData)
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
      database.ref(date+'/nifty/ChangeInOI/'+moment().utcOffset("+05:30").format("YYYY-MM-DDThh:mm")).set({
        CallOIChange:calloi,
        PutOIChange:putoi
      })
      })
      var bankchangeOINifty={reqType: "bankniftyoichange", reqDate: ""};
      axios.post("https://api.niftytrader.in/webapi/Option/getOiChangeData",bankchangeOINifty).then((response)=>{
        var oiChangeData = response.data.resultData.oiDatas;
        database.ref(date+'/banknifty/oiChangeData').set(oiChangeData)
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
        database.ref(date+'/banknifty/ChangeInOI/'+moment().utcOffset("+05:30").format("YYYY-MM-DDThh:mm")).set({
          CallOIChange:calloi,
          PutOIChange:putoi
        })
        })

        let oimNifty= {reqType: "niftyoilist", reqDate: ""}
        axios.post("https://api.niftytrader.in/webapi/Option/getOiData", oimNifty).then((response)=>{
          database.ref(date+'/nifty/OIMonth').set(response.data.resultData.oiDatas)
        })
        let oimBankNifty= {reqType: "bankniftyoi", reqDate: ""}
        axios.post("https://api.niftytrader.in/webapi/Option/getOiData", oimBankNifty).then((response)=>{
          database.ref(date+'/banknifty/OIMonth').set(response.data.resultData.oiDatas)
        })
}else{
  database.ref(date+`/status/`).set({status: "close"})
  console.log("close")
}
}, 30000);


// setInterval(() => {
//   if(((moment().utcOffset("+05:30").format("a")=="am" && 
//   (Number(moment().utcOffset("+05:30").format("hh"))==9 || 
//   Number(moment().utcOffset("+05:30").format("hh"))==10 || 
//   Number(moment().utcOffset("+05:30").format("hh"))==11)) || 
// (moment().utcOffset("+05:30").format("a")=="pm" &&
//   (Number(moment().utcOffset("+05:30").format("hh"))==12 || 
//   Number(moment().utcOffset("+05:30").format("hh"))==1 ||
//   Number(moment().utcOffset("+05:30").format("hh"))==2 ||
//   (Number(moment().utcOffset("+05:30").format("hh"))==3 && Number(moment().utcOffset("+05:30").format("mm"))<31)
// )) ) && (moment().utcOffset("+05:30").format("dddd")!=="Saturday" || moment().utcOffset("+05:30").format("dddd")!=="Sunday"))
// {
// axios.get("https://www.nseindia.com/").then((data) => {
//   var headers=data['headers']
//   var cookie;
//   Object.keys(headers).map(key =>{
//     if(key=="set-cookie"){
//       let cook=headers[key]
//       cookie=cook[0]+"; "+cook[1]+"; "+cook[2]+"; "+cook[3]+";"
//     }
//   })
//   axios.get("https://www.nseindia.com/api/quote-derivative?symbol=NIFTY", 
//   {headers: {
//     "access-control-allow-origin": "nseindia.com",
//     'Host':'www.nseindia.com', 
//     'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:82.0) Gecko/20100101 Firefox/82.0',
//     'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8', 
//     'Accept-Language':'en-US,en;q=0.5', 
//     'Accept-Encoding':'gzip, deflate, br',
//     'DNT':'1', 
//     'Connection':'keep-alive', 
//     'Upgrade-Insecure-Requests':'1',
//     'Pragma':'no-cache',
//     'Cache-Control':'no-cache',  
//     "cookie":cookie
//   }}).then((response)=>{
//     let filterNseFuTNiftyData = response.data.stocks.filter(futData=> futData.metadata.instrumentType=="Index Futures")
//     var niftyVwapAndPrice={
//       vwap:filterNseFuTNiftyData[0].marketDeptOrderBook.tradeInfo.vmap,
//       price:filterNseFuTNiftyData[0].marketDeptOrderBook.carryOfCost.price.lastPrice
//     }
//     database.ref('/nifty/VWAPPrice/'+moment().utcOffset("+05:30").format("hh:mm")).set(niftyVwapAndPrice)
//     console.log(niftyVwapAndPrice)
//   })


//   axios.get("https://www.nseindia.com/api/quote-derivative?symbol=BANKNIFTY", 
//   {headers: {
//     "access-control-allow-origin": "nseindia.com",
//     'Host':'www.nseindia.com', 
//     'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:82.0) Gecko/20100101 Firefox/82.0',
//     'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8', 
//     'Accept-Language':'en-US,en;q=0.5', 
//     'Accept-Encoding':'gzip, deflate, br',
//     'DNT':'1', 
//     'Connection':'keep-alive', 
//     'Upgrade-Insecure-Requests':'1',
//     'Pragma':'no-cache',
//     'Cache-Control':'no-cache', 
//     "cookie":cookie
//   }}).then((response)=>{
//     let filterNseFuTBANKNIFTYData = response.data.stocks.filter(futData=> futData.metadata.instrumentType=="Index Futures")
//     var BANKNIFTYVwapAndPrice={
//       vwap:filterNseFuTBANKNIFTYData[0].marketDeptOrderBook.tradeInfo.vmap,
//       price:filterNseFuTBANKNIFTYData[0].marketDeptOrderBook.carryOfCost.price.lastPrice
//     }
//     database.ref('/banknifty/VWAPPrice/'+moment().utcOffset("+05:30").format("hh:mm")).set(BANKNIFTYVwapAndPrice)
//     console.log(BANKNIFTYVwapAndPrice)
//   })


// })
// }else{
//   console.log("Close Futures")
// }
// }, 30000);



app.get('/', (req, res) => {
  res.send({"Keeplive":"keep running", 
  timeOfServer: moment().format("YYYY-MM-DD, hh:mm:ss"),
  time: moment().utcOffset("+05:30").format("YYYY-MM-DD, hh:mm:ss")
})
})

app.listen(process.env.PORT || PORT, () => {
    console.log('listening on *:5000');
});
  