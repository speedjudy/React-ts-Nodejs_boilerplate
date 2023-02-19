const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Realtime = new Schema({
  request: {
    type: String,//request url
  },
  status: {
    type: Number,//1:request,2:approve,3:reject
  }, 
  data: {
    type: Object,//request data
  },
});

module.exports = mongoose.model("Realtime", Realtime);
