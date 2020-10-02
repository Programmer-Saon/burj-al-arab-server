const express = require("express");

const bodyParser = require("body-parser");
const cors = require("cors");

const admin = require("firebase-admin");
require('dotenv').config();

var serviceAccount = require("./configs/burje-al-arab-project-website-firebase-adminsdk-jwaie-fabc92f750.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://burje-al-arab-project-website.firebaseio.com",
});
const port = 4000;

const app = express();

app.use(cors());
app.use(bodyParser.json());

const password = "burjalarab";

const MongoClient = require("mongodb").MongoClient;
const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bnrsn.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const bookings = client.db("burjAlArab").collection("bookings");
  console.log("database connected");

  app.post("/addBooking", (req, res) => {
    const newBooking = req.body;

    bookings.insertOne(newBooking).then((result) => {
      res.send(result.insertedCount > 0);
    });
    console.log(newBooking);
  });

  app.get("/booking", (req, res) => {
  const bearer = req.headers.authorization;
    if(bearer && bearer.startsWith('Bearer ')){
      const idToken = bearer.split(' ')[1];
      console.log({ idToken });
    
    admin
      .auth()
      .verifyIdToken(idToken)
      .then(function (decodedToken) {
        const tokenEmail = decodedToken.email;
        const queryEmail = req.query.email;
        console.log(tokenEmail,queryEmail);

        if(tokenEmail == req.query.email){
          bookings.find({email:req.query.email})
          .toArray((err, documents) => {
            res.status(200).send(documents);
          });
        }else{
          res.status(401).send('Unauthorized access');
        }
        
        console.log({tokenEmail});
      })
      .catch(function (error) {
        res.status(401).send('Unauthorized access');
      });
    }else{
      res.status(401).send('Unauthorized access');
    }
  });
});

app.get("/", (req, res) => {
  res.send("Hello Shawon Ahmed!");
});

app.listen(port);
