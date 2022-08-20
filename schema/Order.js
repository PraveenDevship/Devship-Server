var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var PRODUCT_SCHEMA = {};
PRODUCT_SCHEMA.ORDER = {
  catagroy: { type: String},
  name: { type: String,},
  prize: { type: String },
  offerprize: { type: Number},
  photo: { type: String},
  discount : {type : String},
  quantity : {type : Number},
  approved : {type : String},
  delivery : {type : String},
  clientname : {type : String},
  email : {type : String},
  flatno : {type : String},
  line1 : {type : String},
  line2 : {type : String},
  city : {type : String},
  state : {type : String},
  pincode : {type : String},
  phoneno : {type : String},
  paid : {type : String},
  totalprize : {type : String},
  Uid : {type : String},
};

module.exports = PRODUCT_SCHEMA;