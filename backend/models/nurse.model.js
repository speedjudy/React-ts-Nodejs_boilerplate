const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Nurse = new Schema({
  name: {
    type: String,
  },
  address: {
    type: String,
  },
  image: {
    type: String,
  },
  cell: {
    type: Number,
  },
  code: {
    type: String,
  },
  country: {
    type: String,
  },
  experience: {
    type: String,
  },
  date: {
    type: Date,
  },
  workexp: {
    type: String,
  },
  leave: {
    type: Array,
  },
  rota: {
    type: Array,
  },
  level: {
    type: String,
  },
  rate: {
    type: String,
  },
  basic_allowances: {
    type: Number,
  },
  housing_allowances: {
    type: Number,
  },
  other_allowances: {
    type: Number,
  },
  joined: {
    type: String,
  },
});

module.exports = mongoose.model("Nurse", Nurse);
