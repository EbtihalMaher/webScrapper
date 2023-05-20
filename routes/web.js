const { Router } = require('express')
const { webController } = require('../controllers')
const { auth } = require('../middlewares')

const router = Router()

router
    .get('/', auth, webController.getwebs)
    // .get('/pages-count', webController.getBooksPagesCount)
    // .get('/:id', webController.getOneBook);

module.exports = router