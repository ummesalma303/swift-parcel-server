require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
//middleware
app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ot76b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const userCollection = client.db("SwiftParcel").collection("users");
    const parcelCollection = client.db("SwiftParcel").collection("parcels");

   
    /* ---------------------------------- users --------------------------------- */
    app.get("/count", async (req, res) => {
      const usersCount = await userCollection.estimatedDocumentCount();
      const parcelCount = await parcelCollection.estimatedDocumentCount();
      res.send({ usersCount, parcelCount });
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    app.post("/users", async (req, res) => {
      const users = req.body;
      const result = await userCollection.insertOne(users);
      console.log(result);
      res.send(result);
    });




     /* --------------------------------- parcel --------------------------------- */

     app.get("/parcels/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await parcelCollection.findOne(query);
      res.send(result);
    });
    /* -------------------------------- get parcel by email(my parcel)------------------------------- */
    // app.get('/parcel/:email',async(req,res)=>{
    //   const email = req.params.email
    //   const filter ={email}

    //   const result = await parcelCollection.find(filter).toArray()
    //   res.send(result)
    // })

    app.get("/parcel/:email", async (req, res) => {
      const email = req.params.email;
      const search = req.query.search;
      const filter = { email };
      let query = {};
      if (search === "pending") {
        query = { status: { $regex: search, $options: "i" } };
        const result = await parcelCollection.find(query).toArray();
        res.send(result);
      }

      const result = await parcelCollection
        .find({ $and: [filter, query] })
        .toArray();
      res.send(result);
    });
    app.get("/parcel", async (req, res) => {
      const result = await parcelCollection.find().toArray();
      res.send(result);
    });
    app.post("/parcel", async (req, res) => {
      const parcel = req.body;
      const result = await parcelCollection.insertOne(parcel);
      console.log(result);
      res.send(result);
    });
    /* ------------------------------------ update parcel ----------------------------------- */
    app.patch("/parcel/:id", async (req, res) => {
      const id = req.params.id;
      const item = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          name: item.name,
          email: item.email,
          phone: item.phone,
          parcelType: item.parcelType,
          receiverName: item.receiverName,
          receiverPhone: item.receiverPhone,
          deliveryDate: item.deliveryDate,
          totalPrice: item.totalPrice,
          addressLatitude: item.addressLatitude,
          addressLongitude: item.addressLongitude,
          deliveryAddress: item.deliveryAddress,
          bookingDate: item.bookingDate,
          parcelWeight: item.parcelWeight,
          // parcelType: item.parcelType
        },
      };
      const result = await parcelCollection.updateOne(filter, updateDoc);

      res.send(result);
    });
    /* ------------------------------ delete parcel ----------------------------- */
    app.delete("/parcel/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await parcelCollection.deleteOne(filter);

      res.send(result);
    });

    // app.get('/allParcel',async(req,res)=>{
    //   const filter = req.query.filter
    //   // console.log(filter)
    //   let query={};
    //   if (filter === 'pending') {
    //     query ={ status: {$regex:filter,$options:'i'}}
    //  }
    //   const result = await parcelCollection.find(query).toArray()

    //   res.send(result)
    // })

    // app.patch("/updateUser/:email", async (req, res) => {
    //   const email = req.params.email;
    //   const user = req.body;
    //   console.log('126',user)
    //   const query = { email };
    //   const updateDoc = {
    //     $set: {
    //      displayName: user.displayName,
    //       photoURL: user.photoURL
    //       ,
    //     },
    //   };
    //   console.log(updateDoc)
    //   const result = await userCollection.updateOne(query, updateDoc);
    //   console.log(result)
    //   // res.send(result);
    // });



    /* -------------------------------- delivery -------------------------------- */

    app.get("/delivery", async (req, res) => {
      // const data =  userCollection.find();
      // if (data.role=== "Delivery Man") {
      //  const data =  userCollection.find()
      // }
      const filter ={role: 'Delivery Man'}
      const result =  await userCollection.find(filter).toArray()
      res.send(result);
    });









  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from assignment 12 Server..");
});

app.listen(port, () => {
  console.log(`assignment 12 is running on port ${port}`);
});
