const mail = require('./mail.js'),
  db = require('../controller/db_adaptor/mongodb.js');

var sendmail = async (data, callback) => {
  try {
    let settings = await db.GetOneDocument('settings', { alias: 'general' }, {}, {});
    if (
      typeof settings != 'undefined' &&
      settings != '' &&
      typeof settings.settings != 'undefined' &&
      settings.settings != ''
    ) {
      settings = settings.settings;
      if (data.type == 'notify') {
        var template = data.template;
      } else {
        var template = await db.GetDocument('emailtemplate', { name: data.template }, {}, {});
      }
      var html = '';
      if (typeof template != 'undefined' && template.length > 0 && typeof settings != 'undefined') {
        html = html + template[0].email_content;
        for (i = 0; i < data.html.length; i++) {
          var regExp = new RegExp('{{' + data.html[i].name + '}}', 'g');
          html = html.replace(regExp, data.html[i].value);
        }
        html = html.replace(/{{privacy}}/g, settings.site_url + 'user/page/privacy-policy');
        html = html.replace(/{{terms}}/g, settings.site_url + 'user/page/terms-and-condition');
        html = html.replace(/{{aboutus}}/g, settings.site_url + 'user/page/about-us');
        html = html.replace(/{{site_url}}/g, settings.site_url);
        html = html.replace(/{{site_title}}/g, settings.site_title);
        html = html.replace(/{{copy_rights}}/g, settings.copy_rights);

        if (
          Array.isArray(data.to) &&
          template[0].email_receiver &&
          template[0].email_receiver.length > 0
        ) {
          tomail = [...new Set(template[0].email_receiver.split(',').map((s) => s.trim()))];
          tomail = [...tomail, ...data.to];
          tomail = tomail.filter((e) => {
            return e;
          });
        } else if (data.to) {
          var tomail = data.to;
        } else {
          var tomail = template[0].email_sender;
        }
        var email_subject = template[0].email_subject;
        email_subject = email_subject.replace(
          /{{privacy}}/g,
          settings.site_url + 'user/page/privacy-policy'
        );
        email_subject = email_subject.replace(
          /{{terms}}/g,
          settings.site_url + 'user/page/terms-and-condition'
        );
        email_subject = email_subject.replace(
          /{{aboutus}}/g,
          settings.site_url + 'user/page/about-us'
        );
        email_subject = email_subject.replace(/{{site_title}}/g, settings.site_title);
        email_subject = email_subject.replace(/{{email_title}}/g, settings.site_title);
        email_subject = email_subject.replace(/{{copy_rights}}/g, settings.copy_rights);
        for (i = 0; i < data.html.length; i++) {
          var regExp = new RegExp('{{' + data.html[i].name + '}}', 'g');
          email_subject = email_subject.replace(regExp, data.html[i].value);
        }
        var mailOptions = {
          from: template[0].email_sender,
          to: tomail,
          subject: email_subject,
          text: html,
          html: html,
        };
        mail.send(mailOptions, function (err, response, mode) {
          callback(err, response, mode);
        });
      } else {
        callback(null, null, { mode: 3 });
      }
    }
  } catch (err) {
    callback(err, null, { mode: 3 });
  }
};

module.exports = {
  sendmail: sendmail,
};
