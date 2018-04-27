'use strict';
var promise = require('bluebird');
const nodemailer = require('nodemailer');
const PassThrough = require('stream').PassThrough;
const { Writable } = require('stream');
const request = require('request');
const md5 = require('md5');
var csv_stringify = require('csv-stringify');
const tableify = require('tableify');

var emailParameters = require('../config.json');

//function to convert json to csv
function createCsvString(jsonMessage){
  var newLine = "\n" ;
  var sep = "," ;
  //get headers
  var headers = Object.keys(jsonMessage[0]) ;
  var csvString = '"' + headers.join('"' + sep + '"') + '"' + newLine;
  //iterate by row
  jsonMessage.forEach(function(r){
    headers.forEach(function(h){
      csvString = csvString + '"' + r[h] + '"' + sep ;
    }) ;
    //omit last sep, add new line
    csvString = csvString.slice(0,-1 * sep.length) + newLine ;
  })
  csvString = csvString.slice(0,-1 * newLine.length) ;
  return(csvString);
}
;

//function to get email transporter
function sendHtmlEmail(mailOptions){
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  nodemailer.createTestAccount((err, account) => {
      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
          host: emailParameters.smtpHost,
          port: emailParameters.smtpPort,
          secure: emailParameters.smtpSecure, // true for 465, false for other ports
          auth: {
              user:emailParameters.emailUser,
              pass:emailParameters.emailPassword
          },
          tls: {
            rejectUnauthorized: false,
            secure:true
          }
      });
      // send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              return console.log(error);
          }
          console.log('Message sent: %s', info.messageId);
          // Preview only available when sending through an Ethereal account
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

          // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
          // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
      });
  });
};

function formatMailOptions(inputJson){
  // create variables
  //var html = '' ;
  var html = new PassThrough();
  var attachments = [] ;
  //validate inputs
  //var from = inputJson.from ;
  var from = emailParameters.emailFrom;
  if(from == null){
    from = emailParameters.emailUser;
  }
  ;
  var to = inputJson.to ;
  var subject = inputJson.subject ;
  var email_body = inputJson.body ;
  email_body.forEach(function(b){
    if(b.type=='image'){ //image attachments
      //download image
      var nameOfAttachment = b.name;
      var imageUrlStream = new PassThrough();
      request.get({
                   url: b.link
          }).on('error', function(err) {
                   // I should consider adding additional logic for handling errors here
                   console.log('error', err);
          }).pipe(imageUrlStream);
      ;
      var image_cid = md5(b.name + b.link) ;
      attachments.push({
        filename:nameOfAttachment,
        content:imageUrlStream,
        cid:image_cid
      });
      if(b.embedded){
        //html = html + '<img src="cid:' + image_cid + '">';
        html.write('<img src="cid:' + image_cid + '">')
      };
    } else if (b.type=='csv') { //csv attachments
      var csvStream = new PassThrough();
      var nameOfAttachment = b.name;
      var requestBody = '';
      request.get({
                   url: b.link
          }).on('error', function(err) {
                   // I should consider adding additional logic for handling errors here
                   console.log('error', err);
          }).on('data', function(body){
            requestBody = requestBody + body;
            //csvStream.write(createCsvString(body)) ;
            //csvStream.end();
          }).on('end',function(){
            console.log(requestBody);
            csvStream.write(createCsvString(JSON.parse(requestBody))) ;
            csvStream.end();
          })
      ;
      attachments.push({
        filename:nameOfAttachment,
        content:csvStream
      })
      ;
    } else {    //treat everything else as text
      //html = html + '<p>' + b.body + '</p>' ;
      html.write('<p>' + b.body + '</p>');
    }
  })
  ;
  html.end();
  return({
     from: from, // sender address
     to: to, // list of receivers
     subject: subject, // Subject line
     //text: 'Hello world?', // plain text body
     html: html,
     attachments: attachments
  });
}
;


//function to handle request
function sendRequestEmail(req,res,next){
  var emailReq = req.body ;
  sendHtmlEmail(formatMailOptions(emailReq)) ;
  res.status(200)
      .json({
        status:"success",
        message:"Sent email"
  });
}
;

module.exports = {
  sendRequestEmail:sendRequestEmail
};
