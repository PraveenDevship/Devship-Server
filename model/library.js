'use strict';

const db = require('../controller/db_adaptor/mongodb.js');
var each = require('sync-each');
var mongoose = require('mongoose');
const fs = require('fs');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const CONFIG = require('../config/config');

var capitalize = (value) => {
  if (value) {
    var char = value.charAt(0).toUpperCase();
    var spl = value.slice(1).toLowerCase();
    var caps = char + spl;
    return caps;
  } else {
    return '';
  }
};

var capitalizeAll = (value) => {
  if (value) {
    value = value.toString();
    value = value.trim();
    var valuearray = value.split(' ');
    var caps = '';
    valuearray.map((key, index) => {
      var char = key.charAt(0).toUpperCase();
      var spl = key.slice(1);
      if (index == valuearray.length - 1) {
        caps = `${caps}${char}${spl}`;
      } else {
        caps = `${caps}${char}${spl} `;
      }
    });
    var capsarray = caps.split('-');
    var final = '';
    capsarray.map((key, index) => {
      var char = key.charAt(0).toUpperCase();
      var spl = key.slice(1);
      if (index == capsarray.length - 1) {
        final = `${final}${char}${spl}`;
      } else {
        final = `${final}${char}${spl}-`;
      }
    });
    return final;
  } else {
    return '';
  }
};

var capitalizeFirst = (value) => {
  if (value) {
    value = value.toString();
    value = value.trim();
    var char = value.charAt(0).toUpperCase();
    var spl = value.slice(1);
    return `${char}${spl}`;
  } else {
    return '';
  }
};

var trimspace = (value) => {
  if (value) {
    value = value.toString();
    value = value.trim();
    value = value.replace(/  +/g, ' ');
    return value;
  } else {
    return '';
  }
};

var get_attachment = (path, name) => {
  return encodeURI(path.substring(2) + name);
};

var randomString = (length, chars) => {
  var mask = '';
  if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
  if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (chars.indexOf('#') > -1) mask += '0123456789';
  if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
  var result = '';
  for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
  return result;
};

var recordUpdatedby = async (adminId, recordId, collection, type) => {
  try {
    var admin = await db.GetOneDocument('admins', { _id: adminId }, { employeeId: 1 }, {});
    if (admin && typeof admin.employeeId != 'undefined') {
      var query = { _id: { $in: recordId } };
      var update_data = {};
      update_data.updated_activity = {};
      update_data.updated_activity.adminId = admin._id;
      update_data.updated_activity.employeeId = admin.employeeId;
      update_data.updated_activity.time = Date.now();
      if (type == 2) {
        var params = {};
        params['$set'] = update_data;
        let update = await db.UpdateManyDocument(collection, query, params, {});
        if (!update || update.nModified == 0) {
          return '';
        } else {
          return 'success';
        }
      } else if (type == 1) {
        update_data.created_activity = {};
        update_data.created_activity.adminId = admin._id;
        update_data.created_activity.employeeId = admin.employeeId;
        update_data.created_activity.time = Date.now();
        var params = {};
        params['$set'] = update_data;
        let update = await db.UpdateManyDocument(collection, query, params, {});
        if (!update || update.nModified == 0) {
          return '';
        } else {
          return 'success';
        }
      } else if (type == 3) {
        update_data = {};
        update_data.trail_activity = {};
        update_data.trail_activity.adminId = admin._id;
        update_data.trail_activity.employeeId = admin.employeeId;
        update_data.trail_activity.time = Date.now();
        var params = {};
        params['$set'] = update_data;
        let update = await db.UpdateManyDocument(collection, query, params, {});
        if (!update || update.nModified == 0) {
          return '';
        } else {
          return 'success';
        }
      } else {
        return '';
      }
    } else {
      return '';
    }
  } catch (err) {
    return '';
  }
};

