const express = require("express");
const axios = require("axios");
var firebase = require('firebase')
const cors = require('cors');
const FormData = require('form-data');
const app = express();
const cheerio = require('cheerio');
const cron = require('node-cron');
const { NseIndia } = require("stock-nse-india");
const  nseIndia = new  NseIndia();
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
app.use(cors({
  origin: '*'
}));
const PORT = 9000;
const moment = require('moment');
var firebaseConfig = {
  apiKey: "AIzaSyDkoGMgvAmfDUW3h0LmYH8LbZrinsYEyAA",
  authDomain: "studebok.firebaseapp.com",
  databaseURL: "https://studebok-default-rtdb.firebaseio.com",
  projectId: "studebok",
  storageBucket: "studebok.appspot.com",
  messagingSenderId: "613111157977",
  appId: "1:613111157977:web:1e52da162477a390d65ac8",
  measurementId: "G-NQYE95LQ5Z"
};
firebase.initializeApp(firebaseConfig)
let database = firebase.database()
var data;
database.ref(`/`).once('value').then(function(snapshot) {
  data =snapshot.val();
})

// setInterval(() => {
process.env.TZ = 'Asia/Kolkata';
const schedule = '*/10 9-16 * * 1-5';
// const schedule = '*/10 * 9-16 * * 1-5';
  // var date=moment().utcOffset("+05:30").format("DDMMYYYY");
  const getValue = async () => {
  const formData = new FormData();
  // let value = "( {33619} ( [0] 4 hour close > [0] 4 hour ema( [0] 4 hour close , 200 ) and [0] 4 hour close >= [0] 4 hour ema( [0] 4 hour close , 55 ) and market cap >= 5000 and [0] 4 hour volume > [0] 4 hour sma( [0] 4 hour close , 20 ) and [0] 4 hour close <= [0] 4 hour ema( [0] 4 hour close , 13 ) and [0] 4 hour close <= [0] 4 hour ema( [0] 4 hour close , 44 ) ) )"
  let value = "( {33489} ( latest close > latest sma( latest close , 44 ) and 1 day ago  close <= 1 day ago  sma( latest close , 44 ) and latest close > latest open and market cap >= 500 and latest sma( latest close , 44 ) > 5 days ago sma( 5 days ago close , 44 ) and latest sma( latest close , 44 ) > 10 days ago sma( 10 days ago close , 44 ) and latest sma( latest close , 44 ) > 30 days ago sma( 30 days ago close , 44 ) and latest sma( latest close , 44 ) > 60 days ago sma( 60 days ago close , 44 ) ) )"
  formData.append('scan_clause', value);
   axios.get("https://chartink.com/screener/44ema-232").then(resp=>{
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
        database.ref(`/ema55Above13Emabelow`).set(response.data);
        response.data?.data.map(val=>{
          database.ref(`/stockinstack/`+val.nsecode).set(val);
        })
        database.ref(`/timeOfData`).set(moment().utcOffset("+05:30").format("YYYY-MM-DD, hh:mm:ss"));
      })
    })
  }
  cron.schedule('30 17 * * 1-5', getValue);


  const getWhatsappData = async (message, phone) =>{
    try{
      await axios.get("https://graph.facebook.com/v2.10/oauth/access_token?grant_type=fb_exchange_token&client_id=296113739720920&client_secret=3ed23567bd175be409952a1db7642788&fb_exchange_token=EAAENUFpE6NgBOwK78GagI4x01IT8rjaSZA9QEj5fytZAVtrvjZCQMLc3fgF4ZA1djka4e3wnYI51m9xDzY8cp8rCUXLhNHQJrAwuSS3MPCkgP0DtPbgZAgccMTZA8SWzBqaj0lqzQfVnrgwh6z1uNzvQwGu3P8lG4Wq7dne4yKcZBZCxY88RVLCwLA1crO2EvqqE")
      .then(async (resp)=>{
        // console.log(resp.data.access_token)
        let config = {
          headers: {
            "Authorization": "Bearer " + resp.data.access_token,
            "Content-Type":"application/json"
          }
        }
        let data= {
          "messaging_product": "whatsapp",
          "recipient_type": "individual",
          "to": "91"+phone,
          "type": "text",
          "text": { 
            "preview_url": true,
            "body": message
            }
        }
        await axios.post("https://graph.facebook.com/v17.0/137094856143524/messages", data, config).then(res=>{
          console.log(res)
        })
      })
    } catch (error) {
        console.log(error)
    }
  }

