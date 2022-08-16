const _ = require('lodash');
const moment = require('moment');
const endOfMonth = require('date-fns/endOfMonth');
const isToday = require('date-fns/isToday');
const subDays = require('date-fns/subDays');
const startOfDay = require('date-fns/startOfDay');
const endOfDay = require('date-fns/endOfDay');
const { ObjectId } = require('../model/common');

const dateFns = {
  endOfMonth,
  isToday,
  subDays,
  startOfDay,
  endOfDay,
};

const {
  GetAggregation,
  GetOneDocument,
  GetDocument,
  UpdateManyDocument,
} = require('../controller/db_adaptor/mongodb.js');

const mail = require('../model/mail');

const {
  replaceSettingVars,
  replaceClientVarsForEmail,
  replaceTrainingVars,
  replaceBookingVars,
} = require('../model/replace_vars');

async function sendEmail(mailOptions) {
  if (_.isEmpty(mailOptions)) throw new Error('mailOptions params is required');

  await new Promise((resolve) => {
    mail.send(mailOptions, (err, response, mode) => {
      if (err) console.log(err);
      resolve(true);
    });
  });
}

module.exports = (io) => {
  const CronJob = require('cron').CronJob;

  // Job 1 => Notify Teams about their task assigned by admin or other team members
  const job1 = new CronJob({
    cronTime: '*/15 * * * *' /* At every 15th minute. */,
    onTick: () => {
      notifyTodo();
    },
    start: false,
  });

  // job1.start();

  async function notifyTodo() {
    try {
      // Get current date & time
      const todayStartDate = new Date(new Date().setHours(0, 0, 0, 0)); // Current Date start - example 24/11/2021
      const todayEndDate = new Date(new Date().setHours(23, 59, 59, 999)); // Current Date end - example 24/11/2021

      const currentTime = moment().toDate(); // Current time
      const futureTime = moment().add(15, 'm').toDate(); // Add 15 minutes to current time

      // Aggregation pipeline query container
      const query = [];

      /**
       * Stage 1
       * Match todo status === 1 which means status === 'todo'
       * Match todo date is equal to today date
       * Match todo time is >= currentTime & < futureTime :
       👉 which means currentTime is current timestamp & futureTime is current timestamp + 15 mins 
       */
      query.push({
        $match: {
          status: { $eq: 1 },
          date: {
            $gte: todayStartDate,
            $lt: todayEndDate,
          },
          time: {
            $gte: currentTime,
            $lt: futureTime,
          },
        },
      });

      /**
       * Stage 2
       * Project only title,date,time,user
       👉 title for notification title, 
       👉 date,time - todo date & time, 
       👉 user - to send notification to the particular user
       */
      query.push({
        $project: {
          title: 1,
          date: {
            $dateToString: { date: '$date' },
          },
          time: {
            $dateToString: { date: '$time' },
          },
          user: 1,
        },
      });

      const finalQuery = [
        {
          $facet: {
            documentdata: query,
          },
        },
      ];

      const result = await GetAggregation('todo', finalQuery);
      const data = _.get(result, '0.documentdata', []);

      // If no results found, exit.
      if (_.isEmpty(data)) return;

      // If results fround send notification to the particular user
      // TODO: need to implement realtime notification system for todo
    } catch (error) {
      console.log('Error occured in cron job - notifyTodo ---------->>>', error);
    }
  }

  // Job 2 => Notify client to provide their feedback about CAM Services
  const job2 = new CronJob({
    cronTime: '0 0 * * *' /* Every day at 00:00 AM */,
    onTick: () => notifyClientToProvideFeedback(),
    start: false,
  });

  // job2.start();

  async function notifyClientToProvideFeedback() {
    try {
      const lastDateOfCurMonth = dateFns.endOfMonth(new Date());

      // 1. Only run the following function only if today is the last day of the month
      if (dateFns.isToday(lastDateOfCurMonth)) {
        // 2. Get & Check settings
        const settings = await GetOneDocument('settings', { alias: 'general' }, {}, {});
        if (_.isEmpty(settings)) return;

        const query = [
          { $match: { status: { $eq: 1 } } },
          { $project: { first_name: 1, surname: 1, email: 1, company_details: 1 } },
        ];

        const clients = await GetAggregation('client', query);

        if (clients.length) {
          const redirectUrl = _.endsWith(settings.site_url, '/')
            ? `${settings.site_url}feedback/add`
            : `${settings.site_url}/feedback/add`;

          // 3. Check template is exists or not
          const template = await GetOneDocument(
            'emailtemplate',
            { slug: 'monthly-feedback' },
            {},
            {}
          );

          // 4. Loop over the clients to send email specifically
          for await (const client of clients) {
            // Prevent client email undefined or empty error
            if (!client.email) continue;

            const mailOptions = {
              from: `${settings.site_title} <${settings.email}>`,
              to: client.email,
              subject: template?.subject ?? 'Requesting feedback about CAM',
              text: `Please provide some feedback about us, or by our service, or by our staffs or by our projects. You can provide feedback by clicking through this ${redirectUrl} link.`,
            };

            // 5. If template exits override the template variables
            if (template) {
              mailOptions.subject = replaceSettingVars(template.subject, settings);
              mailOptions.subject = replaceClientVarsForEmail(mailOptions.subject, client);

              mailOptions.html = template.content.replace(/{feedback.redirectUrl}/g, redirectUrl);
              mailOptions.html = replaceSettingVars(mailOptions.html, settings);
            }

            // 6. Send email to client
            await sendEmail(mailOptions);
          }
        }
      }
    } catch (error) {
      console.log('Error occured in cron job - notifyClientToProvideFeedback --->>', error);
    }
  }


};
