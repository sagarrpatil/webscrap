const express = require("express");
const axios = require("axios");
var firebase = require('firebase')
const cors = require('cors');
const FormData = require('form-data');
const bodyParser = require('body-parser');
const app = express();
const cheerio = require('cheerio');
const Buffer = require('buffer').Buffer;
const cron = require('node-cron');
app.use(cors());
app.use(bodyParser.json());

const PORT = 9000;
const moment = require('moment');
var firebaseConfig = {
  apiKey: "AIzaSyDmzc1OQFVeuosyRS4263k2fPPIIL6Fo1Y",
  authDomain: "merashows.firebaseapp.com",
  databaseURL: "https://merashows-default-rtdb.firebaseio.com",
  projectId: "merashows",
  storageBucket: "merashows.appspot.com",
  messagingSenderId: "909913122644",
  appId: "1:909913122644:web:d993e7e78d284f308a0ac1",
  measurementId: "G-X2CQNZX4QW"
};
firebase.initializeApp(firebaseConfig)
let database = firebase.database();
// const payKey={
//   username: "rzp_live_D6pzNiHMFu1om5",
//   password: "8bErktcbBt6B9BIfnid9nTLc"
// }
const payKey={
  username: "rzp_test_RGBsBmhGE2n1gh",
  password: "qiYgz27SVjOlg5nbSBM8KLjy"
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optionally, you can throw the error or handle it here.
});


