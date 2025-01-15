require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000;
//middleware
app.use(express.json());
app.use(cors());



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ot76b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");



    const userCollection = client.db("SwiftParcel").collection("users");
    // users
    app.get('/count',async (req,res)=>{
      const usersCount = await userCollection.estimatedDocumentCount()
      res.send({usersCount})
    })

    app.get('/users/:email',async(req,res)=>{
      const email = req.params.email
      const query ={email}
      const result = await userCollection.findOne(query)
      res.send(result)
    })

    app.get('/users',async (req,res)=>{
      const result = await userCollection.find().toArray()
      res.send(result)
    })
    app.post('/users',async(req,res)=>{
      const users = req.body
      const result = await userCollection.insertOne(users)
      console.log(result)
      res.send(result)
    })
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);







app.get('/',(req,res)=>{
    res.send('Hello from assignment 12 Server..')
})

app.listen(port,()=>{
    console.log(`assignment 12 is running on port ${port}`)
})