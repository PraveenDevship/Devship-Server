var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var config_admin_schema = require('../schema/admins.schema.js');
var config_user_schema = require('../schema/client.schema.js');
var config_product_schema = require('../schema/Product.js');
var config_cart_schema = require('../schema/Cart');
var config_address_schema = require('../schema/address');
var config_order_schema = require('../schema/Order');

var adminSchema = mongoose.Schema(config_admin_schema.ADMIN, {
  timestamps: true,
  versionKey: false,
});

var userSchema = mongoose.Schema(config_user_schema.USER, {
  timestamps: true,
  versionKey: false,
});

var productSchema = mongoose.Schema(config_product_schema.PRODUCT, {
  timestamps: true,
  versionKey: false,
});

var addressSchema = mongoose.Schema(config_address_schema.ADDRESS, {
  timestamps: true,
  versionKey: false,
});


var cartSchema = mongoose.Schema(config_cart_schema.CART, {
  timestamps: true,
  versionKey: false,
});

var orderSchema = mongoose.Schema(config_order_schema.ORDER, {
  timestamps: true,
  versionKey: false,
});


adminSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

adminSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

var admins = mongoose.model('admins', adminSchema, 'admins');
var client = mongoose.model('client', userSchema, 'client');
var product1 = mongoose.model('product1', productSchema, 'product1')
var carts = mongoose.model('carts', cartSchema, 'carts');
var address = mongoose.model('address',addressSchema,'address');
var order = mongoose.model('order',orderSchema,'order');


module.exports = {
  admins: admins,
  client: client,
  product1 : product1,
  carts : carts,
  address : address,
  order : order
};
