'use strict';

const { InsertDocument } = require('../controller/db_adaptor/mongodb.js');

module.exports = function (io) {
  return {
    addnotification: async (sender, receiver, message, action, app) => {
      //   console.log("TCL: sender, message, action, urlval, app", sender, message, action, urlval, app);

      let send_message = {};
      let notification = {};

      send_message['message'] = message || '';
      send_message['action'] = action;

      let type;
      if (app == 'admin') {
        type = 'admin';
      } else if (app == 'user') {
        type = 'user';
      }

      if (sender && sender != '') {
        if (type == 'user') {
          notification.sender = sender;
          notification.emit_type = 'client_notification';
          notification.client_message = message;
        } else if (type == 'admin') {
          notification.sender = sender;
          notification.emit_type = 'admin_notification';
          notification.admin_message = message;
        } else {
          notification.sender = sender;
          notification.emit_type = 'notifications';
          notification.admin_message = message;
          notification.client_message = message;
        }
      }

      notification.action = action;
      notification.type = type;
      notification.receiver = [receiver];
      notification.time_stamps = Number(new Date());

      const insert = await InsertDocument('notifications', notification);

      if (insert && insert._id) {
        io.of('/notify').emit(notification.emit_type, {
          type: type,
          message: message,
        });
      }
    },
  };
};
