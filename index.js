const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const cors = require("cors");
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY);
// middleware
app.use(cors());
app.use(express.json());

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "unauthorized access" });
  }

  const token = authorization.split(" ")[1];

  jwt.verify(token, process.env.DB_ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({ error: true, message: "unauthorized access" });
    }

    req.decoded = decoded; // Attach the decoded object to the request
    next(); // Call next() to proceed to the next middleware or route handler
  });
};

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
    // await client.connect();
    const usersCollection = client.db("language").collection("users");
    const cartCollection = client.db("language").collection("carts");
    const paymentCollection = client.db("language").collection("payments");
    const classCollection = client.db("language").collection("classes");
    const instructorCollection = client
      .db("language")
      .collection("instructors");

    // jwt token apis
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.DB_ACCESS_TOKEN, {
        expiresIn: "1h",
      });

      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);

      if (!existingUser) {
        return res.status(404).send({ message: "User not found" });
      }

      const isAdmin = existingUser.role === "admin";
      const isInstructor = existingUser.role === "instructor";
      const isStudent = existingUser.role === "student";

      res.send({ token, isAdmin, isInstructor, isStudent });
    });

    // Warning: use verifyJWT before using verifyAdmin
    // const verifyAdmin = async (req, res, next) => {
    //   const email = req.decoded.email;
    //   const query = { email: email };
    //   const user = await usersCollection.findOne(query);
    //   if (user?.role !== "admin") {
    //     return res
    //       .status(403)
    //       .send({ error: true, message: "forbidden message" });
    //   }
    //   next();
    // };

    // users related apis
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // user post
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: "user already exists" });
      }

      const result = await usersCollection.insertOne(user);

      res.send(result);
    });

    // security layer:
    // check same email
    // check admin

    // user/admin/:email route

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;

      // if (req.decoded.email !== email) {
      //   res.send({ admin: false })
      // }

      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { admin: user?.role === "admin" };
      res.send(result);
    });

    // make user admin
    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // Make a user an Instructor

    // user/instructor/:email route
    app.get("/users/instructor/:email", async (req, res) => {
      const email = req.params.email;

      // if (req.decoded.email !== email) {
      //   res.send({ instructor: false })
      // }

      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { instructor: user?.role === "instructor" };
      res.send(result);
    });

    // make instructor
    app.patch("/users/instructor/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "instructor",
        },
      };
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // selected carts related apis

    app.get("/carts", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }

      // const decodedEmail = req.decoded.email;
      // if (email !== decodedEmail) {
      //   return res
      //     .status(403)
      //     .send({ error: true, message: "forbidden access" });
      // }
      const query = { email: email };
      const result = await cartCollection.find(query).toArray();

      res.send(result);
    });
    // cart post

    app.post("/carts", async (req, res) => {
      const item = req.body;
      const result = await cartCollection.insertOne(item);

      res.send(result);
    });

    // delete cart from db
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

    // app.get("/classes/:email", async (req, res) => {
    //   const email = req.query.email;

    //   const query = email ? { email: email } : {};
    //   const results = await classCollection.find(query).toArray();
    // console.log(results);
    //   res.send(results);
    // });

    // create payment intent
    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    // payment related api
    // app.get("/payments", async (req, res) => {
    //   const result = await paymentCollection.find().toArray();
    //   res.send(result);
    // });

    app.get('/users/myEnrol/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const query = { email: email }; // Update the query to match the email field in your database
        const data = await paymentCollection.find(query).toArray(); // Find all matching documents and convert to an array
        res.send(data);
      } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
      }
    });

    app.get('/users/payments/:email', async (req, res) => {
      try {
        const email = req.params.email;
        console.log(email);
        const query = { email: email }; 
        const data = await paymentCollection.find(query).toArray(); 
        res.send(data);
      } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
      }
    });



    app.post("/payments", async (req, res) => {
      const payment = req.body;
      const insertResult = await paymentCollection.insertOne(payment);

      // const cartItemId = new ObjectId(payment.cartItemId);
      // const deleteResult = await cartCollection.deleteMany({ _id: cartItemId });

      res.send({ insertResult,deleteResult });
    });

    app.delete("/carts/:id", async (req, res) => {
      const paymentId = req.params.id;

      const deleteResult = await cartCollection.deleteOne({
        _id: new ObjectId(paymentId),
      });

      if (deleteResult.deletedCount === 0) {
        res.status(404).send({ message: "Payment not found" });
      } else {
        res.send({ message: "Payment deleted successfully" });
      }
    });



    app.get("/admin-stats", async (req, res) => {
      const users = await usersCollection.estimatedDocumentCount();
      const products = await cartCollection.estimatedDocumentCount();
      const orders = await paymentCollection.estimatedDocumentCount();

      const payments = await paymentCollection.find().toArray();
      const revenue = payments.reduce((sum, payment) => sum + payment.price, 0);

      res.send({
        revenue,
        users,
        products,
        orders,
      });
    });

    app.get("/order-stats", async (req, res) => {
      const pipeline = [
        {
          $lookup: {
            from: "menu",
            localField: "menuItems",
            foreignField: "_id",
            as: "menuItemsData",
          },
        },
        {
          $unwind: "$menuItemsData",
        },
        {
          $group: {
            _id: "$menuItemsData.category",
            count: { $sum: 1 },
            total: { $sum: "$menuItemsData.price" },
          },
        },
        {
          $project: {
            category: "$_id",
            count: 1,
            total: { $round: ["$total", 2] },
            _id: 0,
          },
        },
      ];

      const result = await paymentCollection.aggregate(pipeline).toArray();
      res.send(result);
    });

    // instructors apis

    app.get("/instructors", async (req, res) => {
      const result = await instructorCollection.find().toArray();
      res.send(result);
    });

    app.post("/instructors", async (req, res) => {
      const newClass = req.body;
      const result = await classCollection.insertOne(newClass);
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