var employeeUpdatedby = async (adminId, recordId, collection, type, reason) => {
  try {
    var admin = await db.GetOneDocument('admins', { _id: adminId }, { employeeId: 1 }, {});
    if (admin && typeof admin.employeeId != 'undefined') {
      var query = { _id: { $in: recordId } };
      var update_data = {};
      update_data.updated_activity = {};
      update_data.updated_activity.adminId = admin._id;
      update_data.updated_activity.employeeId = admin.employeeId;
      update_data.updated_activity.time = Date.now();
      if ((type == 0 || type == 1) && recordId.length > 0) {
        var params = {};
        params['$set'] = update_data;
        let update = await db.UpdateManyDocument(collection, query, params, {});
        if (!update || update.nModified == 0) {
          return '';
        } else {
          each(
            recordId,
            async (id, next) => {
              let emploee_exists = await db.GetOneDocument(
                'admins',
                { _id: new mongoose.Types.ObjectId(id) },
                { employeeId: 1 },
                {}
              );
              if (emploee_exists && typeof emploee_exists.employeeId != 'undefined') {
                let emphistry = await db.GetOneDocument(
                  'emp_history',
                  { _id: new mongoose.Types.ObjectId(id) },
                  { employeeId: 1 },
                  {}
                );
                if (emphistry && typeof emphistry.employeeId != 'undefined') {
                  var data = {};
                  data.action = type;
                  data.done_by = admin._id;
                  data.done_employeeId = admin.employeeId;
                  data.time = Date.now();
                  data.reason = reason;
                  var params = {};
                  params['$push'] = { history: data };
                  let update = await db.UpdateManyDocument(
                    'emp_history',
                    { _id: new mongoose.Types.ObjectId(id) },
                    { $push: { history: data } },
                    {}
                  );
                } else {
                  let empDetails = await db.GetOneDocument(
                    'admins',
                    { _id: new mongoose.Types.ObjectId(id) },
                    {},
                    {}
                  );
                  if (empDetails) {
                    var insertdata = {};
                    insertdata._id = empDetails._id;
                    insertdata.new_user = empDetails.new_user;
                    insertdata.privileges = empDetails.privileges;
                    insertdata.phone = empDetails.phone;
                    insertdata.email = empDetails.email;
                    insertdata.title = empDetails.title;
                    insertdata.first_name = empDetails.first_name;
                    insertdata.last_name = empDetails.last_name;
                    insertdata.status = empDetails.status;
                    insertdata.gender = empDetails.gender;
                    insertdata.DOB = empDetails.DOB;
                    insertdata.pan_card = empDetails.pan_card;
                    insertdata.DOJ = empDetails.DOJ;
                    insertdata.address = empDetails.address;
                    insertdata.job_title = empDetails.job_title;
                    insertdata.employement_status = empDetails.employement_status;
                    insertdata.emergency_contact_details = empDetails.emergency_contact_details;
                    insertdata.bank_details = empDetails.bank_details;
                    insertdata.employeeId = empDetails.employeeId;
                    insertdata.role = empDetails.role;
                    insertdata.password = empDetails.password;
                    insertdata.avatar = empDetails.avatar;
                    insertdata.avatar_name = empDetails.avatar_name;
                    insertdata.created_activity = empDetails.created_activity;
                    insertdata.updated_activity = empDetails.updated_activity;
                    insertdata.history = {};
                    insertdata.history.action = type;
                    insertdata.history.done_by = admin._id;
                    insertdata.history.done_employeeId = admin.employeeId;
                    insertdata.history.time = Date.now();
                    insertdata.history.reason = reason;
                    let newrecord = await db.InsertDocument('emp_history', insertdata);
                  }
                }
                next();
              } else {
                next();
              }
            },
            (err, transformedItems) => {
              return 'success';
            }
          );
        }
      } else {
        return '';
      }
    } else {
      return '';
    }
  } catch (err) {
    return '';
  }
};

