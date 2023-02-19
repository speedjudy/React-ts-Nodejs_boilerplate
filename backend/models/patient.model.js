const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Patient = new Schema({
    name: {
        type: String
    },
    rota:{
        type:Array,
    },
    address: {
        type: String
    },
    image: {
        type: String
    },
    cell: {
        type: String
    },
    level: {
        type: Number
    },
    specialty: {
        type: String
    },
});

module.exports = mongoose.model('Patient', Patient);