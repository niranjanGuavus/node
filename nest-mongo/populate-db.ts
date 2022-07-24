const util = require('util');
const fs = require('fs');

const password = require('password-hash-and-salt');

console.log("Populating the MongoDB database with some sample data ...");

const MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;


/*****************************************************************************************************
*
*
* IMPORTANT!!!
*
* MongoDB Connection URL - create your own url with the right cluster name, username, password and database name
*
* Format: mongodb+srv://username:password@clustername
*
* Example (don't use this as you don't have write access):
*
* mongodb+srv://nestjs:ZeEjdswOWHwoenQO@cluster0-dbucq.gcp.mongodb.net
*
*****************************************************************************************************/

const MONGODB_CONNECTION_URL = 'mongodb+srv://mongo-user:nwdaf123@cluster0.xrxfd.mongodb.net/?retryWrites=true&w=majority';


// Database Name
const dbName = 'nwdaf-sample-data';
const jsonFiles = ['./nwdaf-data/nfload_history.json']






// Create a new MongoClient
const client = new MongoClient(MONGODB_CONNECTION_URL);

// Use connect method to connect to the Server
client.connect(async (err, client) => {

  try {

    if (err) {
      console.log("Error connecting to database, please check the username and password, exiting.");
      process.exit();
    }

    console.log("Connected correctly to server");

    const db = client.db(dbName);
    //insert history
    


    for (const fileName of jsonFiles) {
      var items = fs.readFileSync("./nwdaf-data/nfload_history.json").toString()
        items = JSON.parse(items)

      console.log("upload to collection....... ",  fileName);
      // const items = nfload_data[key];
      
      for( const item of items){
        const newItem:any = {...item};
        delete newItem._id;
        console.log("Inserting item ",  newItem);

        const result = await db.collection('nfload_history').insertOne(newItem);

        const newItemId = result.insertedId;
  
        console.log("new item id", newItemId);
      }
    }

   

    console.log('Finished uploading data, creating indexes.');

    // await db.collection('courses').createIndex( { "url": 1 }, { unique: true } );

    // console.log("Finished creating indexes, exiting.");

    client.close();
    process.exit();

  }
  catch (error) {
    console.log("Error caught, exiting: ", error);
    client.close();
    process.exit();
  }

});

console.log('updloading data to MongoDB...');

process.stdin.resume();
