// const express = require('express')
// const createError = require('http-errors')

// const middleware = require('./middlewares')
// const routes = require('./routes')

// const app = express();

// process.on('unhandledRejection', (reason) => {
//     process.exit(1)
// })

// /**
//  * Middlewares
//  */
// middleware.global(app);


// /**
//  * Routes
//  */
// routes(app)

// //route not found error handler

// app.use((req, res, next) => {
//     next(createError(404));
// })

// //Error Handler (4 Parameter)

// app.use((error, req, res, next) => {
//     console.log(error)
//     res.status(error.statusCode).json({
//         status: false,
//         message: error.message
//     })
// })


// module.exports = app

const express = require('express');
const createError = require('http-errors');

const middleware = require('./middlewares');
const routes = require('./routes/index');
const cors = require('cors');

const app = express();
const port = 8000;

process.on('unhandledRejection', (reason) => {
    process.exit(1);
});

/**
 * Middlewares
 */
middleware.global(app);

/**
 * Routes
 */
app.use('/', routes);

app.use(cors());
// Route not found error handler
app.use((req, res, next) => {
    next(createError(404));
});

// Error Handler (4 Parameter)
app.use((error, req, res, next) => {
    console.log(error);
    const statusCode = error.statusCode || 500; // Use a default status code of 500 if not provided
    res.status(statusCode).json({
        status: false,
        message: error.message,
    });
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

module.exports = app