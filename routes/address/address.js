const { check } = require('express-validator');
const { add } = require('lodash');
const CONFIG = require('../../config/config.js');
var library = require('../../model/library.js');
const middlewares = require('../../model/middlewares.js');
const { address } = require('../../model/mongodb.js');
const { ensureAuthorizedClient } = require('../../model/security/ensureAuthorised.js');

module.exports = (app, io) => {
  try {
    var address = require('../../controller/address/address')(app,io);

    app.post(
      '/address/add',
      [
        check('flatno', library.capitalize('flatno is required')),
        check('line1', library.capitalize('line1 password')),
        check('line2', library.capitalize('line2 password')),
        check('city', library.capitalize('city password')),
        check('state', library.capitalize('state password')),
        check('pincode', library.capitalize('pincode password')),
        check('phoneno', library.capitalize('phoneno password')),
        check('email', library.capitalize('email password')),
      ],
      address.AddressCreated
    )

    app.post(
      '/address/data',
      address.AddressData
    )

    app.post(
      '/address/update/:id',
      address.AddressUpdate
    )

    app.post(
      '/address/delete/:id',
      address.AddressDelete
    )

    // app.post(
    //   '/address/default/:id',
    //   address.DefaultSelect
    // )

  } catch (error) {
    console.log(`Error occured ${error}`, error.message);
  }
};