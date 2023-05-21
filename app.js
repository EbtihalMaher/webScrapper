const express = require('express')
const createError = require('http-errors')

const middleware = require('./middlewares')
const routes = require('./routes')

const app = express();

process.on('unhandledRejection', (reason) => {
    process.exit(1)
})

/**
 * Middlewares
 */
middleware.global(app);


/**
 * Routes
 */
routes(app)

//route not found error handler

app.use((req, res, next) => {
    next(createError(404));
})

//Error Handler (4 Parameter)

app.use((error, req, res, next) => {
    console.log(error)
    res.status(error.statusCode).json({
        status: false,
        message: error.message
    })
})


module.exports = app