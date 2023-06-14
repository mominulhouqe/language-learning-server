const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const cors = require("cors");
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Middleware for verifying JWT token
const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: "unauthorized access" });
  }

  const token = authorization.split(" ")[1];

  jwt.verify(token, process.env.DB_ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: "unauthorized access" });
    }

    req.decoded = decoded;
    next();
  });
};

// Root endpoint
app.get("/", (req, res) => {
  res.send("Language Server is Running!");
});

// MongoDB configuration
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

// Function to run the server
async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    // await client.connect();
    const usersCollection = client.db("language").collection("users");
    const cartCollection = client.db("language").collection("carts");
    const paymentCollection = client.db("language").collection("payments");
    const classCollection = client.db("language").collection("classes");
    const instructorCollection = client.db("language").collection("instructors");

    // JWT token APIs
    app.post("/jwt", async (req, res) => {
      // Generate a JWT token for the user
      // ...

      res.send({ token });
    });

    // Users related APIs
    // Get all users
    app.get("/users", async (req, res) => {
      // ...
    });

    // Get a specific user
    app.get("/users/:id", async (req, res) => {
      // ...
    });

    // Create a new user
    app.post("/users", async (req, res) => {
      // ...
    });

    // Update a user
    app.patch("/users/:id", async (req, res) => {
      // ...
    });

    // Delete a user
    app.delete("/users/:id", async (req, res) => {
      // ...
    });

    // Carts related APIs
    // Get all carts
    app.get("/carts", async (req, res) => {
      // ...
    });

    // Get a specific cart
    app.get("/carts/:id", async (req, res) => {
      // ...
    });

    // Create a new cart
    app.post("/carts", async (req, res) => {
      // ...
    });

    // Update a cart
    app.patch("/carts/:id", async (req, res) => {
      // ...
    });

    // Delete a cart
    app.delete("/carts/:id", async (req, res) => {
      // ...
    });

    // Classes related APIs
    // Get all classes
    app.get("/classes", async (req, res) => {
      // ...
    });

    // Get a specific class
    app.get("/classes/:id", async (req, res) => {
      // ...
    });

    // Create a new class
    app.post("/classes", async (req, res) => {
      // ...
    });

    // Update a class
    app.patch("/classes/:id", async (req, res) => {
      // ...
    });

    // Delete a class
    app.delete("/classes/:id", async (req, res) => {
      // ...
    });

    // Other APIs...

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Close the MongoDB connection
    // await client.close();
  }
}

run().catch(console.dir);

// Start the server
app.listen(port, () => {
  console.log(`Language server on port ${port}`);
});
