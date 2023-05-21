const { Router } = require('express')
const { ProductController } = require('../controllers')
const { auth } = require('../middlewares')

const router = Router()

router
    .get('/', auth, ProductController.getProducts)
    .get('/pages-count', ProductController.getProductsPagesCount)
    .get('/:id', ProductController.getOneProduct);

module.exports = router