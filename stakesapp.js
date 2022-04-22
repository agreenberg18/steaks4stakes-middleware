const express = require('express')
const app = express()
const dotenv = require('dotenv').config();

const GoogleMapsKey = process.env.Google_Places_Key
app.get('/', function (req, res) {
  res.send(GoogleMapsKey)
})

app.listen(3000)