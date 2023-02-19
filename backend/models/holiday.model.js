const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Holiday = new Schema({
    holiday:{
        type:Array
    }
});

module.exports = mongoose.model('Holiday', Holiday);