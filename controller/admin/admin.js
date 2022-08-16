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
const { admins, client } = require('../../model/mongodb.js');
const Product = require('../../schema/Product');
const { result } = require('lodash');
const unlinkAsync = promisify(fs.unlink);

const pdfoptions = {
  format: 'A4',
  orientation: 'portrait',
  border: { top: '2px', right: '0.1px', bottom: '2px', left: '0.1px' },
};

module.exports = (app, io) => {
  const push_notification = require('../../model/push_notification.js')(io);
  var router = {};



  // router.register = async (req,res) => {
  //   const data = {};
  //     data.status = 0;

  //     let getadminEmail = await GetOneDocument('admins', { email: req.body.email }, {}, {});
  //     if (getadminEmail) {
  //       return res.json({ status: 0, response: 'Email already exists' });
  //     }

  //     const username = _.get(req.body, 'username', '');
  //     const email = _.get(req.body, 'email', '');
  //     const role = _.get(req.body, 'role', '');

  //     let adminId = 'CAM' + Math.floor(1000 + Math.random() * 9000);

  //     const admin = {
  //       username,
  //       email,
  //       adminId,
  //       role
  //     };


  //     if (req.body.password && req.body.confirmPassword) {
  //       admin.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
  //     }

  //     let insert = await InsertDocument('admins', admin);

  //     if (insert) {

  //       res.json({ status: 1, response: 'User Created' });
  //     } else {
  //       res.json({ status: 0, response: 'Failed to create user' });
  //     }
  // }



  router.getAdminData = async (req, res) => {
    const email = _.get(req.body, 'email', '')
    const result = await GetOneDocument('admins', { email: email }, { username: 1 }, {})
    res.json(result);
  }



  let insertClientTraining = async (req) => {
    try {
      let { cartData, prefix, customer_ID, userID } = req;
      if (cartData.length > 0 && Array.isArray(cartData)) {
        each(
          cartData,
          async (item, cb) => {
            if (item.training) {
              let training = await GetOneDocument(
                'trainings',
                { _id: ObjectId(item.training) },
                {},
                {}
              );

              const obj = {
                client: userID,
                trainingID: training._id,
                title: training.title,
                no_of_lessons: training.no_of_lessons,
                total_hours: training.total_hours,
                description: training.description,
                amount: training.amount,
                tutor_name: training.tutor_name,
                brochure_file_name: training.brochure_file_name,
                link: training.link,
                packages: training.packages,
                added_by: 'client',
                type: 'paid',
                customer_ID: customer_ID,
                prefix: prefix,
                purchase_date: +new Date(),
              };

              let insert = await InsertDocument('clientTrainings', obj);

              process.nextTick(cb);
            } else {
              process.nextTick(cb);
            }
          },
          () => {
            return true;
          }
        );
      } else {
        console.log(`no cart data in ${req}`);
        return true;
      }
    } catch (error) {
      console.log(`error insertClientTraining in ${error}`);
      return true;
    }
  };

  router.login = async (req, res) => {
    var data = {};
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ status: 0, errors: errors.errors[0].msg });
    }
    try {
      const email = req.body.email;
      let user = await GetOneDocument(
        'admins',
        {
          $or: [
            { email: email, status: 1 },
            { username: email, status: 1 },
          ],
        },
        {},
        {}
      );
      // let subadmin = await GetOneDocument(
      //   'subadmins',
      //   {
      //     $or: [
      //       { email: email, status: 1 },
      //       { username: email, status: 1 },
      //     ],
      //   },
      //   {},
      //   {}
      // );
      if (user !== undefined && user !== null) {
        library.validPassword(req.body.password, user.password, (error, isValidPassword) => {
          if (isValidPassword) {
            library.jwtSign(
              {
                email: user.email,
                role: user.role,
                username: user.username,
                _id: user._id,
              },
              async (error, authToken) => {
                user.activity.last_login = new Date();

                // Update subadmin last_login activity
                await UpdateOneDocument(
                  'admins',
                  { _id: user._id },
                  { activity: user.activity },
                  {}
                ).catch((err) => {
                  console.log('Unable to update subadmin last_login activity', err);
                });

                if (error) {
                  data.response = 'Invalid Credentials';
                  res.json(data);
                } else {
                  data.status = 1;
                  data.response = "Login sucessfully"
                  // data.response = {
                  //   // userId: user._id,
                  //   // authToken: authToken,
                  //   // role: user.role,
                  //   response: 'Login Successfully',
                  // };
                  res.json(data);
                }
              }
            );
          } else {
            data.status = 0;
            data.response = 'Invalid Password';
            res.json(data);
          }
        });
      } else {
        if (subadmin !== undefined && subadmin !== null) {
          library.validPassword(req.body.password, subadmin.password, (error, isValidPassword) => {
            if (isValidPassword) {
              library.jwtSign(
                {
                  email: subadmin.email,
                  role: subadmin.role,
                  _id: subadmin._id,
                },
                async (error, authToken) => {
                  if (error) {
                    data.response = 'Invalid Credentials';
                    return res.json(data);
                  }

                  subadmin.activity.last_login = new Date();

                  // Update subadmin last_login activity
                  await UpdateOneDocument(
                    'subadmins',
                    { _id: subadmin._id },
                    { activity: subadmin.activity },
                    {}
                  ).catch((err) => {
                    console.log('Unable to update subadmin last_login activity', err);
                  });

                  data.status = 1;
                  data.response = "Login Successfully"
                  // data.response = {
                  //   // userId: subadmin._id,
                  //   // authToken: authToken,
                  //   // role: subadmin.role,
                  //   message: 'Login Successfully',
                  // };
                  res.json(data);
                }
              );
            } else {
              data.status = 0;
              data.response = 'Invalid Password';
              res.json(data);
            }
          });
        } else {
          data.status = 0;
          data.response = 'User Not Found';
          res.json(data);
        }
      }
    } catch (err) {
      data.status = 0;
      console.log('err login', err);
      data.response = library.capitalize('server error');
      data.error = err;
      res.json(data);
    }
  };


  //Create Product






  router.forgotPassword = async (req, res) => {
    var data = {};
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.errors[0].msg });
    }
    try {
      let settings = await db.GetOneDocument('settings', { alias: 'general' }, {}, {});
      if (settings) {
        let user = await db.GetOneDocument('admins', { email: req.body.email }, {}, {});
        if (user && typeof user._id != 'undefined') {
          if (user.new_user == 1) {
            data.status = 0;
            data.message = library.capitalize('use provided password for the first time...!');
            res.json(data);
          } else {
            let query = {
              _id: { $eq: ObjectId(user._id) },
            };
            var uniqueID = library.randomString(8, '#');

            let obj = {};
            obj.otp = Math.floor(1000 + Math.random() * 9000); /* 6 digits */
            obj.otp_timestamp = Date.now() + 360000;
            obj.otp_verified = 0;
            var params = {};
            params['$set'] = obj;
            let update = await db.UpdateManyDocument('admins', query, params, {});
            if (!update || update.nModified == 0) {
              data.status = 0;
              data.message = library.capitalize('update error');
              res.json(data);
            } else {
              var mailData = {};
              // mailData.template = "userForgotpassword";
              // mailData.to = admin.email;
              // mailData.html = [];
              // mailData.html.push({ name: "name", value: admin.first_name });
              // mailData.html.push({ name: "email", value: admin.email });
              // mailData.html.push({ name: "link", value: url || "" });

              const text = `Hello , You are receiving this email because we received a password reset request from your account
              OTP : ${obj.otp}
              `;

              var mailOptions = {
                from: 'care agency media' + ' <' + 'admin@careagencymedia.co.uk' + '>',
                to: user.email,
                subject: 'OTP request from Care Agency Media Admin',
                text: text,
                // html: html
              };
              mail.send(mailOptions, function (err, response, mode) {
                // console.log(err, response, mode);
              });

              // mailcontent.sendmail(mailData, function (err, response) {});
              data.status = 1;
              data.response = 'Link Sent to mail Successfully!';
              res.json(data);
            }
          }
        } else {
          data.status = 0;
          data.message = library.capitalize('Entered email is not registered with us...!');
          res.json(data);
        }
      } else {
        data.status = 0;
        data.message = library.capitalize('admin need to configure the settings...!');
        res.json(data);
      }
    } catch (err) {
      console.log('error forgot password', err);
      data.status = 0;
      data.message = library.capitalize('server error');
      res.json(data);
    }
  };
  router.verifyOTP = async (req, res) => {
    try {
      let email = _.get(req.body, 'email', false);
      let OTP = _.get(req.body, 'otp', false);

      if (!email) {
        return res.json({ status: 0, response: 'email is required' });
      }
      if (!OTP) {
        return res.json({
          status: 0,
          response: 'Verification code is required',
        });
      }
      let query = { email: email };
      let getUser = await GetOneDocument('admins', query, {}, {});
      if (getUser && getUser._id) {
        let otp = _.get(getUser, 'otp', false);
        let otp_timestamp = _.get(getUser, 'otp_timestamp', false);
        if (otp) {
          if (Number(otp) === Number(OTP)) {
            let timestamp = Date.now();
            if (Number(timestamp) < Number(otp_timestamp)) {
              let obj = {
                otp_verified: 1,
              };
              let update = await UpdateOneDocument(
                'admins',
                { _id: ObjectId(getUser._id) },
                obj,
                {}
              );
              res.json({
                status: 1,
                response: 'Verification code Verified successfully',
              });
            } else {
              res.json({ status: 0, response: `${OTP} expired` });
            }
          } else {
            res.json({
              status: 0,
              response: `${OTP}, Invalid verification code`,
            });
          }
        } else {
          res.json({
            status: 0,
            response: `Verification code not found for ${email}`,
          });
        }
      } else {
        res.json({ status: 0, response: `${email} not found` });
      }
    } catch (error) {
      console.log(`error in otp verify ${error}`);
      res.json({ status: 0, response: 'Something went wrong' });
    }
  };
  router.changePassword = async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.errors[0].msg });
    }

    try {
      let email = _.get(req.body, 'email', false);
      let password = _.get(req.body, 'password', false);
      if (!email) {
        return res.json({ status: 0, response: 'Email is required' });
      }
      if (!password) {
        return res.json({ status: 0, response: 'Password is required' });
      }
      let query = {
        email: email,
      };
      let getUser = await GetOneDocument('admins', query, {}, {});
      if (getUser && getUser._id) {
        let otp_verified = _.get(getUser, 'otp_verified', 0);
        if (Number(otp_verified) != 1) {
          return res.json({
            status: 0,
            response: 'Verification code not verified',
          });
        }

        let obj = {
          password: bcrypt.hashSync(password, bcrypt.genSaltSync(8), null),
        };
        let update = await UpdateOneDocument('admins', { _id: ObjectId(getUser._id) }, obj, {});
        if (update && update.nModified != 0) {
          res.json({ status: 1, response: 'Password update successfully' });
        } else {
          res.json({ status: 0, response: 'Password not update' });
        }
      } else {
        res.json({ status: 0, response: `${email} not found` });
      }
    } catch (error) {
      console.log(`error in update password ${error}`);
      res.json({ status: 0, response: 'Something went wrong' });
    }
  };


  router.updateAdmin = async (req, res) => {
    var data = {};
    data.status = 0;

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.errors[0].msg });
    }

    try {
      const { name } = req.params;
      let user = {};

      if (name === 'profile') {
        const first_name = _.get(req.body, 'first_name', '');
        const surname = _.get(req.body, 'surname', '');
        const email = _.get(req.body, 'email', '');
        const phone = _.get(req.body, 'phone', {
          number: '',
          code: '',
          dialcountry: '',
        });

        (user.first_name = first_name),
          (user.surname = surname),
          (user.email = email),
          (user.phone = phone);
      }

      if (name === 'password') {
        const password = _.get(req.body, 'password', '');
        const new_password = _.get(req.body, 'new_password', '');

        let userData = await GetOneDocument(
          'admins',
          {
            status: 1,
            _id: req.body.id,
          },
          { password: 1 },
          {}
        );
        library.validPassword(password, userData.password, async (error, isValidPassword) => {
          if (isValidPassword) {
            data.status = 1;
            user.password = bcrypt.hashSync(new_password, bcrypt.genSaltSync(8), null);
            if (req.body.id !== '') {
              let update = await UpdateOneDocument(
                'admins',
                { _id: ObjectId(req.body.id) },
                user,
                {}
              );
              if (!update || update.nModified == 0) {
                data.status = 0;
                data.message = library.capitalize('something went wrong try again..!');
                return res.send(data);
              } else {
                data.status = 1;
                data.message = library.capitalize('Application applied successfully');
                return res.send(data);
              }
            } else {
              return res.json({ status: 0, response: 'user id required' });
            }
          } else {
            data.status = 0;
            data.response = 'Your old password is incorrect';
            return res.json(data);
          }
        });
      }

      if (req.body.id !== '' && name !== 'password') {
        let update = await UpdateOneDocument('admins', { _id: ObjectId(req.body.id) }, user, {});
        if (!update || update.nModified == 0) {
          data.status = 0;
          data.message = library.capitalize('something went wrong try again..!');
          res.send(data);
        } else {
          data.status = 1;
          data.message = library.capitalize('Application applied successfully');
          res.send(data);
        }
      }
    } catch (err) {
      console.log('updateAdmin err', err);
      data.status = 0;
      data.message = library.capitalize('server error');
      res.send(data);
    }
  };

  router.getUserData = async (req, res) => {
    var data = {};
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.errors[0].msg });
    }

    try {
      let user = _.get(req.body, 'user', false);
      let project = _.get(req.body, 'project', {});

      for (const property in project) {
        project[property] = 1;
      }

      if (user) {
        let userData = await db.GetOneDocument('admins', { _id: ObjectId(user) }, project, {});
        if (userData !== null) {
          data.status = 1;
          data.response = userData;
          data.message = library.capitalize('successfully...!');
          res.send(data);
        } else {
          data.status = 0;
          data.message = 'No pending user';
          res.send(data);
        }
      } else {
        data.status = 0;
        data.message = library.capitalize('User ID Required');
        return res.send(data);
      }
    } catch (err) {
      data.status = 0;
      data.message = library.capitalize('server error');
      res.send(data);
    }
  };
  router.saveUserPhoto = async (req, res) => {
    const data = {};
    data.status = 0;
    const file_path = library.get_attachment(
      req.files.photo[0].destination,
      req.files.photo[0].filename
    );

    const id = _.get(req.body, 'id', false);
    let collection = _.get(req.body, 'collection', false);

    if (file_path) {
      const user = {};
      user.photo = file_path;
      collection = collection === 'admin' ? 'admins' : 'subadmins';

      if (id) {
        let update = await UpdateOneDocument(collection, { _id: ObjectId(id) }, user, {});

        if (!update || update.nModified == 0) {
          data.status = 0;
          data.message = library.capitalize('Updates not modified');
          res.send(data);
        } else {
          data.status = 1;
          data.message = library.capitalize('image uploaded');
          data.file_path = file_path;
          res.send(data);
        }
      } else {
        data.status = 0;
        data.message = library.capitalize('User ID required');
        res.send(data);
      }
    } else {
      data.status = 0;
      data.file_path = null;
      res.send(data);
    }
  };

  router.getDashboard = async (req, res) => {
    var data = {};

    try {
      let from_date = new Date(),
        to_date = new Date();

      from_date = new Date(new Date(from_date).setHours(0, 0, 0, 0));
      to_date = new Date(new Date(to_date).setHours(23, 59, 59, 999));

      const clientQuery = [{ $match: { status: 1 } }, { $count: 'count' }];
      const ordersQuery = [
        {
          $facet: {
            total: [{ $match: { status: 1 } }, { $count: 'total' }],
            new: [
              { $match: { status: 1 } },
              {
                $match: {
                  ordered_date: {
                    $gte: +new Date(from_date),
                    $lt: +new Date(to_date),
                  },
                },
              },
              { $count: 'new' },
            ],
          },
        },
      ];
      const shopOrdersQuery = [
        {
          $facet: {
            total: [{ $match: { status: { $gte: 1 } } }, { $count: 'total' }],
            new: [
              { $match: { status: { $gte: 1 } } },
              {
                $match: {
                  published_date: {
                    $gte: new Date(from_date),
                    $lt: new Date(to_date),
                  },
                },
              },
              { $count: 'new' },
            ],
          },
        },
      ];
      const feedbacksQuery = [
        {
          $facet: {
            open: [{ $match: { status: 1 } }, { $count: 'open' }],
            closed: [{ $match: { status: 2 } }, { $count: 'closed' }],
          },
        },
      ];

      let clients = await GetAggregation('client', clientQuery);
      let orders = await GetAggregation('orders', ordersQuery);
      let shopOrders = await GetAggregation('shop_orders', shopOrdersQuery);
      let feedbacks = await GetAggregation('feedbacks', feedbacksQuery);

      let all = await Promise.all([clients, orders, shopOrders, feedbacks]);

      let clientsData = _.get(all, '0', {}),
        ordersData = _.get(all, '1', {}),
        shopOrdersData = _.get(all, '2', {}),
        feedbacksData = _.get(all, '3', {});

      let ordersTotal = _.get(ordersData, '0.total.0.total', 0);
      let ordersNew = _.get(ordersData, '0.new.0.new', 0);

      let shopOrdersTotal = _.get(shopOrdersData, '0.total.0.total', 0);
      let shopOrdersNew = _.get(shopOrdersData, '0.new.0.new', 0);

      let feedbacksOpened = _.get(feedbacksData, '0.open.0.open', 0);
      let feedbacksClosed = _.get(feedbacksData, '0.closed.0.closed', 0);

      let clientTotal = _.get(clientsData, '0.count', 0);

      let response = {
        ordersTotal,
        ordersNew,
        clientTotal,
        shopOrdersTotal,
        shopOrdersNew,
        feedbacksOpened,
        feedbacksClosed,
      };

      return res.status(200).json({ status: 1, response });
    } catch (err) {
      console.log('err in /admin/get/dashboard -->', err);
      data.status = 0;
      data.message = library.capitalize('server error');
      res.send(data);
    }
  };

  /* Notifications */

  router.recent_notify = async (req, res) => {
    try {
      // let agency_id = _.get(req.params, 'loginId', false)
      let query = [],
        limit = _.get(req.body, 'limit', 25),
        skip = _.get(req.body, 'skip', 0),
        sort = {},
        order = _.get(req.body, 'order', false),
        field = _.get(req.body, 'field', false);

      if (order && field) {
        sort = { [field]: Number(order) };
      } else {
        sort = { createdAt: -1 };
      }
      const { loginId } = req.params;

      let count = [
        {
          $match: {
            action: {
              $in: [
                'user_register',
                'user_change_password',
                'quote_request',
                'quote_request_negotiate',
                'quote_request_accept',
                'quote_request_declined',
                'new_order',
              ],
            },
            type: { $in: ['admin'] },
            status: 1,
          },
        },
        { $count: 'all' },
      ];
      let unread_count = [
        {
          $match: {
            action: {
              $in: [
                'user_register',
                'quote_request',
                'quote_request_negotiate',
                'quote_request_accept',
                'quote_request_declined',
                'new_order',
              ],
            },
            type: { $in: ['admin'] },
            readingStatus: 0,
          },
        },
        { $count: 'unread_count' },
      ];
      query.push(
        {
          $match: {
            action: {
              $in: ['client_register'],
            },
            type: { $in: ['admin'] },
            status: 1,
          },
        },
        { $sort: sort },
        { $skip: Number(skip) },
        { $limit: Number(limit) },
        {
          $project: {
            _id: 1,
            status: 1,
            bell_status: 1,
            admin_message: 1,
            type: 1,
            action: 1,
            time_stamps: 1,
            read_by: {
              $filter: {
                input: '$read_by',
                as: 'item',
                cond: { $eq: ['$$item.readerId', loginId] },
              },
            },
          },
        }
      );
      const finalquery = [
        {
          $facet: {
            // count,
            // unread_count,
            documentdata: query,
          },
        },
      ];
      let list = await GetAggregation('notifications', finalquery);
      // let fullcount = _.get(list, "0.count.0.all", 0);
      // let unreadcount = _.get(list, "0.unread_count.0.unread_count", 0);
      let response = _.get(list, '0.documentdata', []);
      let length = response.length || 0;
      res.json({
        status: 1,
        response,
        length,
        //  fullcount,
        //    unreadcount
      });
    } catch (error) {
      console.log(`error recent_notify ${error}`);
      res.json({ status: 0, response: error });
    }
  };

  router.markasread = async (req, res) => {
    try {
      let _id = _.get(req.body, '_id', false);
      let read_by = _.get(req.body, 'read_by', []);
      if (!isObjectId(_id)) {
        return res.json({ status: 0, response: not_valid_msg('_id') });
      }
      let obj = {};
      let query = {};
      const { loginId } = req.params;

      let readData = {
        readerId: loginId,
        read_at: +new Date(),
        status: 1,
      };

      if (read_by.length > 0) {
        query['read_by._id'] = read_by[0]._id;
        obj['$set'] = {
          'read_by.$.read_at': +new Date(),
          'read_by.$.status': 0,
        };
      } else {
        obj['$push'] = { read_by: readData };
      }

      query['_id'] = ObjectId(_id);
      query['action'] = {
        $in: ['client_register'],
      };
      query['type'] = {
        $in: ['admin'],
      };

      let deleted = await UpdateOneDocument('notifications', query, obj, {});
      if (deleted && deleted.nModified !== 0) {
        io.of('/notify').emit('admin_notification', { _id: req.body._id });
        res.json({
          status: 1,
          response: 'Notifications mark as read successfully',
        });
      } else {
        res.json({ status: 0, response: 'Notifications not mark as read' });
      }
    } catch (error) {
      console.log(`error router['markasread'] ${error}`);
      res.json({ status: 0, response: error });
    }
  };
  router.updateBell = async (req, res) => {
    try {
      let _id = _.get(req.body, '_id', false);
      if (!isObjectId(_id)) {
        return res.json({ status: 0, response: not_valid_msg('_id') });
      }
      let obj = {};
      obj.bell_status = 1;
      let deleted = await UpdateOneDocument(
        'notifications',
        {
          _id: ObjectId(_id),
          type: { $in: ['admin'] },
        },
        obj,
        {}
      );
      if (deleted && deleted.nModified !== 0) {
        res.json({
          status: 1,
          response: 'updateBellsuccessfully',
        });
      } else {
        res.json({ status: 0, response: 'updateBell not mark as read' });
      }
    } catch (error) {
      console.log(`error router['updateBell'] ${error}`);
      res.json({ status: 0, response: error });
    }
  };

  router.markas_un_read = async (req, res) => {
    try {
      let _id = _.get(req.body, '_id', false),
        loginId = _.get(req.params, 'loginId', false);
      if (!isObjectId(_id)) {
        return res.json({ status: 0, response: not_valid_msg('_id') });
      }
      let obj = {};
      obj.readingStatus = 0;
      let deleted = await UpdateDoc(
        'notifications',
        {
          _id: ObjectId(_id),
          action: {
            $in: [
              'form-status',
              'application-form-submit',
              'employee_register',
              'interview_schedule',
              'todo_assigned',
              'employee_upgraded',
              'referee_form_completed',
            ],
          },
          type: { $in: ['agency', 'recruitment'] },
          $or: [{ agency: ObjectId(loginId) }, { added_by: ObjectId(loginId) }],
        },
        obj,
        {}
      );
      if (deleted && deleted.nModified !== 0) {
        io.of('/notify').emit('web_notification', { _id: loginId });
        res.json({
          status: 1,
          response: 'Notifications mark as unread successfully',
        });
      } else {
        res.json({ status: 0, response: 'Notifications not mark as unread' });
      }
    } catch (error) {
      console.log(`error router['markas_un_read'] ${error}`);
      res.json({ status: 0, response: error });
    }
  };

  router.markallasread = async (req, res) => {
    try {
      // let loginId = _.get(req.params, "loginId", false);

      let obj = {};
      obj.readingStatus = 1;
      let deleted = await UpdateManyDocument(
        'notifications',
        {
          action: {
            $in: [
              'user_register',
              'quote_request',
              'quote_request_negotiate',
              'quote_request_accept',
              'quote_request_declined',
              'new_order',
            ],
          },
          type: { $in: ['admin'] },
        },
        obj,
        { multi: true }
      );
      if (deleted && deleted.nModified !== 0) {
        io.of('/notify').emit('web_notification', { type: 'admin' });
        res.json({
          status: 1,
          response: 'Notifications mark as read successfully',
        });
      } else {
        res.json({ status: 0, response: 'Notifications not mark as read' });
      }
    } catch (error) {
      console.log(`error router['markasread'] ${error}`);
      res.json({ status: 0, response: error });
    }
  };

  return router;
};
