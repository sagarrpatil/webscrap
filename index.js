const express = require("express");
const axios = require("axios");
var firebase = require('firebase')
const cors = require('cors');
const FormData = require('form-data');
const bodyParser = require('body-parser');
const app = express();
const cheerio = require('cheerio');
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
const payKey={
  username: "rzp_live_D6pzNiHMFu1om5",
  password: "8bErktcbBt6B9BIfnid9nTLc"
}


process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optionally, you can throw the error or handle it here.
});

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
    const requestData = atob(req.body.data);
    const eventData = JSON.parse(requestData);
    const eventName = createEventName(eventData.title, eventData.owner.contact);
    await database.ref(`/events/${eventName}`).set(eventData);
    res.json({ success: true });
  } catch (error) {
    console.error("Error posting events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
function createEventName(title, contact) {
  const sanitizedTitle = title.replaceAll(" ", "-");
  const encodedContact = btoa(contact);
  return sanitizedTitle + encodedContact;
}

app.get('/api/getTransactionEventOwnerbyMailD/email/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const snapshot = await database.ref("transaction").orderByChild("notes/eventOwner").equalTo(email).once('value');

    if (!snapshot.exists()) {
      return res.json([]); // Return an empty array if no data found
    }

    const extractedData = Object.values(snapshot.val()).map(item => ({
      id: item.id,
      amount: item.amount,
      transaction: item.notes.transaction
    }));

    res.json(extractedData);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

function setPayment(id){
  axios.get("https://api.razorpay.com/v1/payments/"+id, {
          auth: payKey
        }).then(async (response)=>{
         await database.ref(`/transaction/`+id).set({...response.data});
          console.log(response.data);
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