/* var testsendsmsdata = async () => {
	try {
		let settings = await db.GetOneDocument('settings', { 'alias': 'sms' }, {}, {});
		if (settings && typeof settings.settings != "undefined" && settings.settings != "") {
			var Authkey = settings.settings.Authkey;
			var Sender = settings.settings.Sender;
			var phone = ['7010193244','7550173340','8248796757'];
			var message = 'hi';
			const response = await axios.get(`https://api.msg91.com/api/sendhttp.php?authkey=${Authkey}&mobiles=${phone}&country=91&message=${message}&sender=${Sender}&route=4`);
			console.log(response.status, response.data);
		}
	} catch (err) {
		return { mode: 3 };
	}
}
testsendsmsdata() */
var unsetimage = async (urls) => {
  urls.forEach((url, index) => {
    return fs.unlink(url.url, (err) => {
      if (err) {
        return console.error(err);
      } else {
        return 'success';
      }
    });
  });
};

var removeimage = async (data) => {
  var record = data.record;
  var ids = data.ids.map((e) => {
    return new mongoose.Types.ObjectId(e);
  });
  if (record == 'article') {
    var query = [
      { $match: { _id: { $in: ids } } },
      { $unwind: { path: '$content' } },
      { $unwind: { path: '$content.image' } },
      {
        $project: {
          unique: { $literal: 1 },
          images: '$content.image',
        },
      },
      {
        $group: {
          _id: '$unique',
          image: { $push: '$images' },
        },
      },
    ];
    let images = await db.GetAggregation(record, query);
    return images;
  } else if (
    record == 'mcq' ||
    record == 'rej_mcq' ||
    record == 'testqstn' ||
    record == 'rej_testqstn'
  ) {
    var query = [
      { $match: { _id: { $in: ids } } },
      { $unwind: { path: '$imageurl' } },
      {
        $project: {
          unique: { $literal: 1 },
          images: '$imageurl',
        },
      },
      {
        $group: {
          _id: '$unique',
          image: { $push: '$images' },
        },
      },
    ];
    let images = await db.GetAggregation(record, query);
    return images;
  } else {
    return [];
  }
};

var removeexmyrpair = async (data) => {
  if (
    data &&
    data.ids &&
    data.ids != '' &&
    data.ids.length > 0 &&
    Array.isArray(data.ids) &&
    data.type &&
    (data.type == 'exam' || data.type == 'year')
  ) {
    var ids = data.ids.map((e) => {
      return new mongoose.Types.ObjectId(e);
    });
    var params = {};
    if (data.type == 'exam') {
      params['$pull'] = { exmyr_ids: { exam_id: { $in: ids } } };
    } else {
      params['$pull'] = { exmyr_ids: { year_id: { $in: ids } } };
    }
    var update = await db.UpdateManyDocument('mcq', {}, params, {});
    return 'success';
  } else {
    return '';
  }
};

var update_user_wallet = async (data) => {
  var insert_data = {};
  insert_data.wallet_id = data.wallet_id;
  insert_data.date = data.date;
  insert_data.content_id = data.content_id;
  insert_data.user_id = data.user_id;
  insert_data.user_uid = data.user_uid;
  insert_data.emp_id = data.emp_id;
  insert_data.amount = data.amount;
  insert_data.type = 1;
  let walletinsert = await db.InsertDocument('wallet_txn', insert_data);
  if (!walletinsert) {
    return '';
  } else {
    var params = {};
    params['$inc'] = {
      'wallet_settings.available': parseFloat(data.amount),
      'wallet_settings.life_time': parseFloat(data.amount),
    };
    await db.UpdateOneDocument(
      'user',
      { _id: { $eq: new mongoose.Types.ObjectId(data.user_id) } },
      params,
      {},
      {}
    );
    var userDetails = await db.GetOneDocument(
      'user',
      { _id: { $eq: new mongoose.Types.ObjectId(data.user_id) } },
      { wallet_settings: 1 },
      {}
    );
    let amount = userDetails.wallet_settings
      ? userDetails.wallet_settings.available
        ? userDetails.wallet_settings.available > 0
          ? userDetails.wallet_settings.available
          : 0
        : 0
      : 0;
    var cparams = {};
    cparams['$set'] = { wallet_amount: parseFloat(amount) };
    await db.UpdateOneDocument(
      'cart',
      { user_id: { $eq: new mongoose.Types.ObjectId(data.user_id) } },
      cparams,
      {},
      {}
    );
    await db.UpdateOneDocument(
      'wallet_txn',
      { _id: { $eq: walletinsert._id } },
      { $set: { balance: parseFloat(amount) } },
      {},
      {}
    );
    return 'success';
  }
};

