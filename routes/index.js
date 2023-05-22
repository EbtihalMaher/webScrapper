// const webRouter = require('./web')
// const authRouter = require('./auth')

// module.exports = (app) => {
//     app.get('/', (req, res, next) => {
//         res.status(200).json({
//             status: true,
//             message: null,
//         })
//     })

//     app.use('/products', productRouter)

//     app.use('/auth', authRouter);
// }

const express = require('express');
const router = express.Router();
const productRouter = require('./product');
const authRouter = require('./auth');
const scraperRouter = require('./scraper');

router.get('/', (req, res, next) => {
    res.status(200).json({
        status: true,
        message: null,
    });
});

router.use('/products', productRouter);
router.use('/auth', authRouter);
router.use('/scraper', scraperRouter);

module.exports = router;
