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

let multer = require('multer');

const { order } = require('../../model/mongodb');

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

  router.CreatedOrder = async (req,res) => {
    try{

      const catagroy = _.get(req.body,'catagroy','');
      const name  = _.get(req.body,'name','');
      const prize =_.get(req.body,'prize','');
      const offerprize =_.get(req.body,'offerprize','');
      const photo =_.get(req.body,'photo','');
      const quantity =_.get(req.body,'quantity','');
      const discount =_.get(req.body,'discount','');
      const clientname =_.get(req.body,'clientname','');
      const email =_.get(req.body,'email','');
      const flatno =_.get(req.body,'flatno','');
      const line1 =_.get(req.body,'line1','');
      const line2 =_.get(req.body,'line2','');
      const city =_.get(req.body,'city','');
      const state =_.get(req.body,'state','');
      const pincode =_.get(req.body,'pincode','');
      const phoneno =_.get(req.body,'phoneno','');
      const productId =_.get(req.body,'productId','');
      const approved = "Approved"
      const delivery = Math.floor(Math.random() * 10) + 1;
      const paid = "Paid";
      const totalprize = quantity * offerprize;

      const insert = {
        catagroy,
        name,
        prize,
        offerprize,
        photo,
        quantity,
        discount,
        clientname,
        email,
        flatno,
        line1,
        line2,
        city,
        state,
        pincode,
        phoneno,
        approved,
        delivery,
        paid,
        productId,
        totalprize
      }

      await InsertDocument('order',insert).then((data) => {
        res.json({
          status : 1,
          message : "Order Successfully",
          data
        })
      }).catch((err) => {
        console.log(err)
      })

    }catch{
      res.json({
        status : 0,
        message : "Server Error"
      })
    }
  }


  router.OrderGetData = async (req,res) => {

    try{

      const result = await GetDocument('order',{},{},{})
      res.json({
        status : 1,
        message : "success",
        result
      })

    }catch{
      res.json({
        status : 0,
        message : "Server error"
      })
    }
  }

  router.ClientOrderData = async (req,res) => {
    try{

      const email = _.get(req.body,'email','');

       await GetDocument('order',{email : email},{},{}).then((data) => {
        res.json (data)
       }).catch((err) => {
        console.log(err)
       })

    }catch{
      res.json({
        status : 0,
        message :"server error"
      })
    }
  }


  router.OrderDelete = async (req,res) => {
    try{

      const result = await DeleteOneDocument('order',{_id : req.params.id},{},{})
      res.json({
        status : 1,
        message : "Order Cancel Successfully",
      })

    }catch{
      res.json({
        status :0,
        message : "server error"
      })
    }
  }

return router;

}