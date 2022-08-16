var path = require('path');
var fs = require('fs');

var config = JSON.parse(fs.readFileSync(path.join(__dirname, '/config.json'), 'utf8'));

var CONFIG = {};
CONFIG.ENV = process.env.NODE_ENV || 'development';
CONFIG.PORT = process.env.VCAP_APP_PORT || config.port;
CONFIG.DB_URL =
  'mongodb://' + config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.database;
CONFIG.MOBILE_API = true; // true & false

// CONFIG.SECRET_KEY = '16f198404de4bb7b994f16b84e30f14f';

/***** FileUpload path */



// Images

CONFIG.DIRECTORY_ADMIN_PRODUCT = "./uploads/images/product/"


CONFIG.DIRECTORY_ADMIN_UNIFORM = './uploads/images/shop/uniform/';
CONFIG.DIRECTORY_CLIENT_IDCARD = './uploads/images/shop/idcard/';
CONFIG.DIRECTORY_CLIENT_SHOP_BANNER = './uploads/images/shop/banner/';
CONFIG.DIRECTORY_CLIENT_UNIFORM_PHOTO = './uploads/images/shop/uniform/photo/';
CONFIG.DIRECTORY_CLIENT_LEAFLET_PHOTO = './uploads/images/shop/leaflet/';
CONFIG.DIRECTORY_CLIENT_BUISNESSCARDS_PHOTO = './uploads/images/shop/buisness-cards/';
CONFIG.DIRECTORY_CLIENT_CATEGORIES_PHOTO = './uploads/images/shop/categories/';
CONFIG.DIRECTORY_CLIENT_PRODUCTS_PHOTO = './uploads/images/shop/products/';
CONFIG.DIRECTORY_CLIENT_UNIFORM_COMPANYLOGO = './uploads/images/shop/uniform/companylogo/';
CONFIG.DIRECTORY_USER_PHOTO = './uploads/images/user/photo/';
CONFIG.DIRECTORY_USER_APPS_PHOTO = './uploads/images/admin/settings/client-apps/';
CONFIG.DIRECTORY_SUBADMIN_PHOTO = './uploads/images/subadmin/photo/';

CONFIG.DIRECTORY_USER_SIGNATURE = './uploads/images/user/documents/signature/';
CONFIG.DIRECTORY_USER_SPOUSE = './uploads/images/user/spouse/documents/';
CONFIG.DIRECTORY_SUBJECT = './uploads/images/subject/';
CONFIG.DIRECTORY_CHAPTER = './uploads/images/chapter/';
CONFIG.DIRECTORY_IMPORT = './uploads/import/';
CONFIG.DIRECTORY_ARTICLE = './uploads/images/article/';
CONFIG.DIRECTORY_MCQ = './uploads/images/mcq';
CONFIG.DIRECTORY_CFB = './uploads/contentfb/';
CONFIG.DIRECTORY_PUSH = './uploads/images/push/';

CONFIG.DIRECTORY_ADMIN_TESTIMONIALS = './uploads/images/admin/testimonials/';

CONFIG.DIRECTORIES = './uploads/images/admin/directories/photo/';

/***** FileUpload path */

// PDFs
CONFIG.DIRECTORY_ADMIN_PACKAGES = './uploads/pdf/packages/brochures/';
CONFIG.DIRECTORY_ADMIN_TRAINING_DOCUMENTS = './uploads/pdf/training/documents/';

// Docs
CONFIG.DIRECTORY_ADMIN_UPDATES_DOCUMENTS = './uploads/docs/admin/updates/';

CONFIG.TENDER_STATUS_DOCS = './uploads/docs/tender/statuslogs/';
CONFIG.TENDER_NOTE_DOCS = './uploads/docs/tender/note-docs/';

// Default paths
CONFIG.DEFAULT_PROFILE_IMAGE = 'uploads/images/others/defaultuser.jpg';
CONFIG.DEFAULT_SUBJ_IMAGE = 'uploads/images/others/defaultbook.png';
CONFIG.DEFAULT_CHPT_IMAGE = 'uploads/images/others/defaultchapter.png';
CONFIG.DEFAULT_EXAM_IMAGE = 'uploads/images/others/defaultexam.png';

/***** FileUpload path */

CONFIG.GOOGLE_MAP_API_KEY = 'AIzaSyBWIomenTvO9o1V8ZfCbQBXV_UG9iDcNsg';

CONFIG.GCM_KEY_USER =
  'AAAAHIsO0js:APA91bGT3cHVUVFNGzQXLa3sgtDLfnDHSr43FOc1FXopve2XC4AjpIntxGPDx2fykLpLVuVZHBUy0aSNOJ1sOZKhcigiBFQ4Ax0ggSxWW7qzVdIAV0UwDWfjmr0bGAp92RWfL2ZH-tsE';
CONFIG.GCM_KEY_DRIVERS =
  'AAAApaN-9JM:APA91bH2L8CMyHY08rihENhcxwAgGWPDxYwc4AhqsB7vmF6x0J6Z7YPtFUSGRv9I39zj3tc_6qw3VeIJhmY38xaiHWuvEzVVn-WaDDmsmdbK72tt_TOih1h5CjaVUQbNBZrDSz_K4jG-';
CONFIG.GCM_KEY_RESTAURANT =
  'AAAAS3NjM8g:APA91bGXxsfihhDWzTOWhDwugub0YwwxsW_cCBW2Iy26D7f0WoWlcL3O0PiA68U4s_s5hKq8XFAQRMa3Q7uOiNyFiNu3O5KwykYvABRrIoR-cgbcMQh1fSuwC2EmJ67FTne1eld2xxbY';

// Notifications
CONFIG.NOTIFICATION = {};

CONFIG.APNS = {};
/* CONFIG.APNS.MODE = false; // Production = true or Development = false
CONFIG.APNS.BUNDLE_ID_USER = 'com.dinedoo.user';
CONFIG.APNS.CERT_USER = path.join(__dirname, "/apns/readyuser.pem");
CONFIG.APNS.KEY = path.join(__dirname, "/apns/readyuser.pem"); */

CONFIG.SECRET_KEY = '16f198404de4bb7b994f16b84e30f14f';

CONFIG.GLOBAL = {};

module.exports = CONFIG;
