let { Types } = require('mongoose');
const moment = require('moment');
let _ = require('lodash');
let {
  UpdateDoc,
  UpdateManyDoc,
  InsertDoc,
  GetDocs,
  GetOneDoc,
  model,
  GetAggregationDoc,
  DeleteDoccs,
  DeleteManyDoccs,
} = require('../controller/db_adaptor/mongodb.js');
let db = require('../controller/db_adaptor/mongodb.js');
const each = require('sync-each');
const events = require('events');
const event = new events.EventEmitter();
let shifts = 'shifts',
  jobtypes = 'jobtypes',
  locations = 'locations',
  messages = 'messages',
  agency_contact_list = 'agency_contact_list';

let append_zero = (number) => {
  if (
    number &&
    String(number).length > 0 &&
    String(number) !== String(undefined) &&
    String(number) !== String(null)
  ) {
    let find_index = String(number).indexOf('0');
    if (+find_index === 0) {
      return number;
    } else {
      return `0${number}`;
    }
  } else {
    return null;
  }
};

const update_emmp_incidents = async (req) => {
  try {
    if (req && req._id) {
      let get_data = await GetOneDoc(incidents, { _id: Types.ObjectId(req._id) }, {}, {});
      if (get_data && get_data._id) {
        let obj = {
          incident_name: _.get(get_data, 'incident_name', ''),
        };
        let updatemany = await UpdateManyDoc(
          emp_incidents,
          { incidents_id: Types.ObjectId(req._id) },
          obj,
          { multi: true }
        );
      }
    }
  } catch (error) {
    console.log(`error in update_emmp_incidents ${error}`);
  }
};

const update_emp_name = async (req) => {
  try {
    if (req && req._id) {
      let get_emp = await GetOneDoc(employees, { _id: Types.ObjectId(req._id) }, {}, {});
      if (get_emp && get_emp._id) {
        let obj = {
          emp_name: _.get(get_emp, 'name', ''),
        };
        let updatemany = await UpdateManyDoc(
          emp_incidents,
          { employee_id: Types.ObjectId(req._id) },
          obj,
          { multi: true }
        );
      }
    }
  } catch (error) {
    console.log(`error in update_emp_name ${error}`);
  }
};

