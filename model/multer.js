// const multer = require('multer');

// var Photo = async (upload) => {
// 	try {

//         const Storage = multer.diskStorage({
//             destination: (req, res, cb) => {
//                 cb(null, 'uploads')
//             },
//             filename: (req, file, cb) => {
//                 cb(null, file.originalname);
//             }
//         });

// 	} catch (err) {
// 		console.log(err)
// 	}

//     const upload = multer({ storage: Storage }).single("photo")
// }

// module.exports = {
//     upload : upload
// }