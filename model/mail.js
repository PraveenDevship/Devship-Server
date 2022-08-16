"use strict"

var nodemailer = require('nodemailer');
var db = require('../controller/db_adaptor/mongodb.js');

var send = async ( email, subject, text) => {
	try {
		// let settings = await db.GetOneDocument('settings', { 'alias': 'smtp' }, {}, {});
		// if (settings && typeof settings.settings != "undefined" && settings.settings != "" && settings.settings.mode == 'production') {
		// var smtp_host = "smtp.gmail.com";
		// var smtp_port = 465;
		// var smtp_username = "praveenstark77@gmail.com";
		// var smtp_password = "sggmpzftxjezxzns"; //

		
		// var transporter = nodemailer.createTransport({
		// 	host: smtp_host,
		// 	port: smtp_port,
		// 	secure: true,
		// 	auth: {
		// 		user: smtp_username,
		// 		pass: smtp_password
		// 	},
		// 	tls: {
		// 		rejectUnauthorized: false
		// 	}
		// });
		// transporter.sendMail(data, (error, info) => {
		// 	callback(error, info, { mode: 2 });
		// 	});

		//   await transporter.sendMail ({
		// 	from: "praveenstark77@gmail.com",
		// 	to: email,
		// 	subject: subject,
		// 	text: text,
		//  })


		// } else {
		// 	callback(null, null, { mode: 4 });
		// }


		const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            service: "gmail",
            port: 587,
            secure: true,
            auth: {
                user: "praveenstark77@gmail.com",
                pass: "qbqnpyfuaxrpbgrr",
            },
        });

        await transporter.sendMail({
            from: "praveenstark77@gmail.com",
            to: email,
            subject: subject,
            text: text,
        });

	} catch (err) {
		// callback(err, null, { mode: 3 });
		console.log(err)
	}
}

module.exports = send