const generatePassword = (length_data) => {
  var length = length_data || 12,
    charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    retVal = '';
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

const get_hours_from_secs = (mins_secs) => {
  return Math.floor(mins_secs / 60 / 60);
};

const get_minutes_from_secs = (mins_secs) => {
  return Math.floor((mins_secs / 60) % 60);
};

const get_hours_from_secs_format = (mins_secs) => {
  let hours = Math.floor(mins_secs / 60 / 60);
  hours = String(hours);
  hours = hours.length > 1 ? hours : `0${hours}`;
  return hours;
};

const get_minutes_from_secs_format = (mins_secs) => {
  let minutes = Math.floor((mins_secs / 60) % 60);
  minutes = String(minutes);
  minutes = minutes.length > 1 ? minutes : `0${minutes}`;
  return minutes;
};

const getadd_days_date = (days) => {
  let date = new Date();
  date.setDate(date.getDate() + Number(days));
  return date;
};

const getadd_days_timestamp = (days) => {
  let date = new Date();
  date.setDate(date.getDate() + Number(days));
  return new Date(date).getTime();
};

const additional_getadd_days_date = (dates, days) => {
  let date = new Date(dates);
  date.setDate(date.getDate() + Number(days));
  return date;
};

const additional_getadd_days_timestamp = (dates, days) => {
  let date = new Date(dates);
  date.setDate(date.getDate() + Number(days));
  return new Date(date).getTime();
};

const days_Difference = (date1, date2) => {
  let today_moment_format = moment(new Date(date2)).format('MM/DD/YYYY');
  let to_date_format = moment(new Date(date1)).format('MM/DD/YYYY');
  let difference = new Date(to_date_format).getTime() - new Date(today_moment_format).getTime();
  var daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
  return daysDifference;
};

const isObjectId = (e) => Types.ObjectId.isValid(e);

const ObjectId = (e) => Types.ObjectId(e);

const not_valid_msg = (word) => `${word} is not a valid Mongo ID`;

const error_msg = 'Something went wrong';

const no_data = 'No data found';

const msg_no_data = (data) => `No ${data} found`;

const update_msg = (word) => `${word} updated successfully`;

const not_update_msg = (word) => `${word} not updated`;

const added_msg = (word) => `${word} added successfully`;

const not_added_msg = (word) => `${word} not added`;

const delete_msg = (word) => `${word} deleted successfully`;

const not_delete_msg = (word) => `${word} not deleted`;

const restore_msg = (word) => `${word} restored successfully`;

const not_restore_msg = (word) => `${word} not restored`;

const required_msg = (word) => `${word} is required`;

const checkArray = (e) => Array.isArray(e);

const randomString = (length = 6) => {
  let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

const PrefixString = (length = 2) => {
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

const timelist = [
  { value: 1, label: '00:00' },
  { value: 900, label: '00:15' },
  { value: 1800, label: '00:30' },
  { value: 2700, label: '00:45' },
  { value: 3600, label: '01:00' },
  { value: 4500, label: '01:15' },
  { value: 5400, label: '01:30' },
  { value: 6300, label: '01:45' },
  { value: 7200, label: '02:00' },
  { value: 8100, label: '02:15' },
  { value: 9000, label: '02:30' },
  { value: 9900, label: '02:45' },
  { value: 10800, label: '03:00' },
  { value: 11700, label: '03:15' },
  { value: 12600, label: '03:30' },
  { value: 13500, label: '03:45' },
  { value: 14400, label: '04:00' },
  { value: 15300, label: '04:15' },
  { value: 16200, label: '04:30' },
  { value: 17100, label: '04:45' },
  { value: 18000, label: '05:00' },
  { value: 18900, label: '05:15' },
  { value: 19800, label: '05:30' },
  { value: 20700, label: '05:45' },
  { value: 21600, label: '06:00' },
  { value: 22500, label: '06:15' },
  { value: 23400, label: '06:30' },
  { value: 24300, label: '06:45' },
  { value: 25200, label: '07:00' },
  { value: 26100, label: '07:15' },
  { value: 27000, label: '07:30' },
  { value: 27900, label: '07:45' },
  { value: 28800, label: '08:00' },
  { value: 29700, label: '08:15' },
  { value: 30600, label: '08:30' },
  { value: 31500, label: '08:45' },
  { value: 32400, label: '09:00' },
  { value: 33300, label: '09:15' },
  { value: 34200, label: '09:30' },
  { value: 35100, label: '09:45' },
  { value: 36000, label: '10:00' },
  { value: 36900, label: '10:15' },
  { value: 37800, label: '10:30' },
  { value: 38700, label: '10:45' },
  { value: 39600, label: '11:00' },
  { value: 40500, label: '11:15' },
  { value: 41400, label: '11:30' },
  { value: 42300, label: '11:45' },
  { value: 43200, label: '12:00' },
  { value: 44100, label: '12:15' },
  { value: 45000, label: '12:30' },
  { value: 45900, label: '12:45' },
  { value: 46800, label: '13:00' },
  { value: 47700, label: '13:15' },
  { value: 48600, label: '13:30' },
  { value: 49500, label: '13:45' },
  { value: 50400, label: '14:00' },
  { value: 51300, label: '14:15' },
  { value: 52200, label: '14:30' },
  { value: 53100, label: '14:45' },
  { value: 54000, label: '15:00' },
  { value: 54900, label: '15:15' },
  { value: 55800, label: '15:30' },
  { value: 56700, label: '15:45' },
  { value: 57600, label: '16:00' },
  { value: 58500, label: '16:15' },
  { value: 59400, label: '16:30' },
  { value: 60300, label: '16:45' },
  { value: 61200, label: '17:00' },
  { value: 62100, label: '17:15' },
  { value: 63000, label: '17:30' },
  { value: 63900, label: '17:45' },
  { value: 64800, label: '18:00' },
  { value: 65700, label: '18:15' },
  { value: 66600, label: '18:30' },
  { value: 67500, label: '18:45' },
  { value: 68400, label: '19:00' },
  { value: 69300, label: '19:15' },
  { value: 70200, label: '19:30' },
  { value: 71100, label: '19:45' },
  { value: 72000, label: '20:00' },
  { value: 72900, label: '20:15' },
  { value: 73800, label: '20:30' },
  { value: 74700, label: '20:45' },
  { value: 75600, label: '21:00' },
  { value: 76500, label: '21:15' },
  { value: 77400, label: '21:30' },
  { value: 78300, label: '21:45' },
  { value: 79200, label: '22:00' },
  { value: 80100, label: '22:15' },
  { value: 81000, label: '22:30' },
  { value: 81900, label: '22:45' },
  { value: 82800, label: '23:00' },
  { value: 83700, label: '23:15' },
  { value: 84600, label: '23:30' },
  { value: 85500, label: '23:45' },
  // { value: 86400, label: "24:00" }
];

const GetMinutes = (numinsec) => {
  return numinsec / 60;
};

const GetHours = (num) => {
  var hours = Math.floor(num / 60);
  var minutes = Math.floor(num % 60);
  return { hours, minutes };
};

const compare_fun = (p1, p2, type = String) => type(p1) === type(p2);

const update_lats_shift = async (req) => {
  try {
    if (req && req._id) {
      let get_shifts = await GetOneDoc(employees, { _id: ObjectId(req._id) }, {}, {});
      if (get_shifts && get_shifts._id) {
        let get_stats = await GetDocs(
          shifts,
          { employee: ObjectId(req._id), status: { $in: [6, 7, 8] } },
          {},
          { sort: { createdAt: -1 }, limit: 1 }
        );
        let lastshift = [],
          obj = {};
        if (get_stats && get_stats.length > 0 && checkArray(get_stats)) {
          lastshift = get_stats.map((e) => {
            return {
              start_date: e.start_date,
              status: e.status,
              _id: e._id,
            };
          });
        }
        obj.lastshift = lastshift;
        let update = await UpdateDoc(employees, { _id: ObjectId(req._id) }, obj, {});
        console.log('update_lats_shift update', update);
      } else {
        console.log('No employees found');
      }
    } else {
      console.log('employee is required');
    }
  } catch (error) {
    console.log(`error update_lats_shift ${error}`);
  }
};

const emp_hours_working_rating = async (req) => {
  try {
    if (req && req._id) {
      let get_shifts = await GetOneDoc(employees, { _id: ObjectId(req._id) }, {}, {});
      if (get_shifts && get_shifts._id) {
        let get_stats = await GetDocs(
          shifts,
          { employee: ObjectId(req._id), status: { $in: [6, 7, 8] } },
          {},
          {}
        );
        if (get_stats && get_stats.length > 0 && checkArray(get_stats)) {
          let filtered = get_stats.reduce((acc, item1) => {
            let result = 0;
            if (item1 && item1.starttime > item1.endtime) {
              let subs = 86400 - item1.starttime;
              let add = 0 + item1.endtime;
              result = subs + add;
            } else {
              result = Math.abs(item1.endtime - item1.starttime);
            }
            return acc + result;
          }, 0);
          let arr_of_rat = get_stats.map((e) => e.agency_rating);
          let add = arr_of_rat.reduce((acc, init) => {
            return acc + init;
          }, 0);
          format = Array.of(
            Number(
              `${GetHours(GetMinutes(filtered)).hours}.${GetHours(GetMinutes(filtered)).minutes}`
            )
          );
          let obj = {};
          obj.hours = format;
          let employee_ratings = add / arr_of_rat.length;
          obj.employee_ratings = Math.round(employee_ratings);
          let update = await UpdateDoc(employees, { _id: ObjectId(req._id) }, obj, {});
          console.log('update_lats_shift update', update);
        } else {
          console.log('No shifts found');
        }
      } else {
        console.log('No employees found');
      }
    } else {
      console.log('employee is required');
    }
  } catch (error) {
    console.log(`error emp_hours_working_rating ${error}`);
  }
};

const emp_location = async (req) => {
  try {
    if (req && req._id) {
      let get_shifts = await GetOneDoc(employees, { _id: ObjectId(req._id) }, {}, {});
      if (get_shifts && get_shifts._id) {
        if (
          get_shifts.locations &&
          checkArray(get_shifts.locations) &&
          get_shifts.locations.length > 0
        ) {
          let locMID = get_shifts.locations.map((e) => ObjectId(e));
          let get_name = await GetDocs(
            locations,
            { _id: { $in: locMID }, addedBy: 'agency', addedId: ObjectId(get_shifts.agency) },
            {},
            {}
          );
          let obj = {};
          obj.locations_name = get_name.map((e_name) => e_name.name);
          let update = await UpdateDoc(employees, { _id: ObjectId(get_shifts._id) }, obj, {});
          console.log('update emp_location', update);
        } else {
          console.log('No locations found');
        }
      } else {
        console.log('No employees found');
      }
    } else {
      console.log('employee is required');
    }
  } catch (err) {
    console.log(`error emp_location ${err}`);
  }
};

const emp_jobtype = async (req) => {
  try {
    if (req && req._id) {
      let get_shifts = await GetOneDoc(employees, { _id: ObjectId(req._id) }, {}, {});
      if (get_shifts && get_shifts._id) {
        if (
          get_shifts.locations &&
          checkArray(get_shifts.locations) &&
          get_shifts.locations.length > 0
        ) {
          let jobmid = get_shifts.job_type.map((e) => ObjectId(e));
          let get_name = await GetDocs(
            jobtypes,
            { _id: { $in: jobmid }, addedBy: 'agency', addedId: ObjectId(get_shifts.agency) },
            {},
            {}
          );
          let obj = {};
          obj.job_type_name = get_name.map((e_name) => e_name.name);
          let update = await UpdateDoc(employees, { _id: ObjectId(get_shifts._id) }, obj, {});
          console.log('update emp_jobtype', update);
        } else {
          console.log('No locations found');
        }
      } else {
        console.log('No employees found');
      }
    } else {
      console.log('employee is required');
    }
  } catch (err) {
    console.log(`error emp_location ${err}`);
  }
};

const update_shifts_comp_name = async (req) => {
  try {
    if (req && req._id && isObjectId(req._id)) {
      let get_agency = await GetOneDoc(agencies, { _id: ObjectId(req._id) }, {}, {});
      if (get_agency && get_agency.company_name) {
        let obj = {};
        obj.company_name = get_agency.company_name;
        let update_many = await UpdateManyDoc(shifts, { agency: ObjectId(req._id) }, obj, {
          multi: true,
        });
        console.log('update_many update_shifts_comp_name', update_many);
      } else {
        console.log('No company name found');
      }
    } else {
      console.log('Agency Id is required');
    }
  } catch (error) {
    console.log(`error update_shifts_comp_name ${error}`);
  }
};

const update_job_type_location_company_name = async (req) => {
  try {
    if (req && req._id && isObjectId(req._id)) {
      let get_shifts = await GetOneDoc(shifts, { _id: ObjectId(req._id) }, {}, {});
      if (
        get_shifts &&
        get_shifts._id &&
        get_shifts.job_type &&
        get_shifts.locations &&
        get_shifts.agency
      ) {
        let agencies_data = GetOneDoc(
          agencies,
          { _id: ObjectId(get_shifts.agency) },
          { company_name: 1 },
          {}
        );
        let locations_data = GetOneDoc(
          locations,
          { _id: ObjectId(get_shifts.locations) },
          { name: 1 },
          {}
        );
        let job_type_data = GetOneDoc(
          jobtypes,
          { _id: ObjectId(get_shifts.job_type) },
          { name: 1 },
          {}
        );
        let all = await Promise.all([agencies_data, locations_data, job_type_data]);
        let obj = {};
        obj.company_name = _.get(all, '0.company_name', '');
        obj.locations_name = _.get(all, '1.name', '');
        obj.job_type_name = _.get(all, '2.name', '');
        let update = await UpdateDoc(shifts, { _id: ObjectId(req._id) }, obj, {});
        console.log('update update_job_type_location_company_name', update);
      } else {
        console.log('No company name found');
      }
    } else {
      console.log('Shift Id is required');
    }
  } catch (error) {
    console.log(`error update_job_type_location_company_name ${error}`);
  }
};

const insert_job_type_location_company_name = async (req) => {
  try {
    if (req && req._id && checkArray(req._id)) {
      let ids = req._id.map((e) => ObjectId(e._id));
      let get_shifts = await GetDocs(shifts, { _id: { $in: ids } }, {}, {});
      if (get_shifts && get_shifts.length > 0 && checkArray(get_shifts)) {
        each(
          get_shifts,
          async (item, cb) => {
            if (item && item._id && item.job_type && item.locations && item.agency) {
              let agencies_data = GetOneDoc(
                agencies,
                { _id: ObjectId(item.agency) },
                { company_name: 1 },
                {}
              );
              let locations_data = GetOneDoc(
                locations,
                { _id: ObjectId(item.locations) },
                { name: 1 },
                {}
              );
              let job_type_data = GetOneDoc(
                jobtypes,
                { _id: ObjectId(item.job_type) },
                { name: 1 },
                {}
              );
              let all = await Promise.all([agencies_data, locations_data, job_type_data]);
              let obj = {};
              obj.company_name = _.get(all, '0.company_name', '');
              obj.locations_name = _.get(all, '1.name', '');
              obj.job_type_name = _.get(all, '2.name', '');
              let update = await UpdateDoc(shifts, { _id: ObjectId(item._id) }, obj, {});
              process.nextTick(cb);
            } else {
              process.nextTick(cb);
            }
          },
          () => {
            console.log('update update_job_type_location_company_name');
          }
        );
      } else {
        console.log('No company name found');
      }
    } else {
      console.log('Shift Id is required');
    }
  } catch (error) {
    console.log(`error update_job_type_location_company_name ${error}`);
  }
};

const Update_name_agency_todo = async (req) => {
  try {
    if (req && req.name && req._id && isObjectId(req._id)) {
      let obj = -{ name: req.name };
      let update = await UpdateManyDoc('agency_todo', { added_by: ObjectId(req._id) }, obj, {
        multi: true,
      });
      console.log('update', update);
    } else {
      console.log(`req is required`, req);
    }
  } catch (error) {
    console.log(`error ${error}`);
  }
};

const check_and_delete = async (from, to) => {
  try {
    if (isObjectId(from) && isObjectId(to)) {
      let get_all = await GetDocs(
        messages,
        { from: ObjectId(from), to: ObjectId(to), status: 1 },
        {},
        {}
      );
      if (get_all && get_all.length > 0 && checkArray(get_all)) {
        each(
          get_all,
          async (item, cb) => {
            if (item && item._id) {
              if (item.agency_deleted_status === 2 && item.candidate_deleted_status === 2) {
                let obj = { status: 0 };
                let update = await UpdateDoc(messages, { _id: ObjectId(item._id) }, obj, {});
                process.nextTick(cb);
              } else {
                process.nextTick(cb);
              }
            } else {
              process.nextTick(cb);
            }
          },
          () => {
            console.log('done');
          }
        );
      } else {
        console.log('No datas found in const check_and_delete');
      }
    } else {
      console.log('from and to is required');
    }
  } catch (error) {
    console.log(`error in const check_and_delete ${error}`);
  }
};

const capitalize = (data) =>
  `${String(data).charAt(0).toUpperCase()}${String(data).substring(1).toLowerCase()}`;

let calculate_percentage = async (req) => {
  var total = 136,
    count = 0,
    avg = 0,
    percentage = 0;
  try {
    if (req && req._id && isObjectId(req._id)) {
      let get_emp = await GetOneDoc(employees, { _id: ObjectId(req._id) }, {}, {});
      if (get_emp && get_emp._id) {
        /* bank details Start */
        if (
          get_emp &&
          get_emp.bank_details &&
          get_emp.bank_details.accountName &&
          String(get_emp.bank_details.accountName) !== String(undefined) &&
          get_emp.bank_details.accountName.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.bank_details &&
          get_emp.bank_details.accountType &&
          String(get_emp.bank_details.accountType) !== String(undefined) &&
          get_emp.bank_details.accountType.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.bank_details &&
          get_emp.bank_details.bankName &&
          String(get_emp.bank_details.bankName) !== String(undefined) &&
          get_emp.bank_details.bankName.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.bank_details &&
          get_emp.bank_details.bank_ac_name &&
          String(get_emp.bank_details.bank_ac_name) !== String(undefined) &&
          get_emp.bank_details.bank_ac_name.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.bank_details &&
          get_emp.bank_details.bank_sort_code &&
          String(get_emp.bank_details.bank_sort_code) !== String(undefined) &&
          get_emp.bank_details.bank_sort_code.length > 0
        ) {
          count = count + 1;
        }
        /* bank details end */

        /* reference */
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.reference1 &&
          get_emp.onlineform.reference1.firstrefrelationship &&
          String(get_emp.onlineform.reference1.firstrefrelationship) !== String(undefined) &&
          get_emp.onlineform.reference1.firstrefrelationship.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.reference1 &&
          get_emp.onlineform.reference1.firstreffirstname &&
          String(get_emp.onlineform.reference1.firstreffirstname) !== String(undefined) &&
          get_emp.onlineform.reference1.firstreffirstname.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.reference1 &&
          get_emp.onlineform.reference1.firstreflastname &&
          String(get_emp.onlineform.reference1.firstreflastname) !== String(undefined) &&
          get_emp.onlineform.reference1.firstreflastname.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.reference1 &&
          get_emp.onlineform.reference1.firstrefemail &&
          String(get_emp.onlineform.reference1.firstrefemail) !== String(undefined) &&
          get_emp.onlineform.reference1.firstrefemail.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.reference1 &&
          get_emp.onlineform.reference1.firstrefconfirmemail &&
          String(get_emp.onlineform.reference1.firstrefconfirmemail) !== String(undefined) &&
          get_emp.onlineform.reference1.firstrefconfirmemail.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.reference1 &&
          get_emp.onlineform.reference1.Address &&
          get_emp.onlineform.reference1.Address.firstrefstreetAddress &&
          String(get_emp.onlineform.reference1.Address.firstrefstreetAddress) !==
            String(undefined) &&
          get_emp.onlineform.reference1.Address.firstrefstreetAddress.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.reference1 &&
          get_emp.onlineform.reference1.Address &&
          get_emp.onlineform.reference1.Address.firstrefcity &&
          String(get_emp.onlineform.reference1.Address.firstrefcity) !== String(undefined) &&
          get_emp.onlineform.reference1.Address.firstrefcity.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.reference1 &&
          get_emp.onlineform.reference1.Address &&
          get_emp.onlineform.reference1.Address.firstrefstate &&
          String(get_emp.onlineform.reference1.Address.firstrefstate) !== String(undefined) &&
          get_emp.onlineform.reference1.Address.firstrefstate.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.reference1 &&
          get_emp.onlineform.reference1.Address &&
          get_emp.onlineform.reference1.Address.firstrefzip &&
          String(get_emp.onlineform.reference1.Address.firstrefzip) !== String(undefined) &&
          get_emp.onlineform.reference1.Address.firstrefzip.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.reference1 &&
          get_emp.onlineform.reference1.firstrefphone &&
          get_emp.onlineform.reference1.firstrefphone.number &&
          String(get_emp.onlineform.reference1.firstrefphone.number) !== String(undefined) &&
          get_emp.onlineform.reference1.firstrefphone.number.length > 0
        ) {
          count = count + 1;
        }

        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.reference2 &&
          get_emp.onlineform.reference2.secondrefrelationship &&
          String(get_emp.onlineform.reference2.secondrefrelationship) !== String(undefined) &&
          get_emp.onlineform.reference2.secondrefrelationship.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.reference2 &&
          get_emp.onlineform.reference2.secondreffirstname &&
          String(get_emp.onlineform.reference2.secondreffirstname) !== String(undefined) &&
          get_emp.onlineform.reference2.secondreffirstname.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.reference2 &&
          get_emp.onlineform.reference2.secondreflastname &&
          String(get_emp.onlineform.reference2.secondreflastname) !== String(undefined) &&
          get_emp.onlineform.reference2.secondreflastname.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.reference2 &&
          get_emp.onlineform.reference2.secondrefemail &&
          String(get_emp.onlineform.reference2.secondrefemail) !== String(undefined) &&
          get_emp.onlineform.reference2.secondrefemail.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.reference2 &&
          get_emp.onlineform.reference2.secondrefconfirmemail &&
          String(get_emp.onlineform.reference2.secondrefconfirmemail) !== String(undefined) &&
          get_emp.onlineform.reference2.secondrefconfirmemail.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.reference2 &&
          get_emp.onlineform.reference2.Address &&
          get_emp.onlineform.reference2.Address.secondrefstreetAddress &&
          String(get_emp.onlineform.reference2.Address.secondrefstreetAddress) !==
            String(undefined) &&
          get_emp.onlineform.reference2.Address.secondrefstreetAddress.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.reference2 &&
          get_emp.onlineform.reference2.Address &&
          get_emp.onlineform.reference2.Address.secondrefcity &&
          String(get_emp.onlineform.reference2.Address.secondrefcity) !== String(undefined) &&
          get_emp.onlineform.reference2.Address.secondrefcity.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.reference2 &&
          get_emp.onlineform.reference2.Address &&
          get_emp.onlineform.reference2.Address.secondrefstate &&
          String(get_emp.onlineform.reference2.Address.secondrefstate) !== String(undefined) &&
          get_emp.onlineform.reference2.Address.secondrefstate.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.reference2 &&
          get_emp.onlineform.reference2.Address &&
          get_emp.onlineform.reference2.Address.secondrefzip &&
          String(get_emp.onlineform.reference2.Address.secondrefzip) !== String(undefined) &&
          get_emp.onlineform.reference2.Address.secondrefzip.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.reference2 &&
          get_emp.onlineform.reference2.secondrefphone &&
          get_emp.onlineform.reference2.secondrefphone.number &&
          String(get_emp.onlineform.reference2.secondrefphone.number) !== String(undefined) &&
          get_emp.onlineform.reference2.secondrefphone.number.length > 0
        ) {
          count = count + 1;
        }
        /* reference */

        /* documents */
        // if (get_emp && get_emp.documents && checkArray(get_emp.documents) && get_emp.documents.length > 0) {
        //     count = count + 1;
        // }
        if (get_emp && get_emp.signature && get_emp.signature.length > 0) {
          count = count + 1;
        }
        /* documents */

        /* work_exp */
        if (
          get_emp &&
          get_emp.work_exp &&
          checkArray(get_emp.work_exp) &&
          get_emp.work_exp.length > 0
        ) {
          count = count + 1;
        }
        /* work_exp */

        /* education_qualification */
        if (
          get_emp &&
          get_emp.education_qualification &&
          checkArray(get_emp.education_qualification) &&
          get_emp.education_qualification.length > 0
        ) {
          count = count + 1;
        }
        /* education_qualification */

        /* other_courses */
        if (
          get_emp &&
          get_emp.other_courses &&
          checkArray(get_emp.other_courses) &&
          get_emp.other_courses.length > 0
        ) {
          count = count + 1;
        }
        /* other_courses */

        /* professional_Body */
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.professional_Body &&
          checkArray(get_emp.onlineform.professional_Body) &&
          get_emp.onlineform.professional_Body.length > 0
        ) {
          count = count + 1;
        }
        /* professional_Body */

        /* personaldetails */
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.personaldetails &&
          get_emp.onlineform.personaldetails.title &&
          String(get_emp.onlineform.personaldetails.title) !== String(undefined) &&
          get_emp.onlineform.personaldetails.title.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.personaldetails &&
          get_emp.onlineform.personaldetails.firstname &&
          String(get_emp.onlineform.personaldetails.firstname) !== String(undefined) &&
          get_emp.onlineform.personaldetails.firstname.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.personaldetails &&
          get_emp.onlineform.personaldetails.prefferedName &&
          String(get_emp.onlineform.personaldetails.prefferedName) !== String(undefined) &&
          get_emp.onlineform.personaldetails.prefferedName.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.personaldetails &&
          get_emp.onlineform.personaldetails.middlename &&
          String(get_emp.onlineform.personaldetails.middlename) !== String(undefined) &&
          get_emp.onlineform.personaldetails.middlename.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.personaldetails &&
          get_emp.onlineform.personaldetails.lastname &&
          String(get_emp.onlineform.personaldetails.lastname) !== String(undefined) &&
          get_emp.onlineform.personaldetails.lastname.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.personaldetails &&
          get_emp.onlineform.personaldetails.maidenName &&
          String(get_emp.onlineform.personaldetails.maidenName) !== String(undefined) &&
          get_emp.onlineform.personaldetails.maidenName.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.personaldetails &&
          get_emp.onlineform.personaldetails.isNameChanged &&
          String(get_emp.onlineform.personaldetails.isNameChanged) !== String(undefined) &&
          get_emp.onlineform.personaldetails.isNameChanged.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.personaldetails &&
          get_emp.onlineform.personaldetails.gender &&
          String(get_emp.onlineform.personaldetails.gender) !== String(undefined) &&
          get_emp.onlineform.personaldetails.gender.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.personaldetails &&
          get_emp.onlineform.personaldetails.UploadIDPhoto &&
          String(get_emp.onlineform.personaldetails.UploadIDPhoto) !== String(undefined) &&
          get_emp.onlineform.personaldetails.UploadIDPhoto.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.personaldetails &&
          get_emp.onlineform.personaldetails.dateofbirth &&
          String(get_emp.onlineform.personaldetails.dateofbirth) !== String(undefined) &&
          get_emp.onlineform.personaldetails.dateofbirth.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.personaldetails &&
          get_emp.onlineform.personaldetails.martialStatus &&
          String(get_emp.onlineform.personaldetails.martialStatus) !== String(undefined) &&
          get_emp.onlineform.personaldetails.martialStatus.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.personaldetails &&
          get_emp.onlineform.personaldetails.nationality &&
          String(get_emp.onlineform.personaldetails.nationality) !== String(undefined) &&
          get_emp.onlineform.personaldetails.nationality.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.personaldetails &&
          get_emp.onlineform.personaldetails.religion &&
          String(get_emp.onlineform.personaldetails.religion) !== String(undefined) &&
          get_emp.onlineform.personaldetails.religion.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.personaldetails &&
          get_emp.onlineform.personaldetails.email &&
          String(get_emp.onlineform.personaldetails.email) !== String(undefined) &&
          get_emp.onlineform.personaldetails.email.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.personaldetails &&
          get_emp.onlineform.personaldetails.mobileno &&
          get_emp.onlineform.personaldetails.mobileno.number &&
          String(get_emp.onlineform.personaldetails.mobileno.number) !== String(undefined) &&
          get_emp.onlineform.personaldetails.mobileno.number.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.personaldetails &&
          get_emp.onlineform.personaldetails.homephone &&
          String(get_emp.onlineform.personaldetails.homephone) !== String(undefined) &&
          get_emp.onlineform.personaldetails.homephone.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.personaldetails &&
          get_emp.onlineform.personaldetails.address &&
          get_emp.onlineform.personaldetails.address.addressline2 &&
          String(get_emp.onlineform.personaldetails.address.addressline2) !== String(undefined) &&
          get_emp.onlineform.personaldetails.address.addressline2.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.personaldetails &&
          get_emp.onlineform.personaldetails.address &&
          get_emp.onlineform.personaldetails.address.city &&
          String(get_emp.onlineform.personaldetails.address.city) !== String(undefined) &&
          get_emp.onlineform.personaldetails.address.city.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.personaldetails &&
          get_emp.onlineform.personaldetails.address &&
          get_emp.onlineform.personaldetails.address.state &&
          String(get_emp.onlineform.personaldetails.address.state) !== String(undefined) &&
          get_emp.onlineform.personaldetails.address.state.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.personaldetails &&
          get_emp.onlineform.personaldetails.address &&
          get_emp.onlineform.personaldetails.address.zip &&
          String(get_emp.onlineform.personaldetails.address.zip) !== String(undefined) &&
          get_emp.onlineform.personaldetails.address.zip.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.personaldetails &&
          get_emp.onlineform.personaldetails.address &&
          get_emp.onlineform.personaldetails.address.country &&
          String(get_emp.onlineform.personaldetails.address.country) !== String(undefined) &&
          get_emp.onlineform.personaldetails.address.country.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.personaldetails &&
          get_emp.onlineform.personaldetails.dateMovedAddress &&
          String(get_emp.onlineform.personaldetails.dateMovedAddress) !== String(undefined) &&
          get_emp.onlineform.personaldetails.dateMovedAddress.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.job_type &&
          checkArray(get_emp.job_type) &&
          get_emp.job_type.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.locations &&
          checkArray(get_emp.locations) &&
          get_emp.locations.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.workstatus &&
          String(get_emp.onlineform.workstatus) !== String(undefined) &&
          get_emp.onlineform.workstatus.length > 0
        ) {
          count = count + 1;
        }
        if (
          (get_emp &&
            get_emp.onlineform &&
            get_emp.onlineform.aboutyourwork &&
            get_emp.onlineform.aboutyourwork.abletowork &&
            get_emp.onlineform.aboutyourwork.abletowork.work_mornings &&
            get_emp.onlineform.aboutyourwork.abletowork.work_mornings.length > 0) ||
          (get_emp.onlineform.aboutyourwork.abletowork.work_evenings &&
            get_emp.onlineform.aboutyourwork.abletowork.work_evenings.length > 0) ||
          (get_emp.onlineform.aboutyourwork.abletowork.work_afternoons &&
            get_emp.onlineform.aboutyourwork.abletowork.work_afternoons.length > 0) ||
          (get_emp.onlineform.aboutyourwork.abletowork.work_occasional &&
            get_emp.onlineform.aboutyourwork.abletowork.work_occasional.length > 0) ||
          (get_emp.onlineform.aboutyourwork.abletowork.work_fulltime &&
            get_emp.onlineform.aboutyourwork.abletowork.work_fulltime.length > 0) ||
          (get_emp.onlineform.aboutyourwork.abletowork.work_parttime &&
            get_emp.onlineform.aboutyourwork.abletowork.work_parttime.length > 0) ||
          (get_emp.onlineform.aboutyourwork.abletowork.work_nights &&
            get_emp.onlineform.aboutyourwork.abletowork.work_nights.length > 0) ||
          (get_emp.onlineform.aboutyourwork.abletowork.work_anytime &&
            get_emp.onlineform.aboutyourwork.abletowork.work_anytime.length > 0) ||
          (get_emp.onlineform.aboutyourwork.abletowork.work_weekends &&
            get_emp.onlineform.aboutyourwork.abletowork.work_weekends.length > 0)
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.aboutyourwork &&
          get_emp.onlineform.aboutyourwork.availablestartdate &&
          String(get_emp.onlineform.aboutyourwork.availablestartdate) !== String(undefined) &&
          get_emp.onlineform.aboutyourwork.availablestartdate.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.aboutyourwork &&
          get_emp.onlineform.aboutyourwork.shortnotice &&
          String(get_emp.onlineform.aboutyourwork.shortnotice) !== String(undefined) &&
          get_emp.onlineform.aboutyourwork.shortnotice.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.aboutyourwork &&
          get_emp.onlineform.aboutyourwork.reduceworkflexibility &&
          String(get_emp.onlineform.aboutyourwork.reduceworkflexibility) !== String(undefined) &&
          get_emp.onlineform.aboutyourwork.reduceworkflexibility.length > 0
        ) {
          count = count + 1;
        }

        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.righttowork &&
          get_emp.onlineform.righttowork.documentType &&
          String(get_emp.onlineform.righttowork.documentType) !== String(undefined) &&
          get_emp.onlineform.righttowork.documentType.length > 0
        ) {
          count = count + 1;
        }
        if (
          (get_emp &&
            get_emp.drivers_licence &&
            get_emp.drivers_licence.isdrivinglicence &&
            String(get_emp.drivers_licence.isdrivinglicence) !== String(undefined) &&
            get_emp.drivers_licence.isdrivinglicence.length > 0) ||
          (get_emp.onlineform &&
            get_emp.onlineform.drivingdetails &&
            get_emp.onlineform.drivingdetails.drivinglicence &&
            String(get_emp.onlineform.drivingdetails.drivinglicence) !== String(undefined) &&
            get_emp.onlineform.drivingdetails.drivinglicence.length > 0)
        ) {
          count = count + 1;
        }

        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.langauages &&
          get_emp.onlineform.langauages.otherlanguage &&
          checkArray(get_emp.onlineform.langauages.otherlanguage) &&
          get_emp.onlineform.langauages.otherlanguage.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.langauages &&
          get_emp.onlineform.langauages.englishspoken &&
          String(get_emp.onlineform.langauages.englishspoken) !== String(undefined) &&
          get_emp.onlineform.langauages.englishspoken.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.langauages &&
          get_emp.onlineform.langauages.englishwritten &&
          String(get_emp.onlineform.langauages.englishwritten) !== String(undefined) &&
          get_emp.onlineform.langauages.englishwritten.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.personaldetails &&
          get_emp.onlineform.personaldetails.iscurrentDBS &&
          String(get_emp.onlineform.personaldetails.iscurrentDBS) !== String(undefined) &&
          get_emp.onlineform.personaldetails.iscurrentDBS.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.nextofkindetails &&
          get_emp.onlineform.nextofkindetails.kinfirstname &&
          String(get_emp.onlineform.nextofkindetails.kinfirstname) !== String(undefined) &&
          get_emp.onlineform.nextofkindetails.kinfirstname.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.nextofkindetails &&
          get_emp.onlineform.nextofkindetails.kinlastname &&
          String(get_emp.onlineform.nextofkindetails.kinlastname) !== String(undefined) &&
          get_emp.onlineform.nextofkindetails.kinlastname.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.nextofkindetails &&
          get_emp.onlineform.nextofkindetails.kinrelationship &&
          String(get_emp.onlineform.nextofkindetails.kinrelationship) !== String(undefined) &&
          get_emp.onlineform.nextofkindetails.kinrelationship.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.nextofkindetails &&
          get_emp.onlineform.nextofkindetails.kinhomephone &&
          String(get_emp.onlineform.nextofkindetails.kinhomephone) !== String(undefined) &&
          get_emp.onlineform.nextofkindetails.kinhomephone.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.nextofkindetails &&
          get_emp.onlineform.nextofkindetails.kinemail &&
          String(get_emp.onlineform.nextofkindetails.kinemail) !== String(undefined) &&
          get_emp.onlineform.nextofkindetails.kinemail.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.nextofkindetails &&
          get_emp.onlineform.nextofkindetails.kinmobileno &&
          get_emp.onlineform.nextofkindetails.kinmobileno.number &&
          String(get_emp.onlineform.nextofkindetails.kinmobileno.number) !== String(undefined) &&
          get_emp.onlineform.nextofkindetails.kinmobileno.number.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.nextofkindetails &&
          get_emp.onlineform.nextofkindetails.Address &&
          get_emp.onlineform.nextofkindetails.Address.kinstreetAddress &&
          String(get_emp.onlineform.nextofkindetails.Address.kinstreetAddress) !==
            String(undefined) &&
          get_emp.onlineform.nextofkindetails.Address.kinstreetAddress.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.nextofkindetails &&
          get_emp.onlineform.nextofkindetails.Address &&
          get_emp.onlineform.nextofkindetails.Address.kinaddressline2 &&
          String(get_emp.onlineform.nextofkindetails.Address.kinaddressline2) !==
            String(undefined) &&
          get_emp.onlineform.nextofkindetails.Address.kinaddressline2.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.nextofkindetails &&
          get_emp.onlineform.nextofkindetails.Address &&
          get_emp.onlineform.nextofkindetails.Address.kincity &&
          String(get_emp.onlineform.nextofkindetails.Address.kincity) !== String(undefined) &&
          get_emp.onlineform.nextofkindetails.Address.kincity.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.nextofkindetails &&
          get_emp.onlineform.nextofkindetails.Address &&
          get_emp.onlineform.nextofkindetails.Address.kinstate &&
          String(get_emp.onlineform.nextofkindetails.Address.kinstate) !== String(undefined) &&
          get_emp.onlineform.nextofkindetails.Address.kinstate.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.nextofkindetails &&
          get_emp.onlineform.nextofkindetails.Address &&
          get_emp.onlineform.nextofkindetails.Address.kinzip &&
          String(get_emp.onlineform.nextofkindetails.Address.kinzip) !== String(undefined) &&
          get_emp.onlineform.nextofkindetails.Address.kinzip.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.nextofkindetails &&
          get_emp.onlineform.nextofkindetails.Address &&
          get_emp.onlineform.nextofkindetails.Address.kincountry &&
          String(get_emp.onlineform.nextofkindetails.Address.kincountry) !== String(undefined) &&
          get_emp.onlineform.nextofkindetails.Address.kincountry.length > 0
        ) {
          count = count + 1;
        }
        /* personaldetails */

        /* personal declaration */

        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.healthdeclaration &&
          get_emp.onlineform.healthdeclaration.registereddisabled &&
          String(get_emp.onlineform.healthdeclaration.registereddisabled) !== String(undefined) &&
          get_emp.onlineform.healthdeclaration.registereddisabled.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.disable_act &&
          get_emp.onlineform.disable_act.disableAct &&
          String(get_emp.onlineform.disable_act.disableAct) !== String(undefined) &&
          get_emp.onlineform.disable_act.disableAct.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.disable_act &&
          get_emp.onlineform.disable_act.disableOverCome &&
          String(get_emp.onlineform.disable_act.disableOverCome) !== String(undefined) &&
          get_emp.onlineform.disable_act.disableOverCome.length > 0
        ) {
          count = count + 1;
        }

        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.worktimedirectives &&
          get_emp.onlineform.worktimedirectives.date &&
          String(get_emp.onlineform.worktimedirectives.date) !== String(undefined) &&
          get_emp.onlineform.worktimedirectives.date.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.worktimedirectives &&
          get_emp.onlineform.worktimedirectives.signature &&
          String(get_emp.onlineform.worktimedirectives.signature) !== String(undefined) &&
          get_emp.onlineform.worktimedirectives.signature.length > 0
        ) {
          count = count + 1;
        }

        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.healthDeclarationTerms &&
          get_emp.onlineform.healthDeclarationTerms.date &&
          String(get_emp.onlineform.healthDeclarationTerms.date) !== String(undefined) &&
          get_emp.onlineform.healthDeclarationTerms.date.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.healthDeclarationTerms &&
          get_emp.onlineform.healthDeclarationTerms.acceptHealthDeclaration &&
          String(get_emp.onlineform.healthDeclarationTerms.acceptHealthDeclaration) !==
            String(undefined) &&
          get_emp.onlineform.healthDeclarationTerms.acceptHealthDeclaration.length > 0
        ) {
          count = count + 1;
        }

        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.personalDeclarationTerms &&
          get_emp.onlineform.personalDeclarationTerms.date &&
          String(get_emp.onlineform.personalDeclarationTerms.date) !== String(undefined) &&
          get_emp.onlineform.personalDeclarationTerms.date.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.personalDeclarationTerms &&
          get_emp.onlineform.personalDeclarationTerms.acceptPersonalDeclaration &&
          String(get_emp.onlineform.personalDeclarationTerms.acceptPersonalDeclaration) !==
            String(undefined) &&
          get_emp.onlineform.personalDeclarationTerms.acceptPersonalDeclaration.length > 0
        ) {
          count = count + 1;
        }

        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.confidentialityTerms &&
          get_emp.onlineform.confidentialityTerms.date &&
          String(get_emp.onlineform.confidentialityTerms.date) !== String(undefined) &&
          get_emp.onlineform.confidentialityTerms.date.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.confidentialityTerms &&
          get_emp.onlineform.confidentialityTerms.acceptConfidentiality &&
          String(get_emp.onlineform.confidentialityTerms.acceptConfidentiality) !==
            String(undefined) &&
          get_emp.onlineform.confidentialityTerms.acceptConfidentiality.length > 0
        ) {
          count = count + 1;
        }

        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.dbsDeclaration &&
          get_emp.onlineform.dbsDeclaration.date &&
          String(get_emp.onlineform.dbsDeclaration.date) !== String(undefined) &&
          get_emp.onlineform.dbsDeclaration.date.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.dbsDeclaration &&
          get_emp.onlineform.dbsDeclaration.dbsAccept &&
          String(get_emp.onlineform.dbsDeclaration.dbsAccept) !== String(undefined) &&
          get_emp.onlineform.dbsDeclaration.dbsAccept.length > 0
        ) {
          count = count + 1;
        }

        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.criminal_records &&
          get_emp.onlineform.criminal_records.criminaloffence &&
          String(get_emp.onlineform.criminal_records.criminaloffence) !== String(undefined) &&
          get_emp.onlineform.criminal_records.criminaloffence.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.criminal_records &&
          get_emp.onlineform.criminal_records.criminalCautioned &&
          String(get_emp.onlineform.criminal_records.criminalCautioned) !== String(undefined) &&
          get_emp.onlineform.criminal_records.criminalCautioned.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.criminal_records &&
          get_emp.onlineform.criminal_records.criminalConvictions &&
          String(get_emp.onlineform.criminal_records.criminalConvictions) !== String(undefined) &&
          get_emp.onlineform.criminal_records.criminalConvictions.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.criminal_records &&
          get_emp.onlineform.criminal_records.criminalCourt &&
          String(get_emp.onlineform.criminal_records.criminalCourt) !== String(undefined) &&
          get_emp.onlineform.criminal_records.criminalCourt.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.criminal_records &&
          get_emp.onlineform.criminal_records.criminalDisciplinaryAction &&
          String(get_emp.onlineform.criminal_records.criminalDisciplinaryAction) !==
            String(undefined) &&
          get_emp.onlineform.criminal_records.criminalDisciplinaryAction.length > 0
        ) {
          count = count + 1;
        }
        /* personal declaration */

        /* Health Questionnaire */
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.gpdetails &&
          get_emp.onlineform.gpdetails.GPname &&
          String(get_emp.onlineform.gpdetails.GPname) !== String(undefined) &&
          get_emp.onlineform.gpdetails.GPname.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.gpdetails &&
          get_emp.onlineform.gpdetails.GPphone &&
          get_emp.onlineform.gpdetails.GPphone.number &&
          String(get_emp.onlineform.gpdetails.GPphone.number) !== String(undefined) &&
          get_emp.onlineform.gpdetails.GPphone.number.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.gpdetails &&
          get_emp.onlineform.gpdetails.gpaddress &&
          get_emp.onlineform.gpdetails.gpaddress.GPstreetAddress &&
          String(get_emp.onlineform.gpdetails.gpaddress.GPstreetAddress) !== String(undefined) &&
          get_emp.onlineform.gpdetails.gpaddress.GPstreetAddress.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.gpdetails &&
          get_emp.onlineform.gpdetails.gpaddress &&
          get_emp.onlineform.gpdetails.gpaddress.GPcity &&
          String(get_emp.onlineform.gpdetails.gpaddress.GPcity) !== String(undefined) &&
          get_emp.onlineform.gpdetails.gpaddress.GPcity.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.gpdetails &&
          get_emp.onlineform.gpdetails.gpaddress &&
          get_emp.onlineform.gpdetails.gpaddress.GPstate &&
          String(get_emp.onlineform.gpdetails.gpaddress.GPstate) !== String(undefined) &&
          get_emp.onlineform.gpdetails.gpaddress.GPstate.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.gpdetails &&
          get_emp.onlineform.gpdetails.gpaddress &&
          get_emp.onlineform.gpdetails.gpaddress.GPzip &&
          String(get_emp.onlineform.gpdetails.gpaddress.GPzip) !== String(undefined) &&
          get_emp.onlineform.gpdetails.gpaddress.GPzip.length > 0
        ) {
          count = count + 1;
        }

        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.immunisationhistory &&
          get_emp.onlineform.immunisationhistory.varicella &&
          String(get_emp.onlineform.immunisationhistory.varicella) !== String(undefined) &&
          get_emp.onlineform.immunisationhistory.varicella.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.immunisationhistory &&
          get_emp.onlineform.immunisationhistory.tuberculosis &&
          String(get_emp.onlineform.immunisationhistory.tuberculosis) !== String(undefined) &&
          get_emp.onlineform.immunisationhistory.tuberculosis.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.immunisationhistory &&
          get_emp.onlineform.immunisationhistory.varicella &&
          String(get_emp.onlineform.immunisationhistory.varicella) !== String(undefined) &&
          get_emp.onlineform.immunisationhistory.varicella.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.immunisationhistory &&
          get_emp.onlineform.immunisationhistory.heaf &&
          String(get_emp.onlineform.immunisationhistory.heaf) !== String(undefined) &&
          get_emp.onlineform.immunisationhistory.heaf.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.immunisationhistory &&
          get_emp.onlineform.immunisationhistory.rubella &&
          String(get_emp.onlineform.immunisationhistory.rubella) !== String(undefined) &&
          get_emp.onlineform.immunisationhistory.rubella.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.immunisationhistory &&
          get_emp.onlineform.immunisationhistory.poliomyelitis &&
          String(get_emp.onlineform.immunisationhistory.poliomyelitis) !== String(undefined) &&
          get_emp.onlineform.immunisationhistory.poliomyelitis.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.immunisationhistory &&
          get_emp.onlineform.immunisationhistory.hepatitisB &&
          String(get_emp.onlineform.immunisationhistory.hepatitisB) !== String(undefined) &&
          get_emp.onlineform.immunisationhistory.hepatitisB.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.immunisationhistory &&
          get_emp.onlineform.immunisationhistory.HIV &&
          String(get_emp.onlineform.immunisationhistory.HIV) !== String(undefined) &&
          get_emp.onlineform.immunisationhistory.HIV.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.immunisationhistory &&
          get_emp.onlineform.immunisationhistory.tetanus &&
          String(get_emp.onlineform.immunisationhistory.tetanus) !== String(undefined) &&
          get_emp.onlineform.immunisationhistory.tetanus.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.immunisationhistory &&
          get_emp.onlineform.immunisationhistory.typhoid &&
          String(get_emp.onlineform.immunisationhistory.typhoid) !== String(undefined) &&
          get_emp.onlineform.immunisationhistory.typhoid.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.immunisationhistory &&
          get_emp.onlineform.immunisationhistory.heartCirculatory &&
          String(get_emp.onlineform.immunisationhistory.heartCirculatory) !== String(undefined) &&
          get_emp.onlineform.immunisationhistory.heartCirculatory.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.immunisationhistory &&
          get_emp.onlineform.immunisationhistory.diabetes &&
          String(get_emp.onlineform.immunisationhistory.diabetes) !== String(undefined) &&
          get_emp.onlineform.immunisationhistory.diabetes.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.immunisationhistory &&
          get_emp.onlineform.immunisationhistory.asthma &&
          String(get_emp.onlineform.immunisationhistory.asthma) !== String(undefined) &&
          get_emp.onlineform.immunisationhistory.asthma.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.immunisationhistory &&
          get_emp.onlineform.immunisationhistory.bronchitis &&
          String(get_emp.onlineform.immunisationhistory.bronchitis) !== String(undefined) &&
          get_emp.onlineform.immunisationhistory.bronchitis.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.immunisationhistory &&
          get_emp.onlineform.immunisationhistory.epilepsy &&
          String(get_emp.onlineform.immunisationhistory.epilepsy) !== String(undefined) &&
          get_emp.onlineform.immunisationhistory.epilepsy.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.immunisationhistory &&
          get_emp.onlineform.immunisationhistory.headaches &&
          String(get_emp.onlineform.immunisationhistory.headaches) !== String(undefined) &&
          get_emp.onlineform.immunisationhistory.headaches.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.immunisationhistory &&
          get_emp.onlineform.immunisationhistory.psychiatric &&
          String(get_emp.onlineform.immunisationhistory.psychiatric) !== String(undefined) &&
          get_emp.onlineform.immunisationhistory.psychiatric.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.immunisationhistory &&
          get_emp.onlineform.immunisationhistory.dermatitis &&
          String(get_emp.onlineform.immunisationhistory.dermatitis) !== String(undefined) &&
          get_emp.onlineform.immunisationhistory.dermatitis.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.immunisationhistory &&
          get_emp.onlineform.immunisationhistory.backProblems &&
          String(get_emp.onlineform.immunisationhistory.backProblems) !== String(undefined) &&
          get_emp.onlineform.immunisationhistory.backProblems.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.immunisationhistory &&
          get_emp.onlineform.immunisationhistory.recurrentInfections &&
          String(get_emp.onlineform.immunisationhistory.recurrentInfections) !==
            String(undefined) &&
          get_emp.onlineform.immunisationhistory.recurrentInfections.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.immunisationhistory &&
          get_emp.onlineform.immunisationhistory.hepatitis &&
          String(get_emp.onlineform.immunisationhistory.hepatitis) !== String(undefined) &&
          get_emp.onlineform.immunisationhistory.hepatitis.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.immunisationhistory &&
          get_emp.onlineform.immunisationhistory.chickenpox &&
          String(get_emp.onlineform.immunisationhistory.chickenpox) !== String(undefined) &&
          get_emp.onlineform.immunisationhistory.chickenpox.length > 0
        ) {
          count = count + 1;
        }

        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.tuberculosis &&
          get_emp.onlineform.tuberculosis.livedUK &&
          String(get_emp.onlineform.tuberculosis.livedUK) !== String(undefined) &&
          get_emp.onlineform.tuberculosis.livedUK.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.tuberculosis &&
          get_emp.onlineform.tuberculosis.BCGvaccination &&
          String(get_emp.onlineform.tuberculosis.BCGvaccination) !== String(undefined) &&
          get_emp.onlineform.tuberculosis.BCGvaccination.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.tuberculosis &&
          get_emp.onlineform.tuberculosis.cough &&
          String(get_emp.onlineform.tuberculosis.cough) !== String(undefined) &&
          get_emp.onlineform.tuberculosis.cough.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.tuberculosis &&
          get_emp.onlineform.tuberculosis.weightloss &&
          String(get_emp.onlineform.tuberculosis.weightloss) !== String(undefined) &&
          get_emp.onlineform.tuberculosis.weightloss.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.tuberculosis &&
          get_emp.onlineform.tuberculosis.fever &&
          String(get_emp.onlineform.tuberculosis.fever) !== String(undefined) &&
          get_emp.onlineform.tuberculosis.fever.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.tuberculosis &&
          get_emp.onlineform.tuberculosis.TB &&
          String(get_emp.onlineform.tuberculosis.TB) !== String(undefined) &&
          get_emp.onlineform.tuberculosis.TB.length > 0
        ) {
          count = count + 1;
        }

        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.medicalhistory &&
          get_emp.onlineform.medicalhistory.medicalillness &&
          String(get_emp.onlineform.medicalhistory.medicalillness) !== String(undefined) &&
          get_emp.onlineform.medicalhistory.medicalillness.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.medicalhistory &&
          get_emp.onlineform.medicalhistory.leaveforneckinjury &&
          String(get_emp.onlineform.medicalhistory.medicalillnesscaused) !== String(undefined) &&
          get_emp.onlineform.medicalhistory.medicalillnesscaused.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.medicalhistory &&
          get_emp.onlineform.medicalhistory.treatment &&
          String(get_emp.onlineform.medicalhistory.treatment) !== String(undefined) &&
          get_emp.onlineform.medicalhistory.treatment.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.medicalhistory &&
          get_emp.onlineform.medicalhistory.needanyadjustments &&
          String(get_emp.onlineform.medicalhistory.needanyadjustments) !== String(undefined) &&
          get_emp.onlineform.medicalhistory.needanyadjustments.length > 0
        ) {
          count = count + 1;
        }

        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.healthdeclaration &&
          get_emp.onlineform.healthdeclaration.sufferedlongtermillness &&
          String(get_emp.onlineform.healthdeclaration.sufferedlongtermillness) !==
            String(undefined) &&
          get_emp.onlineform.healthdeclaration.sufferedlongtermillness.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.healthdeclaration &&
          get_emp.onlineform.healthdeclaration.medicalillnesscaused &&
          String(get_emp.onlineform.healthdeclaration.leaveforneckinjury) !== String(undefined) &&
          get_emp.onlineform.healthdeclaration.leaveforneckinjury.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.healthdeclaration &&
          get_emp.onlineform.healthdeclaration.neckinjuries &&
          String(get_emp.onlineform.healthdeclaration.neckinjuries) !== String(undefined) &&
          get_emp.onlineform.healthdeclaration.neckinjuries.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.healthdeclaration &&
          get_emp.onlineform.healthdeclaration.sixweeksillness &&
          String(get_emp.onlineform.healthdeclaration.sixweeksillness) !== String(undefined) &&
          get_emp.onlineform.healthdeclaration.sixweeksillness.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.healthdeclaration &&
          get_emp.onlineform.healthdeclaration.communicabledisease &&
          String(get_emp.onlineform.healthdeclaration.communicabledisease) !== String(undefined) &&
          get_emp.onlineform.healthdeclaration.communicabledisease.length > 0
        ) {
          count = count + 1;
        }
        if (
          get_emp &&
          get_emp.onlineform &&
          get_emp.onlineform.healthdeclaration &&
          get_emp.onlineform.healthdeclaration.medicalattention &&
          String(get_emp.onlineform.healthdeclaration.medicalattention) !== String(undefined) &&
          get_emp.onlineform.healthdeclaration.medicalattention.length > 0
        ) {
          count = count + 1;
        }
        /* Health Questionnaire */
        avg = (count / total) * 100;
        percentage = 100 - Math.round(avg);
        let obj = {};
        obj['total_percentage'] = Math.round(avg);
        obj['remaining_percentage'] = Math.round(percentage);
        let update = await UpdateDoc(employees, { _id: ObjectId(req._id) }, obj, {});
        if (
          obj['total_percentage'] >= 95 &&
          req.agencyID &&
          isObjectId(req.agencyID) &&
          req.protocol &&
          req.protocol.length > 0 &&
          String(req.protocol) !== String(undefined) &&
          String(req.protocol) !== String(null) &&
          String(get_emp.confirmation_mail_sent) === String('false')
        ) {
          event.emit(
            'send_email_and_notify',
            {
              _id: ObjectId(req._id),
              agencyID: req.agencyID,
              port: req.port,
              hostname: req.hostname,
              protocol: req.protocol,
            },
            (err, cb) => {}
          );
        }
        return;
      } else {
        return;
      }
    } else {
      return;
    }
  } catch (error) {
    console.log(`error in calculate_percentage ${error}`);
    return;
  }
};

