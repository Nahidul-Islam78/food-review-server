const express = require('express');
const dotenv = require('dotenv');
const app = express();
const port = process.env.PORT || 3500;
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
dotenv.config()

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
    app.post('/addReview', async (req, res) => {
      const review = req.body;
      const result = await foodReviewCollection.insertOne(review);
      res.send(result);
    })
    //get all food review
    app.get('/allReview', async (req, res) => {
      const cursor = foodReviewCollection.find({});
      const result = await cursor.toArray();
      res.send(result)
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