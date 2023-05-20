const { MongoClient } = require('mongodb')

const _uri = process.env.MONGODB_URI

const dbConnection = (collection, cb) => {
    MongoClient.connect(_uri)
        .then(async (client) => {
            const db = client.db('nodeJS').collection(webScrapper);
            await cb(db)
            client.close();
        })
        .catch();
}

module.exports = dbConnection