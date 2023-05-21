const productRouter = require('./product')
const authRouter = require('./auth')

module.exports = (app) => {
    app.get('/', (req, res, next) => {
        res.status(200).json({
            status: true,
            message: null,
        })
    })

    app.use('/products', productRouter)

    app.use('/auth', authRouter);
}