let dlete_contact_list_by_emp = async (req) => {
  try {
    if (req && req._id && isObjectId(req._id) && req.agency && isObjectId(req.agency)) {
      let query = { agency: ObjectId(req.agency), employee: ObjectId(req._id) };
      let deleted_many = await DeleteManyDoccs(agency_contact_list, query);
      return true;
    } else {
      console.log(`no records found in dlete_contact_list_by_emp`);
      return true;
    }
  } catch (error) {
    console.log(`error in dlete_contact_list_by_emp ${error}`);
    return true;
  }
};

let add_update_contact_list_by_emp = async (req) => {
  try {
    if (req && req._id && isObjectId(req._id) && req.agency && isObjectId(req.agency)) {
      let query = { agency: ObjectId(req.agency), employee: ObjectId(req._id) };
      let check = await GetDocs(agency_contact_list, query, { _id: 1 }, {});
      if (check && checkArray(check) && check.length === 0) {
        let get_agency = await GetOneDoc(
          agencies,
          { _id: ObjectId(req.agency) },
          { _id: 1, company_name: 1 },
          {}
        );
        if (get_agency && get_agency._id) {
          let get_emp = await GetOneDoc(
            employees,
            { _id: ObjectId(req._id) },
            {
              _id: 1,
              phone: 1,
              surname: 1,
              name: 1,
              email: 1,
              locations_name: 1,
              job_type_name: 1,
            },
            {}
          );
          if (get_emp && get_emp._id) {
            let obj = {};
            obj['agency'] = ObjectId(req.agency);
            obj['employee'] = ObjectId(req._id);
            obj['phone.code'] = _.get(get_emp, 'phone.code', '');
            obj['phone.number'] = _.get(get_emp, 'phone.number', '');
            obj['phone.dailcountry'] = _.get(get_emp, 'phone.dailcountry', 'gb');
            obj['first_name'] = _.get(get_emp, 'name', '');
            obj['last_name'] = _.get(get_emp, 'surname', '');
            obj['email'] = _.get(get_emp, 'email', '');
            obj['companyname'] = _.get(get_agency, 'company_name', '');
            obj['type'] = 'Employee';
            if (
              get_emp &&
              get_emp.job_type_name &&
              checkArray(get_emp.job_type_name) &&
              get_emp.job_type_name.length > 0
            ) {
              obj['job_roles'] = [...get_emp.job_type_name].map((item) => item).join(',');
            }
            if (
              get_emp &&
              get_emp.locations_name &&
              checkArray(get_emp.locations_name) &&
              get_emp.locations_name.length > 0
            ) {
              obj['locations'] = [...get_emp.locations_name].map((item) => item).join(',');
            }
            let insert = await InsertDoc(agency_contact_list, obj);
            return true;
          } else {
            return true;
          }
        } else {
          return true;
        }
      } else {
        let get_agency = await GetOneDoc(
          agencies,
          { _id: ObjectId(req.agency) },
          { _id: 1, company_name: 1 },
          {}
        );
        if (get_agency && get_agency._id) {
          let get_emp = await GetOneDoc(
            employees,
            { _id: ObjectId(req._id) },
            {
              _id: 1,
              phone: 1,
              surname: 1,
              name: 1,
              email: 1,
              locations_name: 1,
              job_type_name: 1,
            },
            {}
          );
          if (get_emp && get_emp._id) {
            let obj = {};
            obj['agency'] = ObjectId(req.agency);
            obj['employee'] = ObjectId(req._id);
            obj['phone.code'] = _.get(get_emp, 'phone.code', '');
            obj['phone.number'] = _.get(get_emp, 'phone.number', '');
            obj['phone.dailcountry'] = _.get(get_emp, 'phone.dailcountry', 'gb');
            obj['first_name'] = _.get(get_emp, 'name', '');
            obj['last_name'] = _.get(get_emp, 'surname', '');
            obj['email'] = _.get(get_emp, 'email', '');
            obj['companyname'] = _.get(get_agency, 'company_name', '');
            if (
              get_emp &&
              get_emp.job_type_name &&
              checkArray(get_emp.job_type_name) &&
              get_emp.job_type_name.length > 0
            ) {
              obj['job_roles'] = [...get_emp.job_type_name].map((item) => item).join(',');
            }
            if (
              get_emp &&
              get_emp.locations_name &&
              checkArray(get_emp.locations_name) &&
              get_emp.locations_name.length > 0
            ) {
              obj['locations'] = [...get_emp.locations_name].map((item) => item).join(',');
            }
            let ids = [...check].map((item) => ObjectId(item._id));
            let update = await UpdateManyDoc(agency_contact_list, { _id: ids }, obj, {
              multi: true,
            });
            return true;
          } else {
            return true;
          }
        } else {
          return true;
        }
      }
    } else {
      console.log(`no records found in add_update_contact_list_by_emp`);
      return true;
    }
  } catch (error) {
    console.log(`error in add_update_contact_list_by_emp ${error}`);
    return true;
  }
};

module.exports = {
  append_zero,
  update_emmp_incidents,
  update_emp_name,
  generatePassword,
  get_hours_from_secs,
  get_minutes_from_secs,
  get_hours_from_secs_format,
  get_minutes_from_secs_format,
  getadd_days_date,
  getadd_days_timestamp,
  additional_getadd_days_date,
  additional_getadd_days_timestamp,
  days_Difference,
  isObjectId,
  ObjectId,
  error_msg,
  not_update_msg,
  update_msg,
  required_msg,
  no_data,
  delete_msg,
  restore_msg,
  not_restore_msg,
  not_delete_msg,
  msg_no_data,
  randomString,
  added_msg,
  not_added_msg,
  timelist,
  checkArray,
  GetHours,
  GetMinutes,
  not_valid_msg,
  compare_fun,
  update_lats_shift,
  emp_hours_working_rating,
  emp_location,
  emp_jobtype,
  update_shifts_comp_name,
  insert_job_type_location_company_name,
  update_job_type_location_company_name,
  Update_name_agency_todo,
  PrefixString,
  capitalize,
  check_and_delete,
  calculate_percentage,
  dlete_contact_list_by_emp,
  add_update_contact_list_by_emp,
};
