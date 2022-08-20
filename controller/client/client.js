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

let Send = require('../../model/mail.js');
const moment = require('moment');

let { ObjectId, isObjectId, required_msg, not_valid_msg } = require('../../model/common');
const {
  GetOneDocument,
  UpdateOneDocument,
  GetAggregation,
  InsertDocument,
  GetDocument,
  DeleteOneDocument
} = require('../../controller/db_adaptor/mongodb.js');

const { promisify } = require('util');
const { client } = require('../../model/mongodb.js');
const { template } = require('lodash');
const { send } = require('../../model/mail.js');
const unlinkAsync = promisify(fs.unlink);

const pdfoptions = {
  format: 'A4',
  orientation: 'portrait',
  border: { top: '2px', right: '0.1px', bottom: '2px', left: '0.1px' },
};

module.exports = (app, io) => {

  // const push_notification = require('../../model/push_notification.js')(io);

  var router = {};


  router.login = async (req, res) => {
    var data = {};
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ status: 0, errors: errors.errors[0].msg });
    }
    try {
      let user = await GetOneDocument(
        'client',
        {
          status: 1,
          email: req.body.email,
        },
        {},
        {}
      );
      if (user !== undefined && user !== null) {
        library.validPassword(req.body.password, user.password, (error, isValidPassword) => {
          if (isValidPassword) {
            library.jwtSign(
              {
                _id: user._id,
              },
              (error, authToken) => {
                if (error) {
                  data.response = 'Invalid Credentials';
                  res.json(data);
                } else {
                  // Check profile completion
                  // let completedPercentage = 100;

                  // if (_.isEmpty(user.photo)) {
                  //   completedPercentage = completedPercentage - 10;
                  // }

                  // if (_.isEmpty(user.office_phone)) {
                  //   completedPercentage = completedPercentage - 10;
                  // }

                  // if (user.address) {
                  //   // Address each field containes 5 percentage
                  //   const reqAddressFields = ['line1', 'state', 'city', 'postal_code'];

                  //   reqAddressFields.forEach((field) => {
                  //     if (_.isEmpty(user.address[field]))
                  //       completedPercentage = completedPercentage - 5;
                  //   });
                  // }

                  // if (completedPercentage < 100) {
                  //   // TODO: Need to implement socket connection for intimate the client to fulfill their profile
                  //   // Send notification to the client to fulfill the required details
                  // }

                  data.status = 1;
                  data.response = {
                    authToken: authToken,
                    // profileCompleted: completedPercentage,
                    message: 'Login Successfully',
                  };
                  res.json(data);
                }
              }
            );
          } else {
            data.status = 0;
            data.message = 'Invalid Password';
            res.json(data);
          }
        });
      } else {
        Status = 0;
        message = 'User Not Found';
        res.json(data);
      }
    } catch (err) {
      data.status = 0;
      data.message = library.capitalize('server error');
      data.error = err;
      res.json(data);
    }
  };


  // router.AddCart = async (req,res) => {

  //   const email = _.get(req.body,'email')
  //   const photo = _.get(req.body,'photo')
  //   const catagroy = _.get(req.body, 'catagroy', '');
  //   const name = _.get(req.body, 'name', '');
  //   const prize = _.get(req.body, 'prize', '');
  //   const offerprize = _.get(req.body, 'offerprize', '')
  //   const productId = _.get(req.body,'productId','');
  //   const discount = _.get(req.body,'discount','');

  //   const insert = {
  //     catagroy,
  //     email,
  //     name,
  //     prize,
  //     offerprize,
  //     photo,
  //     discount,
  //     productId
  //   }

  //   const newProduct = InsertDocument("cart", {},{},{}).then((newProduct) => {
  //     res.json({
  //       Status: 1,
  //       message: "Product created Successfully!!!"
  //     })
  //   }).catch((err) => {
  //     console.log(err)
  //   })
  // }

  router.loginAsClient = async (req, res) => {
    var data = {};
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ status: 0, errors: errors.errors[0].msg });
    }
    try {
      let user = await GetOneDocument(
        'client',
        {
          _id: ObjectId(req.body._id),
        },
        {},
        {}
      );
      if (user !== undefined && user !== null) {
        library.jwtSign(
          {
            _id: user._id,
          },
          (error, authToken) => {
            if (error) {
              data.response = 'Invalid Credentials';
              res.json(data);
            } else {
              data.status = 1;
              data.response = {
                authToken: authToken,
                message: 'Login Successfully',
              };
              res.json(data);
            }
          }
        );
      } else {
        data.response = 'User Not Found';
        res.json(data);
      }
    } catch (err) {
      data.status = 0;
      console.log('err in  /client/auth/login -->', err);
      data.message = library.capitalize('server error');
      data.error = err;
      res.json(data);
    }
  };

  router.registration = async (req, res) => {
    const data = {};
    data.status = 0;

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ status: 0, errors: errors.errors[0].msg });
    } 

    let getUserEmail = await GetDocument('client', { email: req.body.email }, {}, {});
    // let getAdmin = await GetOneDocument('admins', { role: 'admin' }, {}, {});
    if (getUserEmail.length > 0) {
      return res.json({ status: 0, response: 'Email already exists' });
    }

    const first_name = _.get(req.body, 'first_name', '');
    const surname = _.get(req.body, 'surname', '');
    const email = _.get(req.body, 'email', '');
    const agree_terms = _.get(req.body, 'agree_terms', false);

    let userID = 'CAM' + Math.floor(1000 + Math.random() * 9000);

    const user = {
      first_name,
      surname,
      email,
      userID,
      agree_terms,
      phone: req.body.phone,
      dob: '',
      photo: '',
      registered_date: new Date(),
      billing_address: [],
      shipping_address: [],
      address: {
        line1: '',
        line2: '',
        state: '',
        city: '',
        province: '',
        zip: '',
        postal_code: '',
        formatted_address: '',
        lat: '',
        lng: '',
      },
      activity: {
        signup: +new Date(),
        signin: 0,
        signout: 0,
      },
    };

    if (req.body.password && req.body.confirmPassword) {
      user.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
    }

    let insert = await InsertDocument('client', user);

    if (insert && insert._id) {
      //   const messageUser = `You have successfully signed up to Kingdom Granites`;
      // const messageAdmin = `New user ${insert.first_name} ${insert.surname} signed up`;
      // const sender = insert._id;
      // const receiver = getAdmin._id;

      // await push_notification.addnotification(
      //   sender,
      //   receiver,
      //   messageAdmin,
      //   'client_register',
      //   'admin'
      // );

      //   await push_notification.addnotification(
      //     getAdmin._id,
      //     messageUser,
      //     "user_register",
      //     options,
      //     "user"
      //   );
      
      res.json({ status: 1, response: 'User Created' });
    } else {
      res.json({ status: 0, response: 'Failed to create user' });
    }
  };


  router.Adduser = async (req, res) => {
    const data = {};
    data.status = 0;

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ status: 0, errors: errors.errors[0].msg });
    } 

    let getUserEmail = await GetDocument('client', { email: req.body.email }, {}, {});
    // let getAdmin = await GetOneDocument('admins', { role: 'admin' }, {}, {});
    if (getUserEmail.length > 0) {
      return res.json({ status: 0, response: 'Email already exists' });
    }

    const first_name = _.get(req.body, 'first_name', '');
    const surname = _.get(req.body, 'surname', '');
    const email = _.get(req.body, 'email', '');
    const agree_terms = _.get(req.body, 'agree_terms', false);

    let userID = 'CAM' + Math.floor(1000 + Math.random() * 9000);

    const user = {
      first_name,
      surname,
      email,
      userID,
      agree_terms,
      phone: req.body.phone,
      dob: '',
      photo: '',
      registered_date: new Date(),
      billing_address: [],
      shipping_address: [],
      address: {
        line1: '',
        line2: '',
        state: '',
        city: '',
        province: '',
        zip: '',
        postal_code: '',
        formatted_address: '',
        lat: '',
        lng: '',
      },
      activity: {
        signup: +new Date(),
        signin: 0,
        signout: 0,
      },
    };

    if (req.body.password && req.body.confirmPassword) {
      user.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
    }

    let insert = await InsertDocument('client', user);

    if (insert && insert._id) {
      //   const messageUser = `You have successfully signed up to Kingdom Granites`;
      // const messageAdmin = `New user ${insert.first_name} ${insert.surname} signed up`;
      // const sender = insert._id;
      // const receiver = getAdmin._id;

      // await push_notification.addnotification(
      //   sender,
      //   receiver,
      //   messageAdmin,
      //   'client_register',
      //   'admin'
      // );

      //   await push_notification.addnotification(
      //     getAdmin._id,
      //     messageUser,
      //     "user_register",
      //     options,
      //     "user"
      //   );
      
      res.json({ status: 1, response: 'User Created' });
    } else {
      res.json({ status: 0, response: 'Failed to create user' });
    }
  };

  router.getData = async (req,res) => {
    const email = _.get(req.body, 'email')
    const result = await client.find({email : email })
    res.json(result);
}