//WhatsAPP Code
app.get('/api/sendWAmessage/:message/:phone', async (req, res) => {
  try {
    const { message, phone } = req.params;

    const fbTokenResponse = await axios.get("https://graph.facebook.com/v2.10/oauth/access_token", {
      params: {
        grant_type: "fb_exchange_token",
        client_id: "296113739720920",
        client_secret: "3ed23567bd175be409952a1db7642788",
        fb_exchange_token: "EAAENUFpE6NgBO1qmPpAP2ZAmrrUrT7tgKS4j7smvZCYUFDxaRVhZAKeGBS7t2BDZBKqQq3zJKH6dpByPWFTmDVgGvM18KNFSZCnhYEiLyY0sUivdvWPYcXZBLizORPxsZANxW8Jp6kTKkOg3Y8fNZBY9uDrHgJexKq0t5L3D3x3F2uEydguh8KGLMEKOyJ53uDrKbtcDxmBFCzFjnvpKWt5Yikkim30ZD"
      }
    });

    const config = {
      headers: {
        "Authorization": `Bearer ${fbTokenResponse.data.access_token}`,
        "Content-Type": "application/json"
      }
    };

    const data = {
      messaging_product: "whatsapp",
      to: `91${phone}`,
      type: "template",
      template: {
        name: message,
        language: { code: "en" }
      }
    };

    const response = await axios.post("https://graph.facebook.com/v18.0/211432598730348/messages", data, config);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//WhatsAPP code end

// Your route handling code
app.get('/api/getAllEvents', async (req, res) => {
  try {
    const snapshot = await database.ref('/events').orderByChild('rank').once('value');
    const eventsArray = Object.entries(snapshot.val() || {}).map(([key, value]) => ({ key, ...value }));
    const sortedEvents = eventsArray
      .filter(event => event.active === true)
      .sort((a, b) => a.rank - b.rank);
    const resultEvents = sortedEvents.reduce((acc, event) => {
      acc[event.key] = event;
      return acc;
    }, {});

    console.log(resultEvents); // Log the sorted and filtered events for debugging
    res.json(resultEvents);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get('/api/banners', async (req, res) => {
  try {
    const snapshot = await database.ref('/banners').once('value');
    const bannerArray = snapshot && snapshot.val() ? snapshot.val() : [];
    let bannerArrayFilter = bannerArray.filter(x => x.href && x.img);
    res.json(bannerArrayFilter);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/api/myshows', async (req, res) => {
  if(req.headers['token']){
  try {
    let token = JSON.parse(atob(req.headers['token']));
    let getAllPaymentdata = await getAllPayment(token.user.phoneNumber, 100, 1);
    res.json(getAllPaymentdata);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
  }else{
    res.status(500).json({ error: "unauthorized" });
  }
});

app.get('/api/geteventbyID/:id', async (req, res) => {
  let id = req.params.id
  try {
    const snapshot = await database.ref('/events/'+id).once('value');
    const events = snapshot.val();
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get('/api/successTransactionbyemail/email/:email', async (req, res) => {
  let email = req.params.email
  try {
    const snapshot = await database.ref("SuccessTransactionQRcode").orderByChild("email").equalTo(email).once('value');
    const SuccessTransactionQRcode = snapshot.val();
    res.json(SuccessTransactionQRcode);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get('/api/geteventbyClient/:id', async (req, res) => {
  let id = req.params.id
  try {
    const snapshot = await database.ref('/events/').orderByChild('owner/contact').equalTo(id).once('value');
    const events = snapshot.val();
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get('/api/successTransactionbyPaymentID/:id', async (req, res) => {
  let id = req.params.id
  try {
    const snapshot = await database.ref('/SuccessTransactionQRcode/'+id).once('value');
    const SuccessTransactionQRcode = snapshot.val();
    res.json(SuccessTransactionQRcode);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/api/paymentcall', async (req, res) => {
  const requestData = req.body;
  try {
    const snapshot = await database.ref("/SuccessTransactionQRcode/"+requestData.razorpay_payment_id).set(requestData);
    res.json(snapshot);
    setPayment(requestData.razorpay_payment_id);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/api/postevents', async (req, res) => {
  try {
    const requestData = req.body.data;
    if (!requestData) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
    const decodedData = Buffer.from(requestData, 'base64').toString('utf-8');
    const eventData = JSON.parse(decodedData);
    const eventName = createEventName(eventData.title, eventData.owner.contact);
    await database.ref(`/events/${eventName}`).set(eventData);
    res.json({ success: true });
  } catch (error) {
    console.error("Error posting events:", error);
    res.status(500).json({ error: "Internal Server Error: " + error.message });
  }
});
function createEventName(title, contact) {
  const sanitizedTitle = title.replace(/ /g, "-").replace(/[^\w\s]/gi, '');
  const encodedContact = Number(contact.replace("+91",""))*2;
  return sanitizedTitle +"-"+ encodedContact;
}

app.get('/api/getTransactionEventOwnerbyMailD/:token/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const token = req.params.token ? JSON.parse(Buffer.from(req.params.token, 'base64').toString('utf-8')) : null;
    console.log(token)
    if(token.email){
    const snapshot = await database.ref("transaction")
      .orderByChild("notes/eventOwner").equalTo(token.email)
      .once('value');
    if (!snapshot.exists()) {
      return res.json([]);
    }
    const extractedData = Object.values(snapshot.val()).map(item => {
      if (item.notes && item.notes.address === id && item.status !== "refund") {
        return {
          id: item.id,
          amount: item.amount,
          transaction: item.notes.transaction
        };
      } else {
        return null;
      }
    }).filter(item => item !== null);
    res.json(extractedData);
    }
    else {
      res.json([]);
    }
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/api/retryPayment/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const response = await axios.get(`https://api.razorpay.com/v1/payments/${id}`, {
      auth: payKey
    });

    const eventsData = response.data;
    if (isPaymentSuccessful(eventsData)) {
      const successData = extractSuccessData(id, eventsData);
      await saveSuccessTransaction(successData);
      await saveTransactionDetails(id, eventsData);
      res.json(eventsData);
    } else {
      res.json({});
    }
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Helper function to check if payment is successful
function isPaymentSuccessful(eventsData) {
  return eventsData.status === "authorized" || eventsData.status === "captured";
}

// Helper function to extract success data
function extractSuccessData(id, eventsData) {
  return {
    razorpay_payment_id: id,
    qrcode: id.replace("pay_", ""),
    email: eventsData.email,
    showtitle: eventsData.notes.showtitle,
    showid: eventsData.notes.address,
    status: true,
    transaction: JSON.parse(eventsData.notes.transaction),
    eventDate: eventsData.notes.eventDate,
    starttime: "10:00 AM",
    venue: eventsData.notes.venue
  };
}

// Helper function to save successful transaction
async function saveSuccessTransaction(data) {
  await database.ref(`/SuccessTransactionQRcode/${data.razorpay_payment_id}`).set({...data});
}

// Helper function to save transaction details
async function saveTransactionDetails(id, eventsData) {
  await database.ref(`/transaction/${id}`).set({ ...eventsData });
}

function setPayment(id){
  axios.get("https://api.razorpay.com/v1/payments/"+id, {
          auth: payKey
        }).then(async (response)=>{
         await database.ref(`/transaction/`+id).set({...response.data});
          console.log(response.data);
        });
}


function getAllPayment(phone, count, sr){
  return axios.get(`https://api.razorpay.com/v1/payments?count=${count}&skip=${sr}&contact=${encodeURIComponent(phone)}`, {
          auth: payKey
        }).then(async (response)=>{
            return extractPaymentDataDetails(response.data.items);
  });
}

function extractPaymentDataDetails(payments) {

  return payments.map((payment) => {
    let transactionData = null;
    // console.log(payment)
    // Ensure notes and transaction are available before parsing
    if (payment.notes && payment.notes.transaction) {
      try {
        transactionData = JSON.parse(payment.notes.transaction);
      } catch (error) {
        console.log(`Error parsing transaction for payment ID ${payment.id}:`, error);
      }
    }
    return {
      razorpay_payment_id: payment.id,
      qrcode: payment.id.replace("pay_", ""),
      email: payment.email,
      showtitle: payment.notes.showtitle,
      showid: payment.notes.address,
      status: payment.status,
      transaction: transactionData,
      eventDate: payment.notes.eventDate,
      venue: payment.notes.venue,
      createdAt: payment.created_at
    };
  });
}

//Instamojo
const baseURL = "https://test.instamojo.com/";
const apibaseURL = "https://test.instamojo.com/";
const client_id = 'test_lB5zTjGMe1MXMeSlwHPNpUDynWAMJsNDyqM';
const client_secret = 'test_te70loEvtwNNHduAd1mheIa83xjTxwmBeP9Ay8speJATBPgJWlWeYGZNL0uERtsZwO0IR1ypIs8UqIfE9HjUdrEuxy00IZL2FuizM4LuLosv2ru2AUydV90XaNe'

app.post('/api/setuppayment', async (req, res) => {
  const requestData = req.body;
  const encodedParams = new URLSearchParams();
  encodedParams.set('grant_type', 'client_credentials');
  encodedParams.set('client_id', client_id);
  encodedParams.set('client_secret', client_secret);
  try {
  const options = {
    method: 'POST',
    url: apibaseURL+'oauth2/token/',
    headers: {
      accept: 'application/json',
      'content-type': 'application/x-www-form-urlencoded'
    },
    data: encodedParams,
  };
  
  axios
    .request(options)
    .then(function (response) {
      const encodedP = new URLSearchParams();
      encodedP.set('allow_repeated_payments', 'false');
      encodedP.set('send_email', 'false');
      encodedP.set('amount', requestData.amount);
      encodedP.set('purpose', requestData.address);
      encodedP.set('notes', requestData.transaction);
      encodedP.set('buyer_name', requestData.name);
      encodedP.set('email', requestData.email);
      encodedP.set('phone', '7057455569');
      encodedP.set('redirect_url', `https://in.merashow.com/show/`+ encodeURI(requestData.email))
      const option = {
        method: 'POST',
        url: baseURL+'v2/payment_requests/',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${response.data.access_token}`,
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: encodedP,
      };
      axios
        .request(option)
        .then(function (resp) {
          res.json(resp.data);
        })
        .catch(function (error) {
          console.error(error);
        });
          })
          .catch(function (error) {
            console.error(error);
          });
        }catch (error) {
          console.error("Error fetching events:", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
})

app.post('/api/getPaymentStatus', async (req, responsed) => {
  const requestData = req.body;
  const encodedParams = new URLSearchParams();
  encodedParams.set('grant_type', 'client_credentials');
  encodedParams.set('client_id', client_id);
  encodedParams.set('client_secret', client_secret);
  try {
  const options = {
    method: 'POST',
    url: apibaseURL+'oauth2/token/',
    headers: {
      accept: 'application/json',
      'content-type': 'application/x-www-form-urlencoded'
    },
    data: encodedParams,
  };
  
  axios
    .request(options)
    .then((response) => {
        // console.log(response.data.access_token)

        const option = {
          method: 'GET',
          url: apibaseURL+'v2/payments/'+requestData.payment_id,
          headers: {accept: 'application/json', Authorization: `Bearer ${response.data.access_token}`}
        };
        
        axios
          .request(option)
          .then(function (res) {
            // console.log(res.data);
            responsed.json(res.data)
          })
          .catch(function (error) {
            console.error(error);
          });
    }).catch(function (error) {
      console.error(error);
    });
  }catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
})


// setInterval(() => {
process.env.TZ = 'Asia/Kolkata';



app.listen(process.env.PORT || PORT, () => {
    console.log('listening on *:' + PORT);
});
