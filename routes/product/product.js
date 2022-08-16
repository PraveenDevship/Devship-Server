const { check } = require('express-validator');
const CONFIG = require('../../config/config.js');
var library = require('../../model/library.js');
const middlewares = require('../../model/middlewares.js');
const { product1 } = require('../../model/mongodb.js');
const { ensureAuthorizedClient } = require('../../model/security/ensureAuthorised.js');

module.exports = (app, io) => {
  try {
    var product = require('../../controller/product/product')(app, io);

    app.post(
      '/product/create',
      [
        check('catagroy', library.capitalize('catagroy is required')),
        check('name', library.capitalize('name is required ')),
        check('prize',library.capitalize('prize is required ')),
        check('offerprize',library.capitalize('offerprize is required ')),
        check('availability',library.capitalize('availability is required ')),
        middlewares
        .commonUpload(CONFIG.DIRECTORY_ADMIN_PRODUCT)
        .fields([{ name: 'photo', maxCount: 1 }]),
      ],
      product.createProduct
    )

    app.post(
      '/admin/products',
      product.getproduct
    )

    app.post(
      '/admin/product/update/:id',
      product.getProductUpdate
    )

    app.post(
      '/admin/product/delete/:id',
      product.ProductDeletation
    )

    app.post(
      '/admin/product/data',
      product.getProductData
    )

    
    app.post(
      '/admin/product/change/:id',
      product.getAdminStockChange
    )
    
    app.post (
      '/product/mobile',
      product.getMobile
    )

    app.post (
      '/product/shirt',
      product.getShirt
    )

    app.post (
      '/product/shoe',
      product.getShoe
    )

    app.post (
      '/product/search',
      product.SearchProduct
    )

    app.post (
      '/prize/range',
      product.PrizeRange
    )

  } catch (error) {
    console.log(`Error occured ${error}`, error.message);
  }
};