// const snsClient = new SNSClient({ 
//   credentials: {
//     accessKeyId: "AKIAXQWF3ZSU3DEZPKVS",
//     secretAccessKey: "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",
//   },
//   region: 'eu-north-1' });
const phoneNumber = ['7057455569', 
'9881015524', "8551892121", "7588861931", "9890228501"
];

cron.schedule('30 17 * * 1-5', () =>
    database.ref(`/`).once('value').then((snapshot)=> {
      let message = snapshot.val().ema55Above13Emabelow?.data?.map(obj => `*${obj.nsecode}*                ${obj.close}  \n https://in.tradingview.com/chart/?symbol=${obj.nsecode}`).join('\n\n');
      if(message)
        for (let i = 0; i < phoneNumber.length; i++) {
          getWhatsappData(`Add in your Watchlist \n\n\n` + message, phoneNumber[i])
        }
    })
)

app.get('/send', (req, res) => {
  res.send({"Keeplive":"executed", 
})
database.ref(`/`).once('value').then((snapshot)=> {
  let message = snapshot.val().ema55Above13Emabelow?.data?.map(obj => `*${obj.nsecode}*                ${obj.close}  \n https://in.tradingview.com/chart/?symbol=${obj.nsecode}`).join('\n\n');
  if(message)
    for (let i = 0; i < phoneNumber.length; i++) {
      getWhatsappData(`Automate Market \n\n\n` + message, phoneNumber[i])
    }
})
})

app.get('/', (req, res) => {
  res.send({"Keeplive":"keep running", 
  timeOfServer: moment().format("YYYY-MM-DD, hh:mm:ss"),
  time: moment().utcOffset("+05:30").format("YYYY-MM-DD, hh:mm:ss")
})
getValue();
})

const getWhatsappInitailize = async (message, phone) =>{
  try{
    await axios.get("https://graph.facebook.com/v2.10/oauth/access_token?grant_type=fb_exchange_token&client_id=296113739720920&client_secret=3ed23567bd175be409952a1db7642788&fb_exchange_token=EAAENUFpE6NgBO0g1AUZA1FVrSS61DVSOTvXMTdhiMCz8zYZA9sKRdQ9tNnVNpmTeb918DOFmEyoX51GimEieiwDtHZBbfkZAkraZB5jfY1ElZBcdWSO2Kf4gbNyerZAmSKQS51hDupIiZASmRYbf3wbjv2JH1xtkkA6hdWRYLKOUmHAgQqdPTHj1Uaiv16piOun6")
    .then(async (resp)=>{
      // console.log(resp.data.access_token)
      let config = {
        headers: {
          "Authorization": "Bearer " + resp.data.access_token,
          "Content-Type":"application/json"
        }
      }
      let data= { 
        "messaging_product": "whatsapp", 
        "to": "91"+phone, 
        "type": "template",
        "template": { 
            "name": "get_signal", 
            "language": { "code": "en" } 
        }
    }
      await axios.post("https://graph.facebook.com/v17.0/137094856143524/messages", data, config).then(res=>{
        console.log(res.data)
      })
    })
  } catch (error) {
      console.log(error, "sasasa")
  }
}
cron.schedule('0 8 * * 1-5', () => {
  for (let i = 0; i < phoneNumber.length; i++) {
    getWhatsappInitailize(``, phoneNumber[i])
  }
})
app.listen(process.env.PORT || PORT, () => {
    console.log('listening on *:' + PORT);
});
  

