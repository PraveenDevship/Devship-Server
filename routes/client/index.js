'use strict';

module.exports = function (app, io) {
  try {
    var client = require('./client')(app, io);
   
  } catch (e) {
    console.log('error in client routes index.js---------->>>>', e);
  }
};
