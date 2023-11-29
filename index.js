const express = require("express");
const axios = require("axios");
var firebase = require('firebase')
const cors = require('cors');
const FormData = require('form-data');
const app = express();
const cheerio = require('cheerio');
const cron = require('node-cron');
app.use(cors());
const corsOptions = {
  origin: '*',
};

app.use(cors(corsOptions));


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
  username: "rzp_test_Cnb0oLUJoXGa8e",
  password: "qmHW2i8ksT9Hf0gmC4IVFBbQ"
}


process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optionally, you can throw the error or handle it here.
});

// Your route handling code
app.get('/api/getAllEvents', async (req, res) => {
  try {
    const snapshot = await database.ref('/events').once('value');
    const events = snapshot.val();
    res.json(events);
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
  let id = req.params.email
  try {
    const snapshot = await database.ref("SuccessTransactionQRcode").orderByChild("email").equalTo(this.state.email);
    const events = snapshot.val();
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/api/:id', (req, res) => {
  const id = req.params.id;
  axios.get("https://api.razorpay.com/v1/payments/"+id, {
          auth: payKey
        }).then(async (response)=>{
         await database.ref(`/transaction/`+id).set({...response.data});
          console.log(response.data);
        });
});

// setInterval(() => {
process.env.TZ = 'Asia/Kolkata';



app.listen(process.env.PORT || PORT, () => {
    console.log('listening on *:' + PORT);
});
