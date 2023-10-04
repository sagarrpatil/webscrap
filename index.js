const express = require("express");
const axios = require("axios");
var firebase = require('firebase')
const cors = require('cors');
const FormData = require('form-data');
const app = express();
const cheerio = require('cheerio');
const cron = require('node-cron');
const { NseIndia } = require("stock-nse-india");
const puppeteer = require('puppeteer');
const { createProxyMiddleware } = require('http-proxy-middleware');
const  nseIndia = new  NseIndia();
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Cache-Control': 'max-age=0',
};
const proxyMiddleware = createProxyMiddleware({
  target: 'https://groww.in/', 
  changeOrigin: true, 
});
app.use('/', proxyMiddleware);
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
app.use(cors({
  origin: '*'
}));
const PORT = 9000;
const moment = require('moment');
var firebaseConfig = {
  apiKey: "AIzaSyCqa-ayRJHj3rBPjD-fHfK1mXINmUNIbRI",
  authDomain: "algotrading-dd3cc.firebaseapp.com",
  databaseURL: "https://algotrading-dd3cc-default-rtdb.firebaseio.com",
  projectId: "algotrading-dd3cc",
  storageBucket: "algotrading-dd3cc.appspot.com",
  messagingSenderId: "1096781555916",
  appId: "1:1096781555916:web:73ac05660a6c3f37bd7a69",
  measurementId: "G-3JFDPFGC8W"
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
'9881015524', "8551892121", "7588861931", "9890228501", "8097519496", "8806003350"
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

 

const sendMessage=(message)=>{
  if(message)
      for (let i = 0; i < phoneNumber.length; i++) {
        getWhatsappData(message, phoneNumber[i])
      }
}
database.ref(`/`).on('value', async (snapshot) => {
  var objSnap = snapshot.val();
  // console.log(objSnap);
    cron.schedule('* 9-16 * * 1-5', () => {
      let val = objSnap.stockForBuy;
      val && Object.keys(val).map(key => { 
        // moneycontrolLivePrice(key, val)
      });
    })

})


  const moneycontrolLivePrice = async (obj, stockForBuy) =>{
    try{
    await axios.get("https://www.moneycontrol.com/india/stockpricequote/personal-care/colgatepalmoliveindia/CPI").then(async (res)=>{
      await axios.get(`https://priceapi.moneycontrol.com/techCharts/intra?symbol=${obj}&resolution=1&from=${moment().subtract(1, 'days').unix()}&to=${moment().unix()}`).then(response=>{
            if(stockForBuy[obj]?.sellAt >= response.data?.data[response.data.data.length-1].value && stockForBuy[obj]?.entry === "pending"){
              database.ref(`/stockForBuy/`+obj).remove();
              database.ref(`/stockinstack/`+obj).remove();
            } 
            if(stockForBuy[obj]?.sellAt >= response.data?.data[response.data.data.length-1].value && stockForBuy[obj]?.entry === "Buy"){
              let message = `*${obj}* squareOff your position`;
              sendMessage(`*Stoploss hit* \n\n\n` + message)
              database.ref(`/stockForBuy/`+obj).remove();
              database.ref(`/stockinstack/`+obj).remove();
            }else if(stockForBuy[obj]?.buyAt <= response.data?.data[response.data.data.length-1].value && stockForBuy[obj]?.entry !== "Buy"){
              database.ref(`/stockForBuy/`+obj+"/entry").set("Buy");
              let message = `*${obj}* \nCMP: ${response.data?.data[response.data.data.length-1].value}`
              sendMessage(`*Buy Now* \n\n\n` + message)
            }
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
      val && Object.keys(val).map(key => { 
        nseIndia.getEquityHistoricalData(val[key].nsecode, range).then(data => {
          let percent= 0.002 * data[0].data[data[0].data.length-1]?.CH_TRADE_HIGH_PRICE;
          let percentLow= 0.002 * data[0].data[data[0].data.length-1]?.CH_TRADE_LOW_PRICE;
          console.log(data[0].data[data[0].data.length-1])
          let obj = {
            symbol: val[key].nsecode,
            buyAt: Number(data[0].data[data[0].data.length-1].CH_TRADE_HIGH_PRICE+percent).toFixed(2),
            sellAt: Number(data[0].data[data[0].data.length-1].CH_TRADE_LOW_PRICE-percentLow).toFixed(2),
            entry: "pending",
            ...data[0].data[data[0].data.length-1]
          }
          database.ref(`/stockForBuy/`+val[key].nsecode).set(obj);
          let message = `*${val[key].nsecode}*\nBuy At: ${Number(data[0].data[data[0].data.length-1].CH_TRADE_HIGH_PRICE+percent).toFixed(2)}\nStop loss: ${Number(data[0].data[data[0].data.length-1].CH_TRADE_LOW_PRICE-percentLow).toFixed(2)}\n  https://in.tradingview.com/chart/?symbol=${val[key].nsecode}`;
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



  
   
 

  const getNiftyValue= async () =>{ 
    try{
  setInterval(async ()=>{
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const currentDate = moment();
    const daysUntilThursday = (4 - currentDate.day() + 7) % 7;
    const nextThursday = currentDate.add(daysUntilThursday, 'days');
    let exp = nextThursday.format("YYYY-MM-DD");
    const page = await browser.newPage();
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36';
    await page.setUserAgent(userAgent);
    await page.goto('https://groww.in/options/nifty?expiry='+exp);
    await page.waitForTimeout(10000);
  
  
  
   axios.get("https://groww.in/v1/api/option_chain_service/v1/option_chain/nifty?expiry="+exp).then(async(response)=>{
    let currentValue=await axios.get("https://appfeeds.moneycontrol.com/jsonapi/market/indices&format=json&t_device=iphone&t_app=MC&t_version=48&ind_id=9").then(async (res)=>{
    return res.data.indices.lastprice
    })  
    const call = [];
    const put = [];
    
    const expiryDates = response.data.expiryDetailsDto.expiryDates;
    const optionChainRequests = expiryDates.map(exp => {
      return axios.get("https://groww.in/v1/api/option_chain_service/v1/option_chain/nifty?expiry=" + exp)
        .then(response1 => {
      
          const callOptionIds = response1.data.optionChains.map(item => item.callOption?.growwContractId);
          const putOptionIds = response1.data.optionChains.map(item => item.putOption?.growwContractId);
          call.push(...callOptionIds);
          put.push(...putOptionIds);
        });
    });
    Promise.all(optionChainRequests)
    .then(() => {
    
       axios.post("https://groww.in/v1/api/stocks_fo_data/v1/tr_live_prices/exchange/NSE/segment/FNO/latest_prices_batch", call).then(res=>{
       let {sumofCallChangeOI, sumofPutChangeOI} = Object.values(res.data).reduce((accumulator, current) => {
          let callValChangeOI = parseFloat(current.oiDayChange) || 0;

          if (callValChangeOI > 0) {
            accumulator.sumofCallChangeOI += callValChangeOI;
          } else {
            accumulator.sumofPutChangeOI += -callValChangeOI;
          }
          return accumulator;
        },
        { sumofCallChangeOI: 0, sumofPutChangeOI: 0 });
        
     

      axios.post("https://groww.in/v1/api/stocks_fo_data/v1/tr_live_prices/exchange/NSE/segment/FNO/latest_prices_batch", put).then(res=>{
        let {sumofCallChangeOIPE, sumofPutChangeOIPE} = Object.values(res.data).reduce((accumulator, current) => {
          let callValChangeOI = parseFloat(current.oiDayChange) || 0;

          if (callValChangeOI > 0) {
            accumulator.sumofPutChangeOIPE += callValChangeOI;
          } else {
            accumulator.sumofCallChangeOIPE += -callValChangeOI;
          }
          return accumulator;
        },
        { sumofCallChangeOIPE: 0, sumofPutChangeOIPE: 0 });



        console.log(  );
        let ceCall=sumofCallChangeOI+ sumofCallChangeOIPE;
        let pePut=sumofPutChangeOI+ sumofPutChangeOIPE;
        const data = {
          sumofCallChangeOI: ceCall,
          sumofPutChangeOI: pePut,
          currentValue: currentValue, // Replace with the actual value
          changeInPCR: Number((pePut)/(ceCall)).toFixed(2),
        };
       
        if (sumofCallChangeOI) {
          console.log(data);
          database.ref(`/niftyChangeOI/`).set(data);
        }
      })
      })
    })
    .catch(error => {
      console.error("Error:", error);
    });
  })
  await browser.close();
}, 20000);
    }catch (error){

    }
  }
 cron.schedule('* 9-16 * * 1-5', () => {
    getNiftyValue();

    setInterval(async ()=>{
      await axios.get("https://appfeeds.moneycontrol.com/jsonapi/market/indices&format=json&t_device=iphone&t_app=MC&t_version=48&ind_id=9").then(async (res)=>{
        let currentValue= res.data.indices.lastprice;
        console.log(currentValue)
        database.ref(`/niftyChangeOI/currentValue`).set(currentValue);
      })  
    }, 10000)
  })





















  
  setInterval(async ()=>{

    const currentDate = moment();
    const daysUntilThursday = (4 - currentDate.day() + 7) % 7;
    const nextThursday = currentDate.add(daysUntilThursday, 'days');
    let exp = nextThursday.format("YYYY-MM-DD");
     axios.get("https://groww.in/v1/api/option_chain_service/v1/option_chain/nifty?expiry="+exp).then(response=>{
    const { totalBuyQtyCE, totalSellQtyCE, totalBuyQtyPE,  totalSellQtyPE } = response.data.optionChains.reduce(
      (acc, val) => {
        const totalBuyQtyCE = Number(val.callOption.totalBuyQty) || 0;
        const totalSellQtyCE = Number(val.callOption.totalSellQty) || 0;
        const totalBuyQtyPE = Number(val.putOption.totalBuyQty) || 0;
        const totalSellQtyPE = Number(val.putOption.totalSellQty) || 0;
          acc.totalBuyQtyCE += totalBuyQtyCE;
          acc.totalSellQtyCE += totalSellQtyCE;
       
  
          acc.totalBuyQtyPE += totalBuyQtyPE;
          acc.totalSellQtyPE += totalSellQtyPE;
  
  
          
        return acc;
      },
      { totalBuyQtyCE: 0, totalSellQtyCE: 0, totalBuyQtyPE:0, totalSellQtyPE:0 }
    );
      let buyers = totalSellQtyPE + totalBuyQtyCE;
      let sellers = totalBuyQtyPE + totalSellQtyCE;
        console.log(Number(buyers/sellers).toFixed(2) )
  
    })
  }, 6000);