cron.schedule('* 9-16 * * 1-5', () => {
database.ref(`/`).once('value').then((snapshot)=> {
  let val = snapshot.val().stockinstack;
  Object.keys(val).map(key => { 
    moneycontrolLivePrice(val[key])
  });
})
})
const sendMessage=(message)=>{
            if(message)
                for (let i = 0; i < phoneNumber.length; i++) {
                  getWhatsappData(message, phoneNumber[i])
                }
}
  const moneycontrolLivePrice = async (obj) =>{
    try{
    await axios.get("https://www.moneycontrol.com/india/stockpricequote/personal-care/colgatepalmoliveindia/CPI").then(async (res)=>{
      await axios.get(`https://priceapi.moneycontrol.com/techCharts/intra?symbol=${obj.nsecode}&resolution=1&from=${moment().subtract(1, 'days').unix()}&to=${moment().unix()}`).then(response=>{
          console.log(obj.nsecode, response.data?.data[response.data.data.length-1].value)
          database.ref(`/stockForBuy/`+obj.nsecode).once('value').then((snapshot)=> {
            if(snapshot.val()?.sellAt >= response.data?.data[response.data.data.length-1].value && snapshot.val()?.entry === "pending"){
              database.ref(`/stockForBuy/`+obj.nsecode).remove();
              database.ref(`/stockinstack/`+obj.nsecode).remove();
            } 
            if(snapshot.val()?.sellAt >= response.data?.data[response.data.data.length-1].value && snapshot.val()?.entry === "Buy"){
              let message = `*${obj.nsecode}* squareOff your position`;
              sendMessage(`*Stoploss hit* \n\n\n` + message)
              database.ref(`/stockForBuy/`+obj.nsecode).remove();
              database.ref(`/stockinstack/`+obj.nsecode).remove();
            }else if(snapshot.val()?.buyAt <= response.data?.data[response.data.data.length-1].value && snapshot.val()?.entry !== "Buy"){
              let message = `*${obj.nsecode}* \nCMP: ${response.data?.data[response.data.data.length-1].value}`
              sendMessage(`*Buy Now* \n\n\n` + message)
              database.ref(`/stockForBuy/`+obj.nsecode+"/entry").set("Buy");
            }
          })
      })
    })
  }catch(error){
    console.log(error)
  }
  }
  const tommorrowCalled = () =>{
    const range = {
      start: new Date(),
      end: new Date()
    }
    database.ref(`/`).once('value').then((snapshot)=> {
      let val = snapshot.val().stockinstack;
      Object.keys(val).map(key => { 
        nseIndia.getEquityHistoricalData(val[key].nsecode, range).then(data => {
          let percent= 0.005 * data[0].data[data[0].data.length-1]?.CH_TRADE_HIGH_PRICE;
          let percentLow= 0.005 * data[0].data[data[0].data.length-1]?.CH_TRADE_LOW_PRICE;
          console.log(data[0].data[data[0].data.length-1])
          let obj = {
            symbol: val[key].nsecode,
            buyAt: Number(data[0].data[data[0].data.length-1].CH_TRADE_HIGH_PRICE+percent).toFixed(2),
            sellAt: Number(data[0].data[data[0].data.length-1].CH_TRADE_LOW_PRICE-percentLow).toFixed(2),
            entry: "pending",
            ...data[0].data[data[0].data.length-1]
          }
          database.ref(`/stockForBuy/`+val[key].nsecode).set(obj);
          let message = `*${val[key].nsecode}*\nBuy At: ${Number(data[0].data[data[0].data.length-1].CH_TRADE_HIGH_PRICE+percent).toFixed(2)}\nStop loss: ${Number(data[0].data[data[0].data.length-1].CH_TRADE_HIGH_PRICE-percent).toFixed(2)}\n  https://in.tradingview.com/chart/?symbol=${val[key].nsecode}`;
          if(message)
            for (let i = 0; i < phoneNumber.length; i++) {
              getWhatsappData(`For Next Trading Session \n\n` + message, phoneNumber[i])
            }
        })
      });
    })
  }
  cron.schedule('30 19 * * 1-5', () => {
    tommorrowCalled();
  })
  cron.schedule('30 20 * * 1-5', () => {
    database.ref(`/stockinstack/`).remove();
  })