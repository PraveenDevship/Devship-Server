var multer = require('multer');
var fs = require('fs');
var db = require('../controller/db_adaptor/mongodb.js');
var Json2csvParser = require('json2csv').Parser;
var json2xls = require('json2xls');

var commonUpload = (destinationPath) => {
  var storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, destinationPath);
    },
    filename: function (req, file, callback) {
      var uploadName = file.originalname.split('.');
      var extension = '.' + uploadName[uploadName.length - 1];
      var mask = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      var result = '';
      for (var i = 5; i > 0; --i)
        result = `${result}${mask[Math.floor(Math.random() * mask.length)]}`;
      var fileName = `${result}${Date.now().toString()}`;
      fs.readFile(destinationPath + file.originalname, function (err, res) {
        if (!err) {
          callback(null, fileName + extension);
        } else {
          callback(null, fileName + extension);
        }
      });
    },
  });
  var uploaded = multer({ storage: storage }); /**----{limits : {fieldNameSize : 100}}---*/
  return uploaded;
};

var bulkexport = async (data, callback) => {
  var respo = {};
  respo.status = 0;
  try {
    let filename = data.file_name + Date.now();
    let fileType = data.format;
    let filenamePath = `uploads/csv/employee/${filename}.${fileType}`;
    let count = data.limit;
    let initial_skip = data.skip;
    var exceldata = [];
    if (typeof data.count_collection != 'undefined' && data.type == 'all') {
      count = await db.GetCount(data.count_collection, data.matchquery);
    } else if (data.type == 'all') {
      count = await db.GetCount(data.collection, data.matchquery);
    }
    if (count > 0) {
      var eachrun = 1000;
      if (data.type == 'page' && eachrun > data.limit) {
        eachrun = data.limit;
      }
      var loop = Math.ceil(count / eachrun);
      var loopcount = 1;
      var exportlist = [];
      var table_head = '';
      var table_data = '';
      async.whilst(
        (cb) => {
          cb(null, loopcount <= loop);
        },
        (asyncallback) => {
          var limit = eachrun;
          var skip = initial_skip + (eachrun * loopcount - eachrun);
          if (data.type == 'all') {
            skip = eachrun * loopcount - eachrun;
          }
          var query = [...data.query1, ...[{ $skip: skip }, { $limit: limit }], ...data.query2];
          var fechdata = async () => {
            let list = await db.GetAggregation(data.collection, query);
            if (list && list.length > 0) {
              if (data.format == 'csv') {
                if (fs.existsSync(filenamePath)) {
                  const parser = new Json2csvParser({ fields: data.csv, header: false });
                  const csv = parser.parse(list);
                  fs.appendFile(filenamePath, csv + '\r\n', function (err) {
                    loopcount++;
                    asyncallback(null, loopcount);
                  });
                } else {
                  const parser = new Json2csvParser({ fields: data.csv });
                  const csv = parser.parse(list);
                  fs.writeFile(filenamePath, csv + '\r\n', function (err) {
                    loopcount++;
                    asyncallback(null, loopcount);
                  });
                }
              } else if (data.format == 'xlsx') {
                exceldata = [...exceldata, ...list];
                loopcount++;
                asyncallback(null, loopcount);
              } else {
                list.map(function (content, i) {
                  table_data = `${table_data}<tr >`;
                  data.csv.map(function (header, j) {
                    if (j == data.csv.length - 1) {
                      table_data = `${table_data}<td align="center"><span style="color: black;text-transform: capitalize;font-size:${
                        data.font
                      }; line-height:30px;">${
                        content[header.value] == '' ? '-' : content[header.value]
                      }</span></td></tr>`;
                    } else {
                      table_data = `${table_data}<td align="center"><span style="color: black;text-transform: capitalize;font-size:${
                        data.font
                      }; line-height:30px;">${
                        content[header.value] == '' ? '-' : content[header.value]
                      }</span></td>`;
                    }
                  });
                });
                loopcount++;
                asyncallback(null, loopcount);
              }
            } else {
              loopcount++;
              asyncallback(null, loopcount);
            }
          };
          fechdata();
        },
        () => {
          if (data.format == 'pdf') {
            data.csv.map(function (header, index) {
              table_head = `${table_head}<th><span align="center" style="color: black;font-weight: 700;text-transform: capitalize;font-size:${data.font}; line-height:30px;">${header.label}</span></th>`;
            });
            var table = `<table style="margin: 0; padding: 0; color: #000; background: #FAFAFA; padding-top: 40px; padding-bottom: 40px; font-family: Nunito,sans-serif;" border="0"  cellspacing="0" cellpadding="0" ><tbody><tr><td><table style="margin: 0px auto; border-spacing: 0; border-collapse: initial; width: ${data.width}; background: #fff;" class="full-widths;"><tbody><tr><td><table style="margin: 0px auto; border-spacing: 0; border-collapse: initial; width: ${data.width}; background: #4D4948;" class="full-widths;"><tbody><tr><td height="20"></td></tr><tr><td align="center" style="color:#fff; font-size:${data.title_font};">${data.file_head}</td></tr><tr><td height="20"></td></tr></tbody></table></td></tr><tr><td height="20"></td></tr><tr><td><table border="1" style="margin: 0px auto; border-spacing: 0; border-collapse: initial; width:${data.width}; border-color:#eee;" class="full-widths;"><tbody><tr >${table_head}</tr>${table_data}</tbody></table></td></tr><tr><td style="height:20px"></td></tr></tbody></table></td></tr></tbody></table>`;
            var pdf = require('html-pdf');
            var options = { format: 'A4' };
            pdf.create(table, options).toFile(filenamePath, function (err, resp) {
              if (err) {
                respo.message = 'Unable to Export';
                callback(null, respo);
              } else {
                respo.status = 1;
                respo.message = 'success';
                respo.list = exportlist;
                respo.path = filenamePath;
                respo.csv = data.csv;
                callback(null, respo);
              }
            });
          } else if (data.format == 'xlsx') {
            var xls = json2xls(exceldata, {
              fields: data.excel,
            });
            fs.writeFileSync(filenamePath, xls, 'binary');
            respo.status = 1;
            respo.message = 'success';
            respo.list = exportlist;
            respo.path = filenamePath;
            respo.csv = data.csv;
            callback(null, respo);
          } else {
            respo.status = 1;
            respo.message = 'success';
            respo.list = exportlist;
            respo.path = filenamePath;
            respo.csv = data.csv;
            callback(null, respo);
          }
        }
      );
    } else {
      respo.message = 'Unable to Export';
      callback(null, respo);
    }
  } catch (err) {
    respo.message = 'Unable to Export';
    callback(err, respo);
  }
};

module.exports = {
  commonUpload: commonUpload,
  bulkexport: bulkexport,
};
