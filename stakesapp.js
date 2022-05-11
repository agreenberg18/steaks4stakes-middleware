const { query } = require('express');

const express = require('express')
const app = express()
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true }))
const dotenv = require('dotenv').config();

const MONGOPASS = process.env.MONGO_PW
const MONGONAME = process.env.MONGO_NAME

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${MONGONAME}:${MONGOPASS}@steaks4stakes.vgfrc.mongodb.net/steaks4stakes?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

async function getStake(stakeid) {
  try {
    await client.connect();
    const database = client.db("steaks4stakes");
    const steaks_4Stakes = database.collection("steaks_4_stakes");

    const query = { stakeid: stakeid };
    const options = {
    };
    const steak = await steaks_4Stakes.findOne(query, options);
    // since this method returns the matched document, not a cursor, print it directly
    console.log(steak);
    return steak
  }
  catch (e) {
    console.log(e)
    return e
  }
  finally {
    await client.close();
  }
}


async function createSteak(steakid, stakes, restaurant, initiator, phone, expDate) {
  try {
    await client.connect();
    const database = client.db("steaks4stakes");
    const steaksCollection = database.collection("steaks_4_stakes");
    // create a document to insert
    const doc = {
      stakeid: steakid,
      initiator: initiator,
      number: phone,
      date: expDate,
      stakes: stakes,
      restaurant: restaurant,
      friends: []
    }
    const result = await steaksCollection.insertOne(doc);
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
    return result
  } finally {
    await client.close();
  }
}

async function addFriend(steakid, name, number) {
  try {
    await client.connect();
    const database = client.db("steaks4stakes");
    const steaks = database.collection("steaks_4_stakes");
    // create a filter for a steak to update
    const filter = { stakeid: steakid };

    const options = { upsert: false };


    const updateDoc = {
      $push: {
        friends: { "name": name, "number": number }
      },
    };
    const result = await steaks.updateOne(filter, updateDoc, options);
    console.log(
      `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
    );
    return result
  } finally {
    await client.close();
  }
}


app.get('/api', function (req, res) {
  res.send('hello world')
})

app.get('/api/testvar', function (req, res) {
  res.send(MONGONAME)
})

app.get('/api/get-steak', async function (req, res) {
  console.log(typeof (req.query))
  let queryParams = req.query
  steakid = queryParams.steakid
  let steakNode = await getStake(steakid).catch(console.dir);
  // delete steakNode.number
  // steakNode.friends.forEach(friend =>{
  //   delete friend.number
  // })
  res.send(steakNode)
})

app.post('/api/create-steak', async function (req, res) {
  let steakid = req.body.steakid
  let phone = req.body.phone
  let name = req.body.name
  let date = req.body.date
  let stakes = req.body.stakes
  let restaurant = req.body.restaurant
  let newSteakNode = await createSteak(steakid,stakes,restaurant, name, phone, date).catch(console.dir)
  if (newSteakNode.acknowledged === true) {
    let steakNode = await getStake(steakid).catch(console.dir);
    delete steakNode.number
    res.send(steakNode)
  }
  else {
    res.send({ "error": "something happened...it didn't work" })
  }
})

app.post('/api/add-friend', async function (req, res) {
  let steakid = req.body.steakid
  let name = req.body.name
  let phone = req.body.phone
  let newFriend = await addFriend(steakid, name, phone)
  if (newFriend.acknowledged === true) {
    let steakNode = await getStake(steakid).catch(console.dir);
    delete steakNode.number
    steakNode.friends.forEach(friend => {
      delete friend.number
    })
    res.send(steakNode)
  }
  else {
    res.send({ "error": "something happened...it didn't work" })
  }
})

app.listen(3000)