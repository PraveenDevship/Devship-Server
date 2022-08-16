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
  DeleteOneDocument,
  UpdateManyDocument
} = require('../../controller/db_adaptor/mongodb.js');

const { promisify } = require('util');
const Product = require('../../schema/Product');
const { result } = require('lodash');
const { json } = require('express');
const unlinkAsync = promisify(fs.unlink);

module.exports = (app, io) => {
  var router = {};

  router.AddressCreated = async (req,res) => {

    try{

      const flatno = _.get(req.body,'flatno','');
      const line1 =_.get(req.body,'line1','');
      const line2 =_.get(req.body,'line2','');
      const state =_.get(req.body,'state','');
      const city =_.get(req.body,'city','');
      const pincode =_.get(req.body,'pincode','');
      const phoneno = _.get(req.body,'phoneno','');
      const email =_.get(req.body,'email','');

      const insert = {
        flatno,
        line1,
        line2,
        state,
        city,
        pincode,
        phoneno,
        email
      }

      const result = await InsertDocument('address',insert).then((data) => res.json({
        status : 1,
        message : "Address Added Successfully!!!",
        data
      })).catch((err) => {
        console.log(err);
        res.json({
          status : 0,
          message : "Address Not Added!!!"
        })
      })
    }catch{
      res.json({
        status : 0,
        message : "Server Error"
      })
    }
  }


  
  router.AddressData = async (req, res) => {
    const email = _.get(req.body, 'email', '')
    const result = await GetDocument('address', { email: email }, {}, {}).then((data)=> {
      res.json({
        status : 1,
        message : "success",
        data
      })
    })
  }


  router.AddressUpdate = async (req,res) => {

    try{

      const flatno = _.get(req.body,'flatno','');
      const line1 = _.get(req.body,'line1','');
      const line2 = _.get(req.body,'line2','');
      const city = _.get(req.body,'city','');
      const state = _.get(req.body,'state','');
      const pincode = _.get(req.body,'pincode','');
      const phoneno = _.get(req.body,'phoneno','');

      const result = await UpdateOneDocument('address',{_id : req.params.id},{
        $set : {
          flatno,
          line1,
          line2,
          city,
          state,
          pincode,
          phoneno
        }
      }).then((data) => res.json({
        status : 1,
        message : "Address Updataed Sucessfully!!!",
        data
      })).catch((err)  => {
        console.log(err)
      })

    }catch{
      res.json({
        status : 0,
        message : "server error"
      })
    }
  }


  router.AddressDelete = async (req,res) => {

    try{

      await DeleteOneDocument('address',{_id : req.params.id},{},{})
      res.json({
        status : 1,
        message : "Address Has been Deleted"
      })

    }catch{
      res.json({
        status : 0,
        message : "Server Error"
      })
    }

  }


  // router.DefaultSelect = async (req,res) => {

  //   try{

  //     const result =  UpdateManyDocument('address',{_id : req.params.id, disable : true},{disable : false},{})
  //     res.json({
  //       status : 1,
  //       message : "Success",
  //       result
  //     })

  //   }catch{

  //     res.json({
  //       status : 0,
  //       message : "Server Error!!!"
  //     })

  //   }

  // }



return router;

}