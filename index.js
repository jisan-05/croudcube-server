const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.pmlso.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

        const database = client.db("campaignDB");
        const campaignCollection = database.collection("campaignCollection");

        const database2 = client.db("campaignDonate")
        const campaignDonateCollection = database2.collection("campaignDonateCollection")

        app.post("/campaigns", async (req, res) => {
            const campaign = req.body;
            // console.log(campaign);
            const result = await campaignCollection.insertOne(campaign);
            res.send(result);
        });

        // for donate identify
        app.post('/campaignsDonate', async(req,res) => {
            const donateData = req.body;
            const result = await campaignDonateCollection.insertOne(donateData)
            res.send(result)
        })
        // for donate Info Get 
        app.get("/campaignsDonate/:email", async(req,res) =>{
            const email = req.params.email;
            const query = {
                donateEmail: email,
            }
            const result = await campaignDonateCollection.find(query).toArray()
            res.send(result)
        })


        app.get("/campaigns", async (req, res) => {
            const cursor = campaignCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get("/campaigns/:email", async (req, res) => {
            const email = req.params.email;
            const query = {
                userEmail: email,
            };
            const result = await campaignCollection.find(query).toArray();
            res.send(result);
        });

        // for specific update
        app.get("/updateCampaigns/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await campaignCollection.findOne(query);
            res.send(result);
        });

        app.put("/updateCampaigns/:id", async (req, res) => {
            const id = req.params.id;
            const UpdateCampaignData = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    image: UpdateCampaignData.image,
                    campaignTitle: UpdateCampaignData.campaignTitle,
                    campaignType: UpdateCampaignData.campaignType,
                    amount: UpdateCampaignData.amount,
                    Deadline: UpdateCampaignData.Deadline,
                },
            };
            const result = await campaignCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        });

        app.delete("/campaign/:id", async (req, res) => {
            const id = req.params.id;
            // console.log("Please delete a id", id);
            const query = { _id: new ObjectId(id) };
            const result = await campaignCollection.deleteOne(query);
            res.send(result);
        });

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

app.get("/", (req, res) => {
    res.send("SIMPLE CRUD IS RUNNING");
});
app.listen(port, () => {
    console.log(`Crud is running on port : ${port}`);
});