var update_user_wallet_payment = async (data) => {
  var insert_data = {};
  insert_data.wallet_id = data.wallet_id;
  insert_data.date = data.date;
  insert_data.user_id = data.user_id;
  insert_data.user_uid = data.user_uid;
  insert_data.txn_id = data.txn_id;
  insert_data.txn_uid = data.txn_uid;
  insert_data.amount = data.amount;
  insert_data.type = 3;
  let walletinsert = await db.InsertDocument('wallet_txn', insert_data);
  if (!walletinsert) {
    return '';
  } else {
    var params = {};
    params['$inc'] = {
      'wallet_settings.available': -parseFloat(data.amount),
      'wallet_settings.used': parseFloat(data.amount),
    };
    await db.UpdateOneDocument(
      'user',
      { _id: { $eq: new mongoose.Types.ObjectId(data.user_id) } },
      params,
      {},
      {}
    );
    var tparams = {};
    tparams['$set'] = {
      wallet_id: walletinsert._id,
      wallet_uid: walletinsert.wallet_id,
    };
    await db.UpdateOneDocument(
      'transaction',
      { _id: { $eq: new mongoose.Types.ObjectId(data.txn_id) } },
      tparams,
      {},
      {}
    );
    var userDetails = await db.GetOneDocument(
      'user',
      { _id: { $eq: new mongoose.Types.ObjectId(data.user_id) } },
      { wallet_settings: 1 },
      {}
    );
    let amount = userDetails.wallet_settings
      ? userDetails.wallet_settings.available
        ? userDetails.wallet_settings.available > 0
          ? userDetails.wallet_settings.available
          : 0
        : 0
      : 0;
    await db.UpdateOneDocument(
      'wallet_txn',
      { _id: { $eq: walletinsert._id } },
      { $set: { balance: parseFloat(amount) } },
      {},
      {}
    );
    return 'success';
  }
};

var update_user_wallet_cashback = async (data) => {
  var insert_data = {};
  insert_data.wallet_id = data.wallet_id;
  insert_data.date = data.date;
  insert_data.user_id = data.user_id;
  insert_data.user_uid = data.user_uid;
  insert_data.txn_id = data.txn_id;
  insert_data.txn_uid = data.txn_uid;
  insert_data.amount = data.amount;
  insert_data.promo_id = data.promo_id;
  insert_data.promo_uid = data.promo_uid;
  insert_data.coupon_code = data.coupon_code;
  insert_data.type = 2;
  let walletinsert = await db.InsertDocument('wallet_txn', insert_data);
  if (!walletinsert) {
    return '';
  } else {
    var params = {};
    params['$inc'] = {
      'wallet_settings.available': parseFloat(data.amount),
      'wallet_settings.life_time': parseFloat(data.amount),
    };
    await db.UpdateOneDocument(
      'user',
      { _id: { $eq: new mongoose.Types.ObjectId(data.user_id) } },
      params,
      {},
      {}
    );
    var tparams = {};
    tparams['$set'] = {
      'promodetails.wallet_id': walletinsert._id,
      'promodetails.wallet_uid': walletinsert.wallet_id,
    };
    await db.UpdateOneDocument(
      'transaction',
      { _id: { $eq: new mongoose.Types.ObjectId(data.txn_id) } },
      tparams,
      {},
      {}
    );
    var userDetails = await db.GetOneDocument(
      'user',
      { _id: { $eq: new mongoose.Types.ObjectId(data.user_id) } },
      { wallet_settings: 1 },
      {}
    );
    let amount = userDetails.wallet_settings
      ? userDetails.wallet_settings.available
        ? userDetails.wallet_settings.available > 0
          ? userDetails.wallet_settings.available
          : 0
        : 0
      : 0;
    await db.UpdateOneDocument(
      'wallet_txn',
      { _id: { $eq: walletinsert._id } },
      { $set: { balance: parseFloat(amount) } },
      {},
      {}
    );
    return 'success';
  }
};

