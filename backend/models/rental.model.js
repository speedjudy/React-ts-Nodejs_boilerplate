const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Rental = new Schema({
    name:{
        type:String
    },
    address:{
        type:String
    },
    image:{
        type:String
    }
});

module.exports = mongoose.model('Rental', Rental);