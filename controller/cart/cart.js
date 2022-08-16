const db = require('../../controller/db_adaptor/mongodb.js');
const { validationResult } = require('express-validator'),
  mongoose = require('mongoose'),
  library = require('../../model/library.js'),
  jwt = require('jsonwebtoken'),
  bcrypt = require('bcrypt'),
  middlewares = require('../../model/middlewares.js'),
  CONFIG = require('../../config/config.js'),
  fs = require('fs');
var _ = require('lodash');

let mail = require('../../model/mail.js');
const moment = require('moment');
const { cart } = require('../../model/mongodb.js');

let multer = require('multer');

// const { upload } = require('../../model/multer.js');


let { ObjectId, isObjectId, required_msg, not_valid_msg } = require('../../model/common');
const {
  GetDocument,
  GetOneDocument,
  UpdateOneDocument,
  GetAggregation,
  InsertDocument,
  DeleteDocument,
  DeleteOneDocument
} = require('../../controller/db_adaptor/mongodb.js');

const { promisify } = require('util');
const Product = require('../../schema/Product');
const { result } = require('lodash');
const unlinkAsync = promisify(fs.unlink);

module.exports = (app, io) => {
  var router = {};


  router.CreateCart = async (req,res) => {
    
    const name = _.get(req.body, 'name', '');
    const photo = _.get(req.body, 'photo', '');
    const prize = _.get(req.body, 'prize', '');
    const offerprize = _.get(req.body, 'offerprize', '');
    const productId = _.get(req.body,'productId' , '');
    const discount = _.get(req.body,'discount','');
    const email = _.get(req.body,'email','');
    const catagroy = _.get(req.body,'catagroy','')

    const inset = {
      name,
      prize,
      offerprize,
      discount,
      photo,
      productId,
      catagroy,
      email
    };
    
    let insert = await InsertDocument('carts', inset).then((data) => {
        res.json({
            status : 1,
            message : "Cart Added"
        })
    })
  }

  router.getCartDelete = async (req,res) => {
    try {
      await DeleteOneDocument('carts', { _id: req.params.id }, {}, {});
      res.status(200).json({
        status: 1,
        message: "Product has been removed your cart."
      });
    } catch (err) {
      console.log(err);
    }
  }


  router.getCartData = async (req, res) => {

    try {
      const email = _.get(req.body,'email','')

      const result = await GetDocument('carts', { email : email}, {}, {}).then((data) => {
        res.json({
          status : 1,
          message : "Cart Products",
          data
        })
      })
    }
    catch (err) {
      res.json({
        status: false,
        message: "server Error"
      })
    }

  }

return router;

}