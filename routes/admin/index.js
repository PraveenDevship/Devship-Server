'use strict';

module.exports = function (app, io) {
  try {
    var admin = require('./admin')(app, io);
    
  } catch (e) {
    console.log('error in admin index.js---------->>>>', e);
  }
};
