const { connectDB } = require('../configurations')
const { userValidator, loginValidator } = require('../validators')
const { hashSync, compareSync } = require('bcryptjs')

class User {
    constructor(userData) {
        this.userData = userData;
    }

    save(db) {
        
        connectDB(async (cb) => {
            try {
                const hashedPassword = hashSync(this.userData.password, 12)
                this.userData.password = hashedPassword
                await cb.collection('users').insertOne(this.userData)
                    .then(result => {
                        db({
                            status: true,
                            _user_id: result.insertedId
                        })
                    })
            } catch (err) {
                db({
                    status: false,
                    message: err.message
                })
            }


        })
        // connectDB('users', async (collection) => {
        //     try {
        //         const hashedPassword = hashSync(this.userData.password, 12)
        //         this.userData.password = hashedPassword

        //         await collection.insertOne(this.userData)
        //             .then(result => {
        //                 cb({
        //                     status: true,
        //                     _user_id: result.insertedId
        //                 })
        //             })

        //     } catch (err) {
        //         cb({
        //             status: false,
        //             message: err.message
        //         })
        //     }
        // })
    }

    

    isExist() {
        return new Promise((resolve, reject) => {
            (async (cb) => {
                try {
                    const user =await cb.collection('users').findOne({
                        '$or': [
                            { username: this.userData.username },
                            { email: this.userData.email }
                        ]
                    })

                    if (!user) {
                        resolve({
                            check: false
                        })
                    } else {
                        if (user.email === this.userData.email) {
                            resolve({
                                check: true,
                                message: 'The email is already used'
                            })
                        } else if (user.username === this.userData.username) {
                            resolve({
                                check: true,
                                message: 'The username is already used'
                            })
                        }
                    }

                } catch (err) {
                    reject(err)
                }

            })
        })
    }

    static validate(userData) {
        try {
            const validationResult = userValidator.validate(userData)
            return validationResult;
        } catch (err) {
            return false;
        }
    }

    static login(loginData) {
        return new Promise((resolve, reject) => {
            // validation
            const validation = loginValidator.validate(loginData)
            if (validation.error) {
                const error = new Error(validation.error.message)
                error.statusCode = 400
                resolve(error)
            }

            // // find user
            // connectDB('users', async (collection) => {
            //     try {
            //         const dbResult = await collection.aggregate([
            //             {
            //                 $lookup: {
            //                     from: 'scrappers',
            //                     localField: '_id',
            //                     foreignField: '_user_id',
            //                     as: 'scrapper'
            //                 }
            //             },
            //             {
            //                 $match: {
            //                     username: loginData.username
            //                 }
            //             },
            //             {
            //                 $limit: 1
            //             }
            //         ]).toArray()


            //         if (dbResult) {
            //             const user = dbResult[0]

            //             if (!user || !compareSync(loginData.password, user.password)) {
            //                 const error = new Error('Wrong or not found username or password')
            //                 error.statusCode = 401
            //                 resolve(error)
            //             }

            //             user.scrapper = (user.scrapper) ? user.scrapper[0] : null
            //             resolve(user)
            //         } else {
            //             const error = new Error('Wrong or not found username or password')
            //             error.statusCode = 401
            //             resolve(error)
            //         }

            //     } catch (err) {
            //         reject(err)
            //     }
            // })
        })
    }
}



module.exports = User