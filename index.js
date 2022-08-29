const connectToMongo = require('./db')
connectToMongo()


const express = require('express')
const app = express()
const port = 3300
var cors = require('cors')


app.use(cors())
app.use(express.json())

//  available routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

 app.listen(port, () => {
     console.log(`Notey Backend is running on port http://localhost:${port}`)
 })