router.getData1 = async (req,res) => {
  const result = await client.find();
  res.json(result);
}

router.UpdateUser = async (req,res) => {
  try{

    const first_name = _.get(req.body,'first_name','');
    const surname = _.get(req.body,'surname','');
    const email = _.get(req.body,'email','');
    const gender = _.get(req.body,'gender','');

    await UpdateOneDocument('client',{_id : req.params.id},{
      $set : {
        first_name,
        surname,
        email,
        gender,
      }
    }).then(() => {
      res.json({
        status : 1,
        message : "Successfully Updated"
      })
    }).catch((err) => {
      res.json({
        status : 0,
        message : "Wrong"
      })
    })

  }catch{
    res.json({
      status : 0,
      message : "Server Error",
    })
  }
}


router.UserDelete = async (req, res) => {

  try {
    await DeleteOneDocument('client', { _id: req.params.id }, {}, {});
    res.status(200).json({
      status: 1,
      message: "Product has been deleted."
    });
  } catch (err) {
    console.log(err);
  }

}


  router.forgotPassword = async (req, res) => {
    var data = {};
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.errors[0].msg });
    }
    try {
      // let settings = await db.GetOneDocument('settings', { alias: 'general' }, {}, {});
      if (errors.isEmpty()) {
        let user = await db.GetOneDocument('client', { email: req.body.email }, {}, {});
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
            obj.otp = Math.floor(100000 + Math.random() * 900000); /* 6 digits */
            obj.otp_timestamp = Date.now() + 360000;
            obj.otp_verified = 0;
            obj.passwordResetUID = '';
            var params = {};
            params['$set'] = obj;
            let update = await db.UpdateManyDocument('client', query, params, {});
            if (!update || update.nModified == 0) {
              data.status = 0;
              data.message = library.capitalize('update error');
              res.json(data);
            } else {
              // const template = await GetOneDocument(
              //   'emailtemplate',
              //   { slug: 'client-request-otp' },
              //   {},
              //   {}
              // );

              const text = `Hello , You are receiving this email because we received a password reset request from your account
              OTP : ${obj.otp}`;
              console.log(text);

              Send(user.email , "Otp" , text)


              // const email = _.get(req.body,'email')
              // const template = await client.findOne({email : email})

              // console.log(template)


              // if (template === user.email) {


                // var mailOptions = {
                //   // from: 'care agency media' + ' <' + 'hello@careagencymedia.co.uk' + '>',
                //   from : "praveenstark77@gmail.com",
                //   to: user.email,
                //   subject: 'OTP request from Care Agency Media',
                //   text: text,
                // };

                // mail.send(mailOptions, function (err, response, mode) {})
                //  mail.send(mailOptions);
              // } else {
                // let { html, subject } = mail.replaceSubAndFooterVars({
                //   templateData: template,
                //   clientData: user,
                //   // settingsData: settings,
                //   defaultSubject: `OTP request from Care Agency Media`,
                // });

                // subject = subject.replace(/{request.otp}/g, obj.otp);
                // html = html.replace(/{request.otp}/g, obj.otp);

                // const mailOptions = {
                //   from: `Care Agency Media  <${settings.email}>`,
                //   to: user.email,
                //   subject,
                //   html,
                // };

                // mail.send(mailOptions, function (err, response, mode) {});

              //   res.json("invalid email")
              // }

              // mailcontent.sendmail(mailData, function (err, response) {});

              
              data.status = 1;
              data.message = 'Link Sent to mail Successfully!';
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
      let passwordResetUID = _.get(req.body, 'passwordResetUID', '');

      // If passwordResetUID is present no need to check the email
      if (!passwordResetUID && !email) {
        return res.json({ status: 0, response: 'email is required' });
      }
      if (!OTP) {
        return res.json({
          status: 0,
          response: 'Verification code is required',
        });
      }

      let query = {};
      if (passwordResetUID) {
        query = { passwordResetUID };
      } else {
        query = { email };
      }

      let getUser = await GetOneDocument('client', query, {}, {});
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

              // If passwordResetUID present reset it to empty string
              if (passwordResetUID) obj.passwordResetUID = '';

              let update = await UpdateOneDocument(
                'client',
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

  router.checkClientPasswordResetUID = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ status: 0, message: errors.errors[0].msg });
    }

    try {
      const client = await GetOneDocument(
        'client',
        {
          status: 1,
          passwordResetUID: req.body.passwordResetUID,
        },
        {},
        {}
      );

      if (_.isEmpty(client) || _.isEmpty(client._id)) {
        return res.json({
          status: 0,
          message: 'Client not found with passwordResetUID',
        });
      }

      // Check timestamp
      const timestamp = Date.now();
      if (Number(timestamp) < Number(client.otp_timestamp)) {
        res.json({
          status: 1,
          message: 'Client found',
          response: client,
        });
      } else {
        res.json({
          status: 0,
          message: 'Client not found with passwordResetUID',
        });
      }
    } catch (err) {
      console.log('Error in client/client/checkClientPasswordResetUID ---------->>>', err);
      res.json({
        status: 0,
        message: 'Server error',
      });
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
      let getUser = await GetOneDocument('client', query, {}, {});
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
        let update = await UpdateOneDocument('client', { _id: ObjectId(getUser._id) }, obj, {});
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


  router.getDashboard = async (req, res) => {
    var data = {};

    try {
      let { loginId = '' } = req.params;

      if (!isObjectId(loginId)) {
        return res.status(400).json({ status: 0, response: 'Unauthorized Access' });
      }

      const packageQuery = [
        { $match: { client: ObjectId(loginId), status: 2 } },
        { $count: 'count' },
      ];
      const trainingQuery = [
        {
          $facet: {
            purchased: [
              { $match: { client: ObjectId(loginId), status: 2 } },
              { $count: 'purchased' },
            ],
            completed: [
              { $match: { client: ObjectId(loginId), status: { $in: [3] } } },
              { $count: 'completed' },
            ],
          },
        },
      ];

      let trainings = await GetAggregation('clientTrainings', trainingQuery);
      let packages = await GetAggregation('clientPackages', packageQuery);

      let all = await Promise.all([trainings, packages]);

      let training = _.get(all, '0', {}),
        package = _.get(all, '1', {});

      response = {
        training: training.length > 0 ? training : [],
        package: package.length > 0 ? package : [],
      };

      return res.status(200).json({ status: 1, response });
    } catch (err) {
      console.log('err in /client/get/dashboard -->', err);
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
      if (user) {
        let userData = await GetOneDocument(
          'client',
          { _id: ObjectId(user) },
          {
            password: 0,
          },
          { populate: ['apps'] }
        );
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

  router.updateUserInformation = async (req, res) => {
    var data = {};
    data.status = 0;

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.errors[0].msg });
    }

    try {
      const { name, loginId } = req.params;
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

        let check_email = await GetDocument(
          'client',
          { _id: { $ne: ObjectId(loginId) }, email: email },
          {},
          {}
        );
        if (check_email && Array.isArray(check_email) && check_email.length > 0) {
          return res.json({ status: 0, response: 'Email already exists' });
        }

        user.first_name = first_name;
        user.surname = surname;
        user.email = email;
        user.phone = phone;
      }

      if (name === 'business_profile') {
        const { company_logo = '', company_details, office_phone, company_name } = req.body;
        user.office_phone = office_phone;
        user.company_logo = company_logo;
        user.company_details = company_details;
        user.company_name = company_name;
      }

      if (name === 'address') {
        const address = _.get(req.body, 'address', '');
        user.address = address;
      }

      if (name === 'password') {
        const password = _.get(req.body, 'password', '');
        const new_password = _.get(req.body, 'new_password', '');

        let userData = await GetOneDocument(
          'client',
          {
            status: 1,
            _id: loginId,
          },
          { password: 1 },
          {}
        );
        library.validPassword(password, userData.password, async (error, isValidPassword) => {
          if (isValidPassword) {
            data.status = 1;
            user.password = bcrypt.hashSync(new_password, bcrypt.genSaltSync(8), null);
            let update = await UpdateOneDocument('client', { _id: ObjectId(loginId) }, user, {});
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
            data.status = 0;
            data.response = 'Your old password is incorrect';
            return res.json(data);
          }
        });
      }

      if (name !== 'password') {
        let update = await UpdateOneDocument('client', { _id: ObjectId(req.body.id) }, user, {});
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
      console.log('savePersonalInformation err', err);
      data.status = 0;
      data.message = library.capitalize('server error');
      res.send(data);
    }
  };
  router.getAddressInformation = async (req, res) => {
    var data = {};
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.errors[0].msg });
    }

    try {
      let user = _.get(req.body, 'user', false);
      if (user) {
        let userData = await GetOneDocument(
          'client',
          { _id: ObjectId(user) },
          { billing_address: 1, shipping_address: 1 },
          {}
        );
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
  router.saveAddressInformation = async (req, res) => {
    var data = {};
    data.status = 0;

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.errors[0].msg });
    }

    try {
      const id = _.get(req.body, 'id', false);
      const type = _.get(req.body, 'type', '');
      const address = _.get(req.body, 'address', '');
      const billingID = _.get(req.body, 'billingID', false);
      const shippingID = _.get(req.body, 'shippingID', false);

      const user = {};
      const query = {};

      if (type === 'billing') {
        if (billingID) {
          query['billing_address._id'] = billingID;
          user['$set'] = {
            'billing_address.$.name': address.name,
            'billing_address.$.phone': address.phone,
            'billing_address.$.email': address.email,
            'billing_address.$.line1': address.line1,
            'billing_address.$.line2': address.line2,
            'billing_address.$.state': address.state,
            'billing_address.$.city': address.city,
            'billing_address.$.country': address.country,
            'billing_address.$.postal_code': address.postal_code,
            'billing_address.$.formatted_address': address.formatted_address,
            'billing_address.$.lat': address.lat,
            'billing_address.$.lng': address.lng,
          };
        } else {
          user['$push'] = { billing_address: address };
        }
      }
      if (type === 'shipping') {
        if (shippingID) {
          query['shipping_address._id'] = shippingID;
          user['$set'] = {
            'shipping_address.$.name': address.name,
            'shipping_address.$.phone': address.phone,
            'shipping_address.$.email': address.email,
            'shipping_address.$.line1': address.line1,
            'shipping_address.$.line2': address.line2,
            'shipping_address.$.state': address.state,
            'shipping_address.$.city': address.city,
            'shipping_address.$.country': address.country,
            'shipping_address.$.postal_code': address.postal_code,
            'shipping_address.$.formatted_address': address.formatted_address,
            'shipping_address.$.lat': address.lat,
            'shipping_address.$.lng': address.lng,
          };
        } else {
          user['$push'] = { shipping_address: address };
        }
      }

      if (id) {
        query['_id'] = ObjectId(req.body.id);
        let update = await UpdateOneDocument('client', query, user, {});

        if (!update || update.nModified == 0) {
          data.status = 0;
          data.message = library.capitalize('Not modified');
          res.send(data);
        } else {
          data.status = 1;
          data.message = library.capitalize('Application applied successfully');
          res.send(data);
        }
      } else {
        data.status = 0;
        data.message = library.capitalize('User ID required');
        res.send(data);
      }
    } catch (err) {
      console.log('saveAddressInformation err', err);
      data.status = 0;
      data.message = library.capitalize('server error');
      res.send(data);
    }
  };
  router.removeAddress = (req, res) => {
    const data = {};
    data.status = 0;

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.errors[0].msg, status: 0 });
    }

    const id = _.get(req.body, 'id', false);
    const type = _.get(req.body, 'type', false);
    const addressID = _.get(req.body, 'addressID', false);

    if (addressID && isObjectId(addressID)) {
      const user = {};

      if (type === 'billing') {
        user['$pull'] = {
          billing_address: { _id: ObjectId(req.body.addressID) },
        };
      }
      if (type === 'shipping') {
        user['$pull'] = {
          shipping_address: { _id: ObjectId(req.body.addressID) },
        };
      }

      const update = UpdateOneDocument('client', { _id: ObjectId(id) }, user, {});

      if (!update) {
        data.status = 0;
        data.response = 'Unable to delete your file';
        res.send(data);
      } else {
        data.status = 1;
        data.response = type + ' address Deleted';
        res.send(data);
      }
    } else {
      return res.json({ response: 'Address ID required', status: 0 });
    }
  };
  router.selectAddress = (req, res) => {
    const data = {};
    data.status = 0;

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.errors[0].msg, status: 0 });
    }

    const id = _.get(req.body, 'id', false);
    const type = _.get(req.body, 'type', false);
    const addressID = _.get(req.body, 'addressID', false);
    const status = _.get(req.body, 'status', 1);

    if (addressID && isObjectId(addressID)) {
      const user = {};
      const query = {
        _id: ObjectId(id),
      };

      if (type === 'billing') {
        if (status === 1) {
          user['$set'] = {
            'billing_address.$.status': 2,
          };
          query.billing_address = {
            $elemMatch: {
              _id: ObjectId(addressID),
            },
          };
        }
        if (status === 2) {
          user['$set'] = {
            'billing_address.$.status': 1,
          };
          query.billing_address = {
            $elemMatch: {
              _id: ObjectId(addressID),
            },
          };
        }
      }
      if (type === 'shipping') {
        if (status === 1) {
          user['$set'] = {
            'shipping_address.$.status': 2,
          };
          query.shipping_address = {
            $elemMatch: {
              _id: ObjectId(addressID),
            },
          };
        }
        if (status === 2) {
          user['$set'] = {
            'shipping_address.$.status': 1,
          };
          query.shipping_address = {
            $elemMatch: {
              _id: ObjectId(addressID),
            },
          };
        }
      }

      const update = UpdateOneDocument('client', query, user, {});

      if (!update) {
        data.status = 0;
        data.response = 'Unable to delete your file';
        res.send(data);
      } else {
        data.status = 1;
        data.response = type + ' address Deleted';
        res.send(data);
      }
    } else {
      return res.json({ response: 'Address ID required', status: 0 });
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

    if (file_path) {
      const user = {};
      user.photo = file_path;

      if (id) {
        let update = await UpdateOneDocument('client', { _id: ObjectId(id) }, user, {});

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

  router.removeUserPhoto = async (req, res) => {
    var data = {};
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.errors[0].msg });
    }

    try {
      let photo = _.get(req.body, 'photo', false);

      if (photo !== '' || photo !== null) {
        let update = await UpdateOneDocument(
          'client',
          { _id: ObjectId(req.body.id) },
          { photo: '' },
          {}
        );
        unlinkAsync(photo)
          .then((resolved) => {
            data.status = 1;
            data.response = resolved;
            data.message = library.capitalize('User photo removed');
            res.send(data);
          })
          .catch((error) => {
            console.log('error', error);
            data.status = 0;
            data.message = error;
            res.send(data);
          });
      } else {
        data.status = 0;
        data.message = library.capitalize('No Photo Directory');
        return res.send(data);
      }
    } catch (err) {
      data.status = 0;
      data.message = library.capitalize('server error');
      res.send(data);
    }
  };

  router.saveUserCompanyLogoPhoto = async (req, res) => {
    const data = {};
    data.status = 0;
    const file_path = library.get_attachment(
      req.files.photo[0].destination,
      req.files.photo[0].filename
    );
    const id = _.get(req.body, 'id', false);

    if (file_path) {
      const user = {};
      user.company_logo = file_path;

      if (id) {
        let update = await UpdateOneDocument('client', { _id: ObjectId(id) }, user, {});

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

  router.removeUserCompanyLogoPhoto = async (req, res) => {
    var data = {};
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.errors[0].msg });
    }

    try {
      let company_logo = _.get(req.body, 'company_logo', false);

      if (company_logo !== '' || company_logo !== null) {
        let update = await UpdateOneDocument(
          'client',
          { _id: ObjectId(req.body.id) },
          { company_logo: '' },
          {}
        );
        unlinkAsync(company_logo)
          .then((resolved) => {
            data.status = 1;
            data.response = resolved;
            data.message = library.capitalize('User company logo removed');
            res.send(data);
          })
          .catch((error) => {
            console.log('error', error);
            data.status = 0;
            data.message = error;
            res.send(data);
          });
      } else {
        data.status = 0;
        data.message = library.capitalize('No company logo Directory');
        return res.send(data);
      }
    } catch (err) {
      data.status = 0;
      data.message = library.capitalize('server error');
      res.send(data);
    }
  };

  router.getSettings = async (req, res) => {
    var data = {};
    try {
      const alias = _.get(req.body, 'alias', false);
      let project = {};
      if (alias) {
        if (alias === 'payment_gateway') {
          project = {
            'settings.stripe.mode': 1,
          };
        }
        if (alias === 'general') {
          project = {
            vat: 1,
            package_prefix: 1,
            shop_prefix: 1,
            training_prefix: 1,
          };
        }
        if (alias === 'support') {
          project = {
            _id: 0,
            support_phone: 1,
            support_mail: 1,
            workingDays: 1,
            workingDaysWeekends: 1,
          };
        }
        if (alias === 'contact') {
          project = {
            _id: 0,
            contacts: 1,
          };
        }
        let settings = await GetOneDocument('settings', { alias: alias }, project, {});
        if (settings) {
          data.status = 1;
          data.settings = settings;
          data.message = library.capitalize('successfully...!');
          res.send(data);
        } else {
          data.status = 0;
          data.message = library.capitalize('admin need to configure the settings...!');
          res.send(data);
        }
      } else {
        data.status = 0;
        data.message = library.capitalize('Alias required');
        res.send(data);
      }
    } catch (err) {
      data.status = 0;
      data.message = library.capitalize('server error');
      res.send(data);
    }
  };

  /* Feedbacks */

  router.add = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ status: 0, message: errors.errors[0].msg });
    }

    try {
      const { loginId: userId } = req.params;
      const { name, feedback, comment, rating = 3, member } = req.body;

      if (!userId) {
        return res.json({ status: 0, response: 'User ID is required' });
      }

      const feedbackReqBody = {
        client: userId,
        name,
        feedback,
        comment,
        rating,
        published_date: +new Date(),
      };

      if (member) feedbackReqBody.member = member;

      const insert = await InsertDocument('feedbacks', feedbackReqBody);

      if (_.isEmpty(insert)) {
        return res.json({ status: 0, message: 'Feedback not added' });
      }

      res.json({ status: 1, message: 'Feedback added successfully' });
    } catch (err) {
      console.log('Error in /admin/feedback/add', err);
      res.send({ status: 0, message: 'Server error' });
    }
  };

  router.list = async (req, res) => {
    try {
      let skip = _.get(req.body, 'skip', 0),
        limit = _.get(req.body, 'limit', 25),
        sort = {};
      let search = _.get(req.body, 'search', false),
        field = _.get(req.body, 'field', false),
        order = _.get(req.body, 'order', false),
        status = _.get(req.body, 'status', false);

      const userID = _.get(req.params, 'loginId', false);

      if (!userID) {
        return res.json({
          status: 0,
          response: {
            result: [],
            fullcount: fullcount,
            length: data.length,
            message: 'User ID required',
          },
        });
      }
      if (field && order) {
        sort[field] = parseInt(order);
      } else {
        sort = { createdAt: -1 };
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
        });
      }

      query.push({ $match: { client: ObjectId(userID) } });

      if (status) {
        query.push({ $match: { status: { $in: [status] } } });
      } else {
        query.push({ $match: { status: { $in: [1, 2] } } });
      }

      const withoutlimit = Object.assign([], query);
      withoutlimit.push({ $count: 'count' });

      query.push(
        { $match: { status: { $ne: 0 } } },
        { $sort: sort },
        { $skip: parseInt(skip) },
        { $limit: parseInt(limit) },
        {
          $project: {
            name: 1,
            feedback: 1,
            comment: 1,
            status: 1,
            rating: 1,
            published_date: 1,
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
      const getUser = await GetAggregation('feedbacks', finalquery); 
      let data = _.get(getUser, '0.documentdata', []);
      let fullcount = _.get(getUser, '0.overall.0.count', 0);
      if (data && data.length > 0) {
        res.json({
          status: 1,
          response: {
            result: data,
            fullcount: fullcount,
            length: data.length,
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

  // Send Email
  router.sendFeedbackEmailToMember = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ status: 0, message: errors.errors[0].msg });
    }
    const { loginData } = req.params;
    const { comment, rating, memberId } = req.body;

    try {
      const settings = await GetOneDocument('settings', { alias: 'general' }, {}, {});

      // If settings is not configured exit immediately.
      if (_.isEmpty(settings)) {
        return res.json({
          status: 0,
          message: 'Admin need to configure the settings!',
        });
      }

      const assigneeDetails = await GetOneDocument(
        'subadmins',
        { _id: ObjectId(memberId) },
        { email: 1 },
        {}
      );

      // If assigneeDetails is not exists exit immediately.
      if (_.isEmpty(assigneeDetails)) {
        return res.json({
          status: 0,
          message: 'Assignee not found',
        });
      }

      const companyName = _.isEmpty(loginData.company_name)
        ? `${loginData.first_name} ${loginData.surname}`
        : loginData.company_name;

      // TODO: Need to configure template for this email
      const mailText = `Feedback \n\n ${comment} \n\n Rating - ${rating}`;

      const mailOptions = {
        from: `Care Agency Media <${settings.email}>`,
        to: assigneeDetails.email,
        subject: `Received feedback from ${companyName}`,
        text: mailText,
        // TODO need to send with html template when the template is configure in settings
        // html: html
      };

      mail.send(mailOptions, function (err, response, mode) {
        if (err) {
          return res.json({
            status: 0,
            message: 'Unable to send email',
            error: err,
          });
        }

        res.json({
          status: 1,
          message: 'Feedback sent successfully to the assignee.',
        });
      });
    } catch (error) {
      console.log('Error occured in client/client/sendFeedbackEmailToMember', error);
      res.json({
        status: 0,
        message: 'Server Error',
      });
    }
  };

  router.faqList = async (req, res) => {
    try {
      let skip = _.get(req.body, 'skip', 0),
        limit = _.get(req.body, 'limit', 25),
        sort = {};
      let search = _.get(req.body, 'search', false),
        field = _.get(req.body, 'field', false),
        status = _.get(req.body, 'status', false),
        order = _.get(req.body, 'order', false);
      if (field && order) {
        sort[field] = parseInt(order);
      } else {
        sort = { createdAt: -1 };
      }
      let query = [];

      if (status) {
        query.push({ $match: { status: { $in: [status] } } });
      } else {
        query.push({ $match: { status: { $in: [1, 2] } } });
      }

      const withoutlimit = Object.assign([], query);
      withoutlimit.push({ $count: 'count' });

      query.push(
        { $match: { status: { $ne: 0 } } },
        {
          $project: {
            question: 1,
            answers: 1,
            status: 1,
            published_date: 1,
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

      const getUser = await GetAggregation('faq', finalquery);
      let data = _.get(getUser, '0.documentdata', []);
      let fullcount = _.get(getUser, '0.overall.0.count', 0);
      if (data && data.length > 0) {
        res.json({
          status: 1,
          response: {
            result: data,
            fullcount: fullcount,
            length: data.length,
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
};
