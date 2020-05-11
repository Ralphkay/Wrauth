'use strict';
const nodemailer = require("nodemailer");
const {defaultConfigOptions} = require ('./config');

// async..await is not allowed in global scope, must use a wrapper
async function sendmail (subject, message, receiver) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount ();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport ({
    host: defaultConfigOptions.SMTP.HOST,
    port: defaultConfigOptions.SMTP.PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: defaultConfigOptions.SMTP.USER, // generated ethereal user
      pass: defaultConfigOptions.SMTP.PASSWORD, // generated ethereal password
    },
  });
  const sender = defaultConfigOptions.emailCredentials.SENDER;
  const senderAddress = defaultConfigOptions.emailCredentials.SENDER_ADDRESS;
  console.log ("Email Sent!", sender, senderAddress);
  // send mail with defined transport object
  let info = await transporter.sendMail ({
    from: `"${sender}" <${senderAddress}>`,
    to: receiver, // list of receivers
    subject: subject, // Subject line
    text: message,
    // html: message, // html body
  });

  console.log ('Message sent: %s', info.messageId);
}

module.exports = sendmail;
