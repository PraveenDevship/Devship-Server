var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var PRODUCT_SCHEMA = {};
PRODUCT_SCHEMA.ADDRESS = {
    flatno : {
        type : String,
        default : ''
    },
    line1 : {
        type : String,
        default : ''
    },
    line2 : {
        type : String,
        default : ''
    },
    state : {
        type : String,
        default : ''
    },
    city : {
        type : String,
        default : ''
    },
    pincode : {
        type : String,
        default : ''
    },
    phoneno : {
        type : String,
        default : ''
    },
    email : {
        type : String,
        required : true
    },
    disable : {
        type : Boolean,
        default : false
    }
};

module.exports = PRODUCT_SCHEMA;