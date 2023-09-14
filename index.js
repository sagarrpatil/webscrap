const express = require("express");
const axios = require("axios");
var firebase = require('firebase')
const cors = require('cors');
const FormData = require('form-data');
const app = express();
const cheerio = require('cheerio');
const cron = require('node-cron');
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
  let value = "( {33619} ( [0] 4 hour close > [0] 4 hour ema( [0] 4 hour close , 200 ) and [0] 4 hour close >= [0] 4 hour ema( [0] 4 hour close , 55 ) and market cap >= 5000 and [0] 4 hour volume > [0] 4 hour sma( [0] 4 hour close , 20 ) and [0] 4 hour close <= [0] 4 hour ema( [0] 4 hour close , 13 ) and [0] 4 hour close <= [0] 4 hour ema( [0] 4 hour close , 44 ) ) )"
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
        database.ref(`/ema55Above13Emabelow`).set(response.data);
        database.ref(`/timeOfData`).set(moment().utcOffset("+05:30").format("YYYY-MM-DD, hh:mm:ss"));
      })
    })
  }
  cron.schedule(schedule, getValue);


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

cron.schedule('30 9-15 * * 1-5', () =>
    database.ref(`/`).once('value').then((snapshot)=> {
      let message = snapshot.val().ema55Above13Emabelow?.data?.map(obj => `*${obj.nsecode}*                ${obj.close}  \n https://in.tradingview.com/chart/?symbol=${obj.nsecode}`).join('\n\n');
      if(message)
        for (let i = 0; i < phoneNumber.length; i++) {
          getWhatsappData(`Automate Market \n\n\n` + message, phoneNumber[i])
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
    await axios.get("https://graph.facebook.com/v2.10/oauth/access_token?grant_type=fb_exchange_token&client_id=296113739720920&client_secret=3ed23567bd175be409952a1db7642788&fb_exchange_token=EAAENUFpE6NgBOwVLTYIF1rGIz9w7TfIUZAyXu3ixCwbeJ4JYRljPL8RGQ9vlOVSt0TnM3ROVIXXBuDwnDOZBjM99fJxg0uR1ZCdjgzpEkNZCWB2ZAdOks57uZCcwMVScMBhPhMIeucG0wvDjzbJsXeaPK3Fu3CK6Ol8bKQgcG7ZA3yFGJ5b8pAt3lplCioZChZALZA")
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
  


const getValueofDelivery = async () =>{
  try{
    let configHeader = {
      headers: {
        "User-Agent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
      }
    }
    await axios.get("https://www.moneycontrol.com/india/stockmarket/stock-deliverables/marketstatistics/indices/cnx-100.html", configHeader).then(async (response)=>{
    const $ = cheerio.load(response.data);
    const tableRows = $('table tr');
    const tableData = [];
    let date = "date"+String(moment().format("DDMMYYYY"))
    tableRows.each((index, element) => {
      const tableColumns = $(element).find('td'); // Adjust the selector for columns
      const rowData = [];
      tableColumns.each((i, el) => {
        rowData.push($(el).text().trim());
      });
      tableData.push(rowData);
    });
    const jsonData1 = tableData.map((row) => {
      const obj = {};
      obj.symbol = row[0];
      obj.lastPrice = row[1];
      obj.Chg = row[2];
      obj.ChgPercent = row[3];
      obj.DeliveryPercent = Number(row[4]);
      obj.Delivery5AvgDaysPercent = Number(row[5]);
      obj.DeliveryVol = row[6];
      obj.Delivery5AvgVol = row[7];
      obj.tradeVol = row[8];
      return obj;
    });
    database.ref(`/stocksDeliveryHolding/`+date).set(jsonData1.filter((val)=> val.DeliveryPercent), async() =>{
      await axios.get("https://www.moneycontrol.com/india/stockmarket/stock-deliverables/marketstatistics/indices/nifty-midcap-50.html", configHeader).then(async (response)=>{
        const $ = cheerio.load(response.data);
        const tableRows = $('table tr');
        const tableData = [];
        let date = "date"+String(moment().format("DDMMYYYY"))
        tableRows.each((index, element) => {
          const tableColumns = $(element).find('td'); // Adjust the selector for columns
          const rowData = [];
          tableColumns.each((i, el) => {
            rowData.push($(el).text().trim());
          });
          tableData.push(rowData);
        });
        const jsonData = tableData.map((row) => {
          const obj = {};
          obj.symbol = row[0];
          obj.lastPrice = row[1];
          obj.Chg = row[2];
          obj.ChgPercent = row[3];
          obj.DeliveryPercent = Number(row[4]);
          obj.Delivery5AvgDaysPercent = Number(row[5]);
          obj.DeliveryVol = row[6];
          obj.Delivery5AvgVol = row[7];
          obj.tradeVol = row[8];
          return obj;
        });
        let obj = [...jsonData1, ...jsonData];
        database.ref(`/stocksDeliveryHolding/`+date).set(obj.filter((val)=> val.DeliveryPercent))
      })
    })
    }).catch(error => {
  console.error('Unhandled promise rejection:', error);
})
}catch (error) {
   console.log(error.response.data)
 }
}
cron.schedule('0 17 * * 1-5', () => {
  getValueofDelivery();
})


// database.ref(`/stocksDeliveryHolding/ACC`).once('value').then((snapshot)=> {
//   console.log("====", snapshot.val())
// })