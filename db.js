require('dotenv').config()
const mongoose = require("mongoose")

const mongoURI = process.env.MONGO_URI

const connectToMongo= () => {
    mongoose.connect(mongoURI,{ useNewUrlParser: true }, ()=> {
        console.log('connected to mongo successully')
    })
}
module.exports = connectToMongo;