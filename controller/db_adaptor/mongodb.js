const { result } = require('lodash');
let db = require('../../model/mongodb.js');

/* Getdocument */

const GetDocument = (collection, query, projection, extension) => {
  return new Promise((resolve, reject) => {
    let qry = db[collection].find(query, projection, extension.options);
    if (extension.populate) {
      qry.populate(extension.populate);
    }
    if (extension.sort) {
      qry.sort(extension.sort);
    }
    if (extension.skip) {
      qry.skip(extension.skip);
    }
    if (extension.limit) {
      qry.limit(extension.limit);
    }
    if (extension.select) {
      qry.select(extension.select);
    }
    qry.exec((err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

/* getonedocument */
const GetOneDocument = (collection, query, projection, extension) => {
  return new Promise((resolve, reject) => {
    let qry = db[collection].findOne(query, projection, extension.options);
    if (extension.populate) {
      qry.populate(extension.populate);
    }
    if (extension.sort) {
      qry.sort(extension.sort);
    }
    if (extension.skip) {
      qry.skip(extension.skip);
    }
    if (extension.limit) {
      qry.limit(extension.limit);
    }
    qry.exec((err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};


/* aggregation */
const GetAggregation = (collection, query) => {
  return new Promise((resolve, reject) => {
    let qry = db[collection].aggregate(query);
    qry.options = { allowDiskUse: true }; /* for sort exceeding error */
    qry.collation({
      locale: 'en_US',
      caseLevel: true,
      caseFirst: 'upper',
    }); /* for checking upper case and lower cse */
    qry.exec((err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
/* insert */
const InsertDocument = (collection, docs) => {
  return new Promise((resolve, reject) => {
    let query = db[collection](docs);
    query.save((err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const InsertMultipleDocs = (model, docs) => {
  return new Promise((resolve, reject) => {
    db[model].insertMany(docs, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

/* update */
const UpdateManyDocument = (collection, query, params, options) => {
  return new Promise((resolve, reject) => {
    db[collection].updateMany(query, params, options, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const UpdateOneDocument = (collection, query, params, options) => {
  return new Promise((resolve, reject) => {
    db[collection].updateOne(query, params, options, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

/* deletedocument */
const DeleteDocument = (collection, query) => {
  return new Promise((resolve, reject) => {
    db[collection].deleteMany(query, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

// Delete One Document
const DeleteOneDocument = (collection, query) => {
  return new Promise((resolve, reject) => {
    db[collection].deleteOne(query, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const GetCount = (collection, query) => {
  return new Promise((resolve, reject) => {
    db[collection].countDocuments(query, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};


/* indexing query */
const ensureIndex = (collection, query) => {
  return new Promise((resolve, reject) => {
    db[collection].createIndex(query, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const dropIndex = (collection, query) => {
  return new Promise((resolve, reject) => {
    db[collection].dropIndex(query, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const getIndexes = (model, callback) => {
  var collection = state.db.collection(model);
  collection.getIndexes((err, docs) => {
    callback(err, docs);
  });
};
/* export common query */


// // get Product


// const GetProduct = (collection, query, params, options) => {
//   return new Promise((resolve, reject) => {
//     Product.find(query, params, options, (err, result) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(result);
//       }
//     });
//   });
// };

// //Product Availability Update

// const AvailabilityUpdate = (collection, query, params, options) => {
//   return new Promise((resolve, reject) => {
//     Product.findByIdAndUpdate(query, params, options, (err, result) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(result);
//       }
//     });
//   });
// };


// //Product insert


// const InsertProduct = (model, docs) => {
//   return new Promise((resolve, reject) => {
//     Product.insertMany(docs, (err, result) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(result);
//       }
//     });
//   });
// };

// //Product Delete 


// const ProductDelete = (collection, query) => {
//   return new Promise((resolve, reject) => {
//     Product.findOneAndDelete(query, (err, result) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(result);
//       }
//     });
//   });
// };


// //Product Update

// const ProductUpdate = (collection, query, params, options) => {
//   return new Promise((resolve, reject) => {
//     Product.findByIdAndUpdate(query, params, options, (err, result) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(result);
//       }
//     });
//   });
// };



module.exports = {
  GetDocument: GetDocument,
  GetOneDocument: GetOneDocument,
  GetAggregation: GetAggregation,
  InsertDocument: InsertDocument,
  InsertMultipleDocs: InsertMultipleDocs,
  UpdateManyDocument: UpdateManyDocument,
  UpdateOneDocument: UpdateOneDocument,
  DeleteDocument: DeleteDocument,
  DeleteOneDocument: DeleteOneDocument,
  GetCount: GetCount,
  ensureIndex: ensureIndex,
  dropIndex: dropIndex,


  // InsertProduct : InsertProduct,
  // GetProduct : GetProduct,
  // AvailabilityUpdate : AvailabilityUpdate,
  // ProductDelete : ProductDelete,
  // ProductUpdate : ProductUpdate
};
