const { GetOneDocument } = require('../controller/db_adaptor/mongodb');

var stripe = async () => {
  let settingsData = await GetOneDocument(
    'settings',
    { alias: 'payment_gateway' },
    { 'settings.stripe': 1 },
    {}
  );

  if (settingsData !== null) {
    const { settings } = settingsData;
    console.log('settings', settings);

    if (settings.stripe.status === 1) {
      console.log('true');
      const obj = {};
      if (settings.stripe.mode === 'Production') {
        obj.apiKey = settings.stripe.secret_key;
        let stripe = require('stripe')(settings.stripe.secret_key);

        return stripe;
      }
      if (settings.stripe.mode === 'Development') {
        obj.apiKey = settings.stripe.secret_key_development;
        let stripe = require('stripe')(settings.stripe.secret_key_development);

        return stripe;
      }
    } else {
      return false;
    }
  }
};

module.exports = {
  stripe,
};
