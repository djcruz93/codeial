const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');
const env = require('./environment');

const transporter = nodemailer.createTransport(env.smtp);

let renderTemplate = function(data, relativePath){
    let mailHTML;
    ejs.renderFile(
        path.join(__dirname, '../views/mailers', relativePath),
        data,
        function(err, newTemplate){
            if(err){
                console.log('Error in rendering email template ::', err);
                return;
            }
            mailHTML = newTemplate;
        }
    )
    return mailHTML;
}

module.exports = {
    transporter: transporter,
    renderTemplate: renderTemplate
}