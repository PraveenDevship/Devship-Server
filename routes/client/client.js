'use strict';

const { check } = require('express-validator');
var middlewares = require('../../model/middlewares.js');
var CONFIG = require('../../config/config');
var jwt = require('jsonwebtoken');
var library = require('../../model/library.js');
var mongoose = require('mongoose');
const { GetOneDocument } = require('../../controller/db_adaptor/mongodb.js');
const { ensureAuthorizedClient } = require('../../model/security/ensureAuthorised');
const { cart } = require('../../model/mongodb.js');

var isObjectId = (n) => {
  return mongoose.Types.ObjectId.isValid(n);
};

module.exports = (app, io) => {
  try {
    var client = require('../../controller/client/client.js')(app, io);

    app.post(
      '/getdata',
      client.getData
    )

    app.post(
      '/getdata1',
      client.getData1
    )

    app.post(
      '/client/update/:id',
      client.UpdateUser
    )

    app.post(
      '/admin/user/delete/:id',
      client.UserDelete
    )

    app.post(
      '/login',
      [
        check('email', library.capitalize('Email is required')).isEmail(),
        check('password', library.capitalize('invalid password')).isLength({
          min: 4,
        }),
      ],
      client.login
    );
    app.post(
      '/client/auth/login',
      [check('_id', library.capitalize('ID is required')).not().isEmpty()],
      client.loginAsClient
    );
    app.post(
      '/register',
      [
        check('first_name', library.capitalize('first_name is required')).not().isEmpty(),
        check('email', library.capitalize('Email is required')).isEmail(),
        check('password', library.capitalize('invalid password')).isLength({
          min: 4,
        }),
      ],
      client.registration
    );
    

    app.post(
      '/admin/adduser',
      [
        check('first_name', library.capitalize('first_name is required')).not().isEmpty(),
        check('email', library.capitalize('Email is required')).isEmail(),
        check('password', library.capitalize('invalid password')).isLength({
          min: 4,
        }),
      ],
      client.Adduser
    );


    app.post(
      '/forgot/password',
      [check('email', library.capitalize('email is required')).isEmail()],
      client.forgotPassword
    );

    app.post(
      '/client/check/password-reset-id',
      [
        check('passwordResetUID', library.capitalize('Password reset UID required'))
          .not()
          .isEmpty(),
      ],
      client.checkClientPasswordResetUID
    );

    app.post(
      '/verify/otp',
      [check('otp', library.capitalize('OTP required')).not().isEmpty()],
      client.verifyOTP
    );

    app.post(
      '/change/password',
      [
        check('email', library.capitalize('email is required')).isEmail(),
        check('password', library.capitalize('invalid new password')).isLength({
          min: 4,
        }),
      ],
      client.changePassword
    );

    app.post('/client/get/dashboard', ensureAuthorizedClient, client.getDashboard);

    app.post(
      '/client/get/userdata',
      ensureAuthorizedClient,
      [check('user', library.capitalize('user is required')).not().isEmpty()],
      client.getUserData
    );

    /* Manage Address */

    app.post(
      '/client/get/manage/address',
      ensureAuthorizedClient,
      [check('user', library.capitalize('user is required')).not().isEmpty()],
      client.getAddressInformation
    );
    app.post(
      '/client/save/manage/address',
      ensureAuthorizedClient,
      [check('id', library.capitalize('user is required')).not().isEmpty()],
      client.saveAddressInformation
    );
    
    app.post(
      '/client/address/remove',
      ensureAuthorizedClient,
      [check('id', library.capitalize('user is required')).not().isEmpty()],
      [check('type', library.capitalize('type is required')).not().isEmpty()],
      [check('addressID', library.capitalize('addressID is required')).not().isEmpty()],
      client.removeAddress
    );
    app.post(
      '/client/address/select/status',
      ensureAuthorizedClient,
      [check('id', library.capitalize('user is required')).not().isEmpty()],
      [check('type', library.capitalize('type is required')).not().isEmpty()],
      [check('addressID', library.capitalize('addressID is required')).not().isEmpty()],
      client.selectAddress
    );

    /*End Manage Address */

    app.post(
      '/user/update/user/:name',
      ensureAuthorizedClient,
      [check('id', library.capitalize('user id is required')).not().isEmpty()],
      client.updateUserInformation
    );
    app.post(
      '/user/save/local/photo',
      ensureAuthorizedClient,
      middlewares
        .commonUpload(CONFIG.DIRECTORY_USER_PHOTO)
        .fields([{ name: 'photo', maxCount: 1 }]),
      client.saveUserPhoto
    );
    app.post('/user/remove/local/photo', ensureAuthorizedClient, client.removeUserPhoto);

    app.post(
      '/user/save/local/photo/company-logo',
      ensureAuthorizedClient,
      middlewares
        .commonUpload(CONFIG.DIRECTORY_CLIENT_UNIFORM_COMPANYLOGO)
        .fields([{ name: 'photo', maxCount: 1 }]),
      client.saveUserCompanyLogoPhoto
    );

    app.post(
      '/user/remove/local/photo/company-logo',
      ensureAuthorizedClient,
      client.removeUserCompanyLogoPhoto
    );

    app.post('/user/get/settings', ensureAuthorizedClient, client.getSettings);

    /* Feedbacks */

    app.post(
      '/client/feedback/add',
      ensureAuthorizedClient,
      [
        check('name', library.capitalize('Name is required')).not().isEmpty().trim(),
        check('feedback', library.capitalize('Feedback is required')).not().isEmpty().trim(),
        check('comment', library.capitalize('Comment is required')).not().isEmpty().trim(),
      ],
      client.add
    );

    app.post('/client/feedback/list', ensureAuthorizedClient, client.list);

    app.post(
      '/client/feedback/email',
      [
        check('rating', 'Rating is required').not().isEmpty(),
        check('comment', 'Comment is required').not().isEmpty().trim(),
        check('memberId', 'Member ID is required').not().isEmpty().trim(),
      ],
      ensureAuthorizedClient,
      client.sendFeedbackEmailToMember
    );

    app.post('/client/settings/faq', client.faqList);
  } catch (e) {
    console.log(`Error occured ${e}`);
  }
};
