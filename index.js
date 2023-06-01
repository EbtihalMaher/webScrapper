require('dotenv').config()

const http = require('http')
const app = require('./app')

const server = http.createServer(app)


server.listen( () => {
    console.log('Server is listening now http://localhost:8000/')
})