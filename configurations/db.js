const { MongoClient } = require('mongodb');

// Import the `dotenv` package and load the environment variables
require('dotenv').config();

const connectDB = (cb) => {
    return MongoClient.connect(process.env.MONGODB_URI)
        .then(async (client) => {
            const database = client.db("webScrapper");
            const result = await cb(database);
            client.close();
            return result;
        })
        .catch((err) => {
            console.log(err);

        });
}

module.exports = connectDB;
