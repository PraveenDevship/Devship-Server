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

const { product1 } = require('../../model/mongodb');

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
} = require('../../controller/db_adaptor/mongodb.js');

const { promisify } = require('util');
const Product = require('../../schema/Product');
const { result } = require('lodash');
const unlinkAsync = promisify(fs.unlink);

module.exports = (app, io) => {
  var router = {};


  router.createProduct = async (req, res) => {

    const photo = library.get_attachment(
      req.files.photo[0].destination,
      req.files.photo[0].filename
    )

    const catagroy = _.get(req.body, 'catagroy', '');
    const name = _.get(req.body, 'name', '');
    const prize = _.get(req.body, 'prize', '');
    const offerprize = _.get(req.body, 'offerprize', '')
    const availability = _.get(req.body, 'availability', '');

    let productId = 'PRODUCT' + Math.floor(10000 + Math.random() * 90000);

    const insert = {
      catagroy,
      name,
      prize,
      offerprize,
      availability,
      photo,
      discount: Math.floor(Math.random() * 90 + 10),
      productId
    }

    const newProduct = InsertDocument("product1", insert).then((newProduct) => {
      res.json({
        Status: 1,
        message: "Product created Successfully!!!"
      })
    }).catch((err) => {
      console.log(err)
    })

    // newProduct
    //   .save()
    //   .then(() => {
    //     res.json({ Status : 1,message: "Product created Successfully!!!" });
    //   })
    //   .catch((err) => {
    //     res.send(err);
    //   });

  }


  router.getproduct = async (req, res) => {
    const result = await GetDocument('product1', {}, {}, {});
    res.json(result);
  }


  router.ProductDeletation = async (req, res) => {

    try {
      await DeleteOneDocument('product1', { _id: req.params.id }, {}, {});
      res.status(200).json({
        status: 1,
        message: "Product has been deleted."
      });
    } catch (err) {
      console.log(err);
    }

  }

  router.getProductUpdate = async (req, res) => {

    const catagroy = _.get(req.body,'catagroy','');
    const name = _.get(req.body,'name','');
    const prize = _.get(req.body,'prize','');
    const offerprize = _.get(req.body,'offerprize','');
    await UpdateOneDocument('product1', { _id: req.params.id }, {
      $set: {
        catagroy,
        name,
        prize,
        offerprize
      }
    }).then((result) => {
      res.json({
        status: 1,
        message: "successfully updateded"
      })
    }).catch((err) => {
      res.json(err);
    })
  }


  router.getProductData = async (req, res) => {
    try {
      const catagroy = _.get(req.body, 'catagroy');

      const result = await GetDocument('product', { catagroy: catagroy }, {}, {})
      if (result === []) {
        res.json({
          status: false,
          message: "Product Doesn't match!!!"
        })
      } else {
        res.json(result)
      }
    }
    catch (err) {
      res.json({
        status: false,
        message: "server Error"
      })
    }
  }


  router.getAdminStockChange = async (req, res) => {

    const availability = _.get(req.body, 'availability', '');

    await UpdateOneDocument('product1', { _id: req.params.id }, {
      $set: {
        availability
      }
    }).then((result) => {
      res.json({
        status: 1,
        message: "successfully updateded"
      })
    }).catch((err) => {
      res.json(err);
    })
  }


  router.getMobile = async (req,res) => {
    try {
      const result = await GetDocument('product1', { catagroy: "Mobile" }, {}, {}).then((data) => {
        res.json({
          status : 1,
          message : "Mobile Products",
          data,
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

  router.getShirt = async (req,res) => {

    try {
      const result = await GetDocument('product1', { catagroy: "Shirt" }, {}, {}).then((data) => {
        res.json({
          status : 1,
          message : "Shirt Products",
          data,
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
  
  
router.getShoe = async (req,res) => {

  try {
    const result = await GetDocument('product1', { catagroy: "Shoe" }, {}, {}).then((data) => {
      res.json({
        status : 1,
        message : "Shoe Products",
        data,
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

router.SearchProduct = async (req,res) => {

  const search = _.get(req.body,'search',false);

  const query = [];

  if(search){
    query.push({$match : {
      $or : [
        {
          name : {
            $regex : search + '.*'
          }
        }
      ]
    }})
  }else{
    res.json({
      status : 0,
      message : "Product Not Found"
    })
  }

  await GetAggregation('product1',query).then((data) => {
    res.json({
      status : 0,
      message : "Success",
      data
    })
  }).catch((err) => {
    console.log(err)
  })
}


// router.PrizeRange = async (req,res) => {

//   const catagroy = _.get(req.body,'catagroy','');  

//   const range = parseInt(req.body.range);


//   // const query = []
//   // if(query){
//   //   query.push({
//   //     $match : {
//   //       $or : [
//   //         {
//   //           offerprize : {
//   //             $regex : range + '.*'
//   //           }
//   //         }
//   //       ]   
//   //     }
//   //   })
//   // }else{
//   //   res.json({
//   //     status : 0,
//   //     message : "Not found"
//   //   })
//   // }

//   await GetAggregation('product1',[
//     {
//       $match :{
//         offerprize : {
//           $lte : range
//         }
//       }
//     }
//   ],).then((data) => {
//     res.json({
//       status : 1,
//       message : "Success",
//       data
//     })
//   }).catch((err) => {
//     console.log(err)
//   })
// }


router.PrizeRange = async (req, res) => {

  try {

    let search = _.get(req.body, 'search', '');
    let catagroy = _.get(req.body, 'catagroy', '');
    let range = _.get(req.body, 'range', 0);

    // sort 

    sort = {};
    let order = _.get(req.body,'order',false);

    if(order) {
      sort = {offerprize : 1}
    }else{
      sort = {offerprize : -1}
    }

    let query = [];
    if (search) {
      query.push({
        $match: {
          $or: [
            {
              name: {
                $regex: search + '.*',
                $options: 'si',
              },
            },
            {
              feedback: {
                $regex: search + '.*',
                $options: 'si',
              },
            },
          ],
        },
      })
    }
    
    if (range !== 0) {
      const filter = { offerprize: { $lte: _.toNumber(req.body.range) } };
      query.push({ $match: filter });
    }
    if (catagroy !== '') {
      query.push({ $match: { catagroy: req.body.catagroy }});
    }
    const withoutlimit = Object.assign([], query);
    withoutlimit.push({ $count: 'count' });

    query.push(
      { $match: { catagroy : { $ne: 0 } }},
      {$sort : sort},
      {
        $project: {
          name: 1,
          prize: 1,
          discount : 1,
          photo: 1,
          offerprize: 1,
          availability :1,
          catagroy: 1,
        },
      }
    );
    
    const finalquery = [
      {
        $facet: {
          overall: withoutlimit,
          documentdata: query,
        },
      },
    ];

    const getUser = await GetAggregation('product1', finalquery);
    let data = _.get(getUser, '0.documentdata', []);
    let fullcount = _.get(getUser, '0.overall.0.count', 0);
    if (data && data.length > 0) {
      res.json({
        status: 1,
        response: {
          result: data,
        },
      });
    } else {
      res.json({
        status: 0,
        response: {
          result: [],
          fullcount: fullcount,
          length: data.length,
        },
      });
    }
  } catch (error) {
    console.log('error', error);
    res.json({
      status: 0,
      response: 'Something went wrong',
      err: error,
    });
  }
};


return router;

}