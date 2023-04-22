const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
function sendEmail(toEmail  , message){
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'bloodmitr@gmail.com',
            pass: 'fawfrcjlrdigjxqe'
        }
    });
    const mailOptions = {
        from: '"Blood Mitr" <bloodmitr@gmail.com>', // sender address
        to: toEmail, // list of receivers
        subject: 'EMERGENCY DONOR REQUIRED', // Subject line
        text: message, // plain text body
        html:message // html body
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: %s', info.messageId);
        }
    });
}

module.exports = sendEmail;
// setup email data with unicode symbols


// send mail with defined transport object
