const express = require('express')
const app = express()
const dotenv = require('dotenv').config();

const MONGOPASS = process.env.MONGO_PW


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://greenberga:${MONGOPASS}@steaks4stakes.vgfrc.mongodb.net/steaks4stakes?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});



app.get('/', function (req, res) {
  res.send('hello world')
})

app.listen(3000)