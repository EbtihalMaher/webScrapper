const { Router } = require('express')
const { productController } = require('../controllers')
const { auth } = require('../middlewares')

const router = Router()
router
    .get('/', auth, productController.getProducts)
    .get('/pages-count', productController.getProductsPagesCount)
    .get('/:id', productController.getOneProduct);

module.exports = router


