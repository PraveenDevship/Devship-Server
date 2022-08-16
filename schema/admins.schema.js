var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ADMIN_SCHEMA = {};
ADMIN_SCHEMA.ADMIN = {
  username: {
    type: String,
    lowercase: true,
    index: { unique: true },
    trim: true,
  },
  email: { type: String, lowercase: true, index: { unique: true }, trim: true },
  password: String,
  photo: { type: String, default: '' },
  name: { type: String, default: '' },
  last_name: { type: String, default: '' },
  site_url: { type: String, default: '' },
  site_title: { type: String, default: '' },
  site_logo: { type: String, default: '' },
  user_prefix: { type: String, default: '' },
  role: { type: String, default: '' },
  status: { type: Number, default: 1 },
  phone: {
    code: { type: String, default: '' },
    number: { type: String, default: '' },
    dialcountry: { type: String, default: '' },
  },
  opening_hours: {
    workingDays: { type: String, default: '' },
    workingDaysSaturday: { type: String, default: '' },
    workingDaysSunday: { type: String, default: '' },
  },
  privileges: [],
  activity: {
    last_login: { type: Date, default: Date.now },
    last_logout: { type: Date, default: Date.now },
  },

  product : {
    catagroy: { type: String, default: '' },
    name: { type: String, default: '' },
    prize: { type: String, default: '' },
    offerprize: { type: String, default: '' },
    availability : {type : String , default : ''},
    photo : {type : String , default : ''}
  },
  
  reset_code: String,
  time_stamps: Number,
  otp: Number /* 6 digits */,
  otp_timestamp: Number /* add 5 mins with current timestamp */,
  otp_verified: Number,
};

module.exports = ADMIN_SCHEMA;
