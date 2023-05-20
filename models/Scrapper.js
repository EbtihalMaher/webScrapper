const { dbConnection } = require('../configurations')

class Scrapper {
    constructor(scrapperData) {
        this.scrapperData = scrapperData
    }

    save(cb) {
        dbConnection('scrappers', async (collection) => {
            try {
                await collection.updateOne(
                    {name: this.scrapperData.name, _user_id: null},
                    {$set: {_user_id: this.scrapperData._user_id, name: this.scrapperData.name}},
                    {upsert: true}
                )

                cb({
                    status: true
                })
            } catch (err) {
                cb({
                    status: false,
                    message: err.message
                })
            }
        })
    }
}

module.exports = Scrapper