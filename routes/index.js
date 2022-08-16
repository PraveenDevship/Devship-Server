'use strict';

var express = require('express');
var path = require('path');
var jwt = require('jsonwebtoken');

var CONFIG = require('../config/config.js');

var dynamicTime = '';
var fs = require('fs');

module.exports = function (app, io) {
  try {
    var admin = require('../routes/admin')(app, io);
    var client = require('../routes/client')(app, io);
    var cart = require('../routes/cart/cart.js')(app, io);
    var product = require('../routes/product/product')(app,io);
    var address = require('../routes/address/address.js')(app,io);
    var order = require('../routes/order/order')(app,io);

    app.get('/', function (req, res) {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });

    app.get('/admin/shop/*', function (req, res) {
      res.sendFile(path.join(__dirname, '../public/admin/shop/index.html'));
    });

    app.get('/admin/*', function (req, res) {
      res.sendFile(path.join(__dirname, '../public/admin/index.html'));
    });

    app.get('/*', function (req, res) {
      res.sendFile(path.join(__dirname, '../public', 'index.html'));
    });
  } catch (e) {
    console.log('error in index.js---------->>>>', e);
  }
};
