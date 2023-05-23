const { MongoClient } = require('mongodb');

// Import the `dotenv` package and load the environment variables
require('dotenv').config();

const dbConnection = (collection, cb) => {
  MongoClient.connect(process.env.MONGODB_URI)
    .then(async (client) => {
      try {
        const db = client.db('webScrapper').collection(collection);
        await cb(db);
        client.close();
      } catch (error) {
        console.error('Error during database operation:', error);
        client.close();
      }
    })
    .catch((error) => {
      console.error('Error connecting to the database:', error);
    });
};

module.exports = dbConnection;
