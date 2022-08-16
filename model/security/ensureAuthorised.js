var CONFIG = require('../../config/config');
var jwt = require('jsonwebtoken');
const { GetOneDocument } = require('../../controller/db_adaptor/mongodb.js');

const ensureAuthorizedAdmin = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, CONFIG.SECRET_KEY, async (err, decoded) => {
      if (err || !decoded.email) {
        const data = {};
        data.response = 'Unauthorized Access';
        data.message = 'Session Expired';
        data.status = '00';
        res.send(data);
      } else {
        let collection = decoded.role === 'admin' ? 'admins' : 'subadmins';

        let mainAdmin = await GetOneDocument('admins', { status: 1 }, { _id: 1 }, {});

        let admins = await GetOneDocument(collection, { email: decoded.email, status: 1 }, {}, {});

        if (admins === null) {
          const data = {};
          data.response = 'Unauthorized Access';
          data.status = '00';
          res.send(data);
        } else {
          req.params.mainAdminId = mainAdmin._id;
          req.params.loginId = admins._id;
          req.params.loginData = admins;
          next();
        }
      }
    });
  } else {
    res.send('Unauthorized Access');
  }
};

const ensureAuthorizedClient = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, CONFIG.SECRET_KEY, async (err, decoded) => {
      if (err || !decoded._id) {
        const data = {};
        data.response = 'Unauthorized Access';
        data.message = 'Session Expired';
        data.status = '00';
        res.send(data);
      } else {
        let user = await GetOneDocument('client', { _id: decoded._id, status: 1 }, {}, {});

        let admins = await GetOneDocument('admins', { status: 1 }, { _id: 1 }, {});

        if (user === null) {
          const data = {};
          data.response = 'Unauthorized Access';
          data.status = '00';
          res.send(data);
        } else {
          req.params.loginId = user._id;
          req.params.loginData = user;
          req.params.adminId = admins._id;
          next();
        }
      }
    });
  } else {
    res.send('Unauthorized Access');
  }
};

module.exports = {
  ensureAuthorizedAdmin,
  ensureAuthorizedClient,
};
