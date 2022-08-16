const { check } = require('express-validator');
const CONFIG = require('../../config/config.js');
var library = require('../../model/library.js');
const middlewares = require('../../model/middlewares.js');
const { carts } = require('../../model/mongodb.js');
const { ensureAuthorizedClient } = require('../../model/security/ensureAuthorised.js');

module.exports = (app, io) => {
  try {
    var cart = require('../../controller/cart/cart')(app, io);

    app.post(
        '/cart/create',
        [
          check('name', library.capitalize('name is required')),
          check('email', library.capitalize('Email is required')),
          check('prize', library.capitalize('prize require')),
          check('offerprize', library.capitalize('offerprize require')),
          check('photo', library.capitalize('photo require')),
          check('discount', library.capitalize('discount require')),
          check('productId', library.capitalize('productId require')),
          check('catagroy', library.capitalize('catagroy require')),
        ],
        cart.CreateCart
    )

    app.post(
      '/cart/data',
      cart.getCartData
    )

    app.post(
      '/cart/delete/:id',
      cart.getCartDelete
    )

  } catch (error) {
    console.log(`Error occured ${error}`, error.message);
  }
};