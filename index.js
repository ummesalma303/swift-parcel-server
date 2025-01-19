require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const stripe = require("stripe")(process.env.STRIPE_API_SECRET);
const port = process.env.PORT || 5000;
//middleware
app.use(express.json());
app.use(cors());


// console.log(process.env.STRIPE_API_SECRET)

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
    const reviewCollection = client.db("SwiftParcel").collection("reviews");
    const paymentCollection = client.db("SwiftParcel").collection("payments");



    // 
    // app.post("/create-payment-intent", async (req, res) => {
    //   const { items } = req.body;


      // Create a PaymentIntent with the order amount and currency
  // const paymentIntent = await stripe.paymentIntents.create({
  //   amount: calculateOrderAmount(items),
  //   currency: "usd",
  //   // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
  //   automatic_payment_methods: {
  //     enabled: true,
  //   },
  //   })
   


  app.post("/create-payment-intent", async (req, res) => {
    const { price } = req.body;
    // console.log('--------62',price)
    const amount = parseInt(price*100)
    // console.log('64-------->',amount)
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      // amount: calculateOrderAmount(amount),
      amount:amount,
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.send({ clientSecret: paymentIntent.client_secret,})
  })  

  // app.delete('payment',async(req,res)=>{
  //   const data= req.body,
  //   const result = await 
  //   console.log()
  //   res.send()
  // })




    /* ---------------------------------- users --------------------------------- */
    app.get("/count", async (req, res) => {
      const usersCount = await userCollection.estimatedDocumentCount();
      const parcelCount = await parcelCollection.estimatedDocumentCount();
      const filter ={ status:"delivered"}
      const delivered =  await parcelCollection.countDocuments(filter)
      // const delivered = result.estimatedDocumentCount()
      res.send({ usersCount, parcelCount,delivered });
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      // const filter ={role: 'User'}
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
      const { gte, lte } = req.query
      console.log('105-----',gte)
      // console.log('100--------',gte,lte)
      let query ={}
      console.log(query)
      
      if (gte&&lte) {
        console.log('111---')
        // query = {bookingDate:{$lte: new Date(lte) ,$gte:new Date(gte)}}
        query = {
         bookingDate: {
            $gte: new Date(gte), // Use Date object directly
            $lte: new Date(lte),
          },
        };
        console.log('119-----',query)
        // console.log(bookingDate)
      }else if (gte) {
        query = {bookingDate:{$gte:new Date(gte)}}
        console.log('123',query)
      }
      else if (lte) {
        console.log('125---')
        query = {bookingDate:{$lte:new Date(lte)}}
        console.log('128',query)

      }

      const result = await parcelCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/parcel", async (req, res) => {
      const parcel = req.body;
      parcel.bookingDate = new Date()
      const result = await parcelCollection.insertOne(parcel);
      console.log('137------',result);
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

    app.patch("/updateUser/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      console.log('126',user)
      const query = { email };
      const updateDoc = {
        $set: {
          photo: user.photo
          ,
        },
      };
      console.log('199------',updateDoc)
      const result = await userCollection.updateOne(query, updateDoc);
      console.log('201------',result)
      // res.send(result);
    });

     app.patch('/deliveryInfo/:id',async (req,res)=>{
       const id= req.params.id
      //  console.log(id)
      const data = req.body
      // console.log(data)
      const filter = {_id: new ObjectId(id)}
      const updateDoc = {
        $set: {
          deliveryMan: data.deliveryMan,
          deliveryEmail: data.deliveryEmail,
         status: data.status,
         approximateDate:data.date,
         deliveryMenID: data.deliveryMenID
        }
      }
     
        const result = await parcelCollection.updateOne(filter, updateDoc);
        // console.log(result)

      res.send(result);
     })


    /* -------------------------------- delivery -------------------------------- */

    app.get("/delivery", async (req, res) => {
      const filter ={role: 'Delivery Man'}
      const result =  await userCollection.find(filter).toArray()
      res.send(result);
    });
    app.get('/myDeliveryList/:email',async(req,res)=>{
      const email = req.params.email
      const filter ={deliveryEmail:email}
      const result =  await parcelCollection.find(filter).toArray()
      res.send(result);
    })

    /* -------------------------------- // admin -------------------------------- */
    app.patch('/changeRole/:id',async (req,res)=>{
      const id= req.params.id
     const filter = {_id: new ObjectId(id)}
     const updateDoc = {
       $set: {
         role:'Delivery Man'
       }
     }
    
       const result = await userCollection.updateOne(filter, updateDoc);
       console.log(result)

     res.send(result);
    })
    
    app.patch('/changeAdminRole/:id',async (req,res)=>{
      const id= req.params.id
     const filter = {_id: new ObjectId(id)}
     const updateDoc = {
       $set: {
         role:'Admin'
       }
     }
       const result = await userCollection.updateOne(filter, updateDoc);
       console.log(result)

     res.send(result);
    })
    
    app.delete("/deliveryList/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await parcelCollection.deleteOne(filter);

      res.send(result);
    });
    

    app.patch("/deliveryList/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
         status: 'delivered',
        },
        // count
        $inc:{count:1}
      }
      const result = await parcelCollection.updateOne(filter,updateDoc);

      res.send(result);
    });
    app.get('/delivered',async(req,res)=>{
      const filter ={ status:"delivered"}
      const result =  await parcelCollection.find(filter).toArray()
      res.send(result);
    })
/* --------------------------------- reviews -------------------------------- */
    app.post("/reviews", async (req, res) => {
      const reviews = req.body;
      const result = await reviewCollection.insertOne(reviews);
      // console.log('137------',result);
      res.send(result);
    });
    app.get("/reviews/:email", async (req, res) => {
      const email = req.params.email;
     const filter= {email:email}

      const result = await reviewCollection.find(filter).toArray();
      res.send(result);
    });

    app.get("/reviews", async (req, res) => {
      // const email = req.params.email;
    //  const filter= {deliveryEmail:email}

      const result = await reviewCollection.find().toArray();
      res.send(result);
    });

    app.get('/topDelivered',async(req,res)=>{     
      const topDeliveryMen = await parcelCollection.aggregate([
        {
          $lookup :{
          from:'reviews',
          localField:'deliveryEmail',
          foreignField:'email',
          as:'reviews'
        }, 
      },
      { $unwind: '$reviews'},
      // 
      {
        $addFields:{
          averageRetting:{
            $ifNull:[{$avg:'$reviews.ratting'},0]
          }
        }
      },
      {
        $project:{
          bookingDate:0,
          // reviews:0
        }
      },
      {$sort:{
        count:-1,
        averageRetting:-1
      }},
      {
        $limit:3
      }
      ]).toArray()
      res.send(topDeliveryMen)
    })

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
