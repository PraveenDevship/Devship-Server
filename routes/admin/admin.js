'use strict';

const { check } = require('express-validator');
var middlewares = require('../../model/middlewares.js');
var CONFIG = require('../../config/config');
var library = require('../../model/library.js');
const { ensureAuthorizedAdmin } = require('../../model/security/ensureAuthorised.js');

module.exports = (app, io) => {
  try {
    var admin = require('../../controller/admin/admin.js')(app, io);
    var client = require('../../controller/client/client.js')(app, io);

    // app.post(
    //   '/admin/register',
    //   [
    //     check('username', library.capitalize('username is required')).not().isEmpty(),
    //     check('email', library.capitalize('Email is required')).isEmail(),
    //     check('password', library.capitalize('invalid password')).isLength({
    //       min: 4,
    //     }),
    //   ],
    //   admin.register
    // )

    app.post(
      '/admin/getdata',
      admin.getAdminData
    )
    
    app.post(
      '/admin/login',
      [
        check('email', library.capitalize('Email is required')).not().isEmpty(),
        check('password', library.capitalize('invalid password')).isLength({
          min: 3,
        }),
      ],
      admin.login
    );
    app.post(
      '/admin/forgot/password',
      [check('email', library.capitalize('email is required')).isEmail()],
      admin.forgotPassword
    );
    app.post(
      '/admin/verify/otp',
      [check('otp', library.capitalize('OTP required')).not().isEmpty()],
      admin.verifyOTP
    );
    app.post(
      '/admin/change/password',
      [
        check('email', library.capitalize('email is required')).isEmail(),
        check('new_password', library.capitalize('invalid new password')).isLength({
          min: 4,
        }),
      ],
      admin.changePassword
    );
    app.post(
      '/admin/update/profile/:name',
      [check('id', library.capitalize('user id is required')).not().isEmpty()],
      admin.updateAdmin
    );
    app.post(
      '/admin/get/userdata',
      [check('user', library.capitalize('user is required')).not().isEmpty()],
      admin.getUserData
    );
    app.post(
      '/admin/save/local/photo',
      middlewares
        .commonUpload(CONFIG.DIRECTORY_USER_PHOTO)
        .fields([{ name: 'photo', maxCount: 1 }]),
      admin.saveUserPhoto
    );

    app.post('/admin/get/dashboard', admin.getDashboard);

    app.post('/admin/notifications/list', ensureAuthorizedAdmin, admin.recent_notify);
    app.post('/admin/notifications/read', ensureAuthorizedAdmin, admin.markasread);
    app.post('/admin/notifications/bell/update', admin.updateBell);
    app.post('/admin/notifications/unread', admin.markas_un_read);
    app.post('/admin/notifications/allread', admin.markallasread);
  } catch (e) {
    console.log(`Error occured routes/admin/admin.js ${e}`);
  }
};
