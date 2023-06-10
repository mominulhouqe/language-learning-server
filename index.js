const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const cors = require("cors");
const jwt = require("jsonwebtoken");

// middleware
app.use(cors());
app.use(express.json());

/* const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "unauthorized access" });
  }
  // bearer token
  const token = authorization.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({ error: true, message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
}; */

app.get("/", (req, res) => {
  res.send("Language Server is Running!");
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.34btmna.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // const usersCollection = client.db("language").collection("users");
    const cartCollection = client.db("language").collection("carts");
    const classCollection = client.db("language").collection("classes");
    const instructorCollection = client
      .db("language")
      .collection("instructors");


    // users releted apis
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });



    // selected carts apis releted apis

    app.get("/carts", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }

      // const decodedEmail = req.decoded.email;
      // if (email !== decodedEmail) {
      //   return res.status(403).send({ error: true, message: 'forbidden access' })
      // }
      const query = { email: email };
      const result = await cartCollection.find(query).toArray();

      res.send(result);
    });

    app.post("/carts", async (req, res) => {
      const item = req.body;
      const result = await cartCollection.insertOne(item);

      res.send(result);
    });

    // deleted cart from db
    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const results = await cartCollection.deleteOne(query);
      console.log(results);
      res.send(results);
    });

    // class collections apis
    app.get("/classes", async (req, res) => {
      const results = await classCollection.find().toArray();
      res.send(results);
    });

    app.post("/classes", async (req, res) => {
      const newClass = req.body;
      const result = await classCollection.insertOne(newClass);
      res.send(result);
    });

    // instructors apis

    app.get("/instructors", async (req, res) => {
      const result = await instructorCollection.find().toArray();
      res.send(result);
    });

    // app.post('')

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Language server on port ${port}`);
});




    // jwt token apis
    // app.post("/jwt", (req, res) => {
    //   const user = req.body;
    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
    //     expiresIn: "1h",
    //   });
    //   console.log(token);
    //   res.send({ token });
    // });

    // Warning: use verifyJWT before using verifyAdmin
    /*     const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email }
      const user = await usersCollection.findOne(query);
      if (user?.role !== 'admin') {
        return res.status(403).send({ error: true, message: 'forbidden message' });
      }
      next();
    } */

    /**
     * 0. do not show secure links to those who should not see the links
     * 1. use jwt token: verifyJWT
     * 2. use verifyAdmin middleware
     */

    // users related apis

    /*     app.get('/users', verifyJWT, verifyAdmin, async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: 'user already exists' })
      }

      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
 */
    // security layer: verifyJWT
    // email same
    // check admin
    /*     app.get('/users/admin/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;

      if (req.decoded.email !== email) {
        res.send({ admin: false })
      }

      const query = { email: email }
      const user = await usersCollection.findOne(query);
      const result = { admin: user?.role === 'admin' }
      res.send(result);
    }) */

    /*     app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin'
        },
      };

      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);

    })

 */
    // cart collection apis

    /*         app.get('/carts', async (req, res) => {
          const email = req.query.email;
    
          if (!email) {
            res.send([]);
          }
    
          const decodedEmail = req.decoded.email;
          if (email !== decodedEmail) {
            return res.status(403).send({ error: true, message: 'forbidden access' })
          }
    
          const query = { email: email };
          const result = await cartCollection.find(query).toArray();
          res.send(result);
        });
    
        app.get('/carts', async (req, res) => {
          const item = req.body;
          const result = await cartCollection.insertOne(item);
          res.send(result);
        })
    
        app.delete('/carts/:id', async (req, res) => {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const result = await cartCollection.deleteOne(query);
          res.send(result);
        })
    */
