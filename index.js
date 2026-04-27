const express = require('express');
const dotenv = require('dotenv');
const app = express();
const port = process.env.PORT || 3500;
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
dotenv.config()
const admin = require('firebase-admin');

const decoded = Buffer.from(
  process.env.Firebase_Service_Key,
  'base64',
).toString('utf8');
const serviceAccount = JSON.parse(decoded);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

//add firebase verify token middleware

const firebaseTokenVerification = async(req,res,next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: `unauthorized access` });
  }
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).send({ message: `unauthorized access` });
  }
  try {
    const userInfo = await admin.auth().verifyIdToken(token);
    req.toke_email = userInfo.email;
    next();
  } catch {
    return res.status(401).send({ message: `unauthorized access` });
  }
}


//add middleware
app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
  res.send('food review')
})

//mongodb

const uri = `mongodb+srv://${process.env.User_Name}:${process.env.User_Password}@cluster0.hnqoonm.mongodb.net/?appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database = client.db('foodReview');
    const foodReviewCollection = database.collection('foodReview');
    
    //create a food review
    app.post('/addReview',firebaseTokenVerification, async (req, res) => {
      const userEmail = req.query.email;
      
      if (userEmail !== req.toke_email) {
        return res.status(403).send({message:`provident`})
      }
      console.log(req.body)
      const review = req.body;
      review.createAt=Date.now()
      const result = await foodReviewCollection.insertOne(review);
      res.send(result);
    })
    //get all food review
    app.get('/allReview', async (req, res) => {
      const latest = {
        createAt: -1,
      };
      const cursor = foodReviewCollection.find({}).sort(latest);
      const result = await cursor.toArray();
      res.send(result)
    })
    //get top rated food review

    app.get('/topReview', async (req, res) => {
      const query = {};
      const topReview = {
        starRating: -1,
      };
      const cursor = foodReviewCollection.find(query).sort(topReview).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    })
    //get latest food review
    app.get('/latestReview', async (req, res) => {
      const query = {}
      const latestReview = {
        createAt: -1,
      };
      const cursor = foodReviewCollection.find(query).sort(latestReview).limit(3);
      const result = await cursor.toArray();
      res.send(result);
    })
    //get only user review
    app.get('/myReview',firebaseTokenVerification, async (req, res) => {
   
      const userEmail = req.query.email;
      
      const query = {}
      if (userEmail) {
        if (userEmail !== req.toke_email) {
          return res.status(403).send({ message: `provident` });
        }
        query.email = userEmail;
      }
      
      const cursor = foodReviewCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
      
    })
    //delete review
    app.delete('/deleteReview/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = foodReviewCollection.deleteOne(query);
      res.send(result);
    })
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!',
    );
  } finally {
    // Ensures that the client will close when you finish/error
  
  } 
}
run().catch(console.dir);
app.listen(port);