const express = require("express");
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const cors = require("cors");

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Language Server is Running!");
});

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.34btmna.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

const classCollection = client.db('language').collection('classes');
const instructorCollection = client.db('language').collection('instructors');

// jwt token apis
app.post('/jwt', (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })

  res.send({ token })
})

// class releted apis

app.get('/classes', async(req, res) => {
  const results = await classCollection.find().toArray();
  res.send(results)
})

// app.post('/classes', async(req, res)=>{
//   const newClass = req.body;
//   const result = await classCollection.insertOne(newClass)
//   res.send(result)
// })




// instructors apis

app.get('/instructors', async(req, res) => {
  const result = await instructorCollection.find().toArray();
  res.send(result)
})

// app.post('')













    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Language server on port ${port}`);
});
