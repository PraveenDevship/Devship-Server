var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var PRODUCT_SCHEMA = {};
PRODUCT_SCHEMA.CART = {
    email: { type: String},
    catagroy: { type: String},
    name: { type: String, },
    prize: { type: String },
    offerprize: { type: Number },
    photo: { type: String },
    productId: { type: String },
    discount: { type: String },
};

module.exports = PRODUCT_SCHEMA;