const webRouter = require('./web')
const authRouter = require('./auth')

module.exports = (app) => {
    app.get('/', (req, res, next) => {
        res.status(200).json({
            status: true,
            message: null,
        })
    })

    app.use('/webs', webRouter)

    app.use('/auth', authRouter);
}