var update_user_wallet_cancel_cashback = async (data) => {
  var insert_data = {};
  insert_data.wallet_id = data.wallet_id;
  insert_data.date = data.date;
  insert_data.user_id = data.user_id;
  insert_data.user_uid = data.user_uid;
  insert_data.txn_id = data.txn_id;
  insert_data.txn_uid = data.txn_uid;
  insert_data.amount = data.amount;
  insert_data.promo_id = data.promo_id;
  insert_data.promo_uid = data.promo_uid;
  insert_data.coupon_code = data.coupon_code;
  insert_data.type = 4;
  let walletinsert = await db.InsertDocument('wallet_txn', insert_data);
  if (!walletinsert) {
    return '';
  } else {
    var params = {};
    params['$inc'] = {
      'wallet_settings.available': -parseFloat(data.amount),
      'wallet_settings.used': parseFloat(data.amount),
    };
    await db.UpdateOneDocument(
      'user',
      { _id: { $eq: new mongoose.Types.ObjectId(data.user_id) } },
      params,
      {},
      {}
    );
    var userDetails = await db.GetOneDocument(
      'user',
      { _id: { $eq: new mongoose.Types.ObjectId(data.user_id) } },
      { wallet_settings: 1 },
      {}
    );
    let amount = userDetails.wallet_settings
      ? userDetails.wallet_settings.available
        ? userDetails.wallet_settings.available > 0
          ? userDetails.wallet_settings.available
          : 0
        : 0
      : 0;
    await db.UpdateOneDocument(
      'wallet_txn',
      { _id: { $eq: walletinsert._id } },
      { $set: { balance: parseFloat(amount) } },
      {},
      {}
    );
    return 'success';
  }
};

function jwtSign(payload, callback) {
  jwt.sign(payload, CONFIG.SECRET_KEY, { expiresIn: '5d' }, (error, token) => {
    callback(error, token);
  });
}
function jwtSignRememberMe(payload, callback) {
  jwt.sign(payload, CONFIG.SECRET_KEY, { expiresIn: '10d' }, (error, token) => {
    callback(error, token);
  });
}

function validPassword(password, passwordb, callback) {
  bcrypt.compare(password, passwordb, (error, response) => {
    callback(error, response);
  });
}

module.exports = {
  capitalize: capitalize,
  capitalizeAll: capitalizeAll,
  capitalizeFirst: capitalizeFirst,
  trimspace: trimspace,
  get_attachment: get_attachment,
  randomString: randomString,
  recordUpdatedby: recordUpdatedby,
  employeeUpdatedby: employeeUpdatedby,
  unsetimage: unsetimage,
  removeimage: removeimage,
  removeexmyrpair: removeexmyrpair,
  update_user_wallet: update_user_wallet,
  update_user_wallet_payment: update_user_wallet_payment,
  update_user_wallet_cashback: update_user_wallet_cashback,
  update_user_wallet_cancel_cashback: update_user_wallet_cancel_cashback,
  jwtSign: jwtSign,
  jwtSignRememberMe: jwtSignRememberMe,
  validPassword: validPassword,
};
