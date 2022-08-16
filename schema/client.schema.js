var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var USER_SCHEMA = {};
USER_SCHEMA.USER = {
  userID: String,
  phone_otp: String,
  registered_date: Date,
  registeration_fees: Number,
  dob: String,
  photo: { type: String, default: '' },
  company_logo: { type: String, default: '' },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  }, // unique
  mobile: {
    number: String,
    code: String,
    dialcountry: String,
  },
  phone: {
    number: String,
    code: String,
    dialcountry: String,
  },
  otp: Number /* 6 digits */,
  otp_timestamp: Number /* add 5 mins with current timestamp */,
  otp_verified: Number,
  assignee: {
    type: mongoose.Schema.ObjectId,
    ref: 'sub_admin',
  },
  assignee_name: String,
  passwordResetUID: String,
  activity: {
    signup: Number,
    signin: Number,
    signout: Number,
  },
  type: { type: [String], default: '' },
  stage: { type: String, default: '' },
  office_phone: { type: String, default: '' },
  company_name: { type: String, default: '' },
  company_details: {
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    website: { type: String, default: '' },
    social_media: {
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' },
    },
  },
  status: { type: Number, default: 1, required: true },
  first_name: { type: String, default: '' },
  surname: { type: String, default: '' },
  gender: { type: String, default: '' },
  password: { type: String, default: '' }, //select: false
  agree_terms: Boolean,
  customer_ID: { type: String, default: '' },
  address: {
    line1: { type: String, default: '' },
    line2: { type: String, default: '' },
    state: { type: String, default: '' },
    stateValue: [],
    city: { type: String, default: '' },
    cityValue: [],
    country: { type: String, default: '' },
    zip: { type: String, default: '' },
    postal_code: { type: String, default: '' },
    formatted_address: { type: String, default: '' }, // Just used to fix the issues for already available client to not clash with this
    lat: { type: String, default: '' },
    lng: { type: String, default: '' },
  },
  billing_address: [
    {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      status: { type: Number, default: 1 },
      line1: { type: String, default: '' },
      line2: { type: String, default: '' },
      state: { type: String, default: '' },
      city: { type: String, default: '' },
      country: { type: String, default: '' },
      postal_code: { type: String, default: '' },
      formatted_address: { type: String, default: '' }, // Just used to fix the issues for already available client to not clash with this
      lat: { type: String, default: '' },
      lng: { type: String, default: '' },
    },
  ],
  shipping_address: [
    {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      status: { type: Number, default: 1 },
      line1: { type: String, default: '' },
      line2: { type: String, default: '' },
      state: { type: String, default: '' },
      city: { type: String, default: '' },
      country: { type: String, default: '' },
      postal_code: { type: String, default: '' },
      formatted_address: { type: String, default: '' }, // Just used to fix the issues for already available client to not clash with this
      lat: { type: String, default: '' },
      lng: { type: String, default: '' },
    },
  ],
  apps: {
    type: [Schema.ObjectId],
    ref: 'client_apps',
  },
  notes: [
    {
      title: { type: String, default: '' },
      note: { type: String, default: '' },
    },
  ],
  credits: {
    type: [
      {
        name: { type: String, required: true },
        creditsValue: { type: Number, required: true },
        category: {
          id: { type: Schema.ObjectId, required: true },
          name: { type: String, required: true },
        },
      },
    ],
    default: [],
  },
  other_links: {
    pipedrive: {
      type: String,
      default: '',
    },
    teamwork: {
      type: String,
      default: '',
    },
    companiesHouse: {
      type: String,
      default: '',
    },
  },
  location: String,
  region: String,
  tenderDetails: {
    locations: [String],
    regions: [String],
    service: String,
    type: {
      type: String,
      enum: ['REGULATED', 'UNREGULATED'],
    },
  },
  propertyDetails: {
    locations: [String],
    regions: [String],
    type: {
      type: String,
      enum: ['HMO', 'NON'],
    },
    noOfBedrooms: Number,
  },
};
module.exports = USER_SCHEMA;
