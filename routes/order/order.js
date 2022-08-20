const { check } = require('express-validator');
const CONFIG = require('../../config/config.js');
var library = require('../../model/library.js');
const middlewares = require('../../model/middlewares.js');
const { product1 } = require('../../model/mongodb.js');
const { ensureAuthorizedClient } = require('../../model/security/ensureAuthorised.js');

module.exports = (app, io) => {
  try {
    var order = require('../../controller/order/order')(app, io);

    app.post(
      '/order/add',
      order.CreatedOrder
    )

    app.post(
      '/order/look',
      order.Lookup
    )

    app.post(
      '/order/data',
      order.OrderGetData
    )

    app.post(
      '/order/clientdata',
      order.ClientOrderData
    )
    app.post(
      '/order/delete/:id',
      order.OrderDelete
    )
    
  } catch (error) {
    console.log(`Error occured ${error}`, error.message);
  }
};