const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let User = new Schema({
    firstName:{
        type:String
    },
    lastName:{
        type:String
    },
    username:{
        type:String
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    token:{
        type:String
    },
    role:{
        type:Number
    }
});

module.exports = mongoose.model('User', User);