var express = require('express');
var fs = require('fs');
var parse = require('csv-parse');
var async = require('async');

var Customer = require('./models/customer');


var app = express();
var bodyParser = require('body-parser');
const path = require('path');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/lager');

console.log("refreshing DB");

//mongoose.disconnect();

// CUSTOMER FIELDS
//custno,firstName,lastName,phone,cell,email,company,address1,address2,
//address3,city,state,zip,shipaddress1,shipaddress2,shipaddress3,shipCity,
//shipState,shipZip,displayName,lastUpdated




var inputFile='data/CustomersSample.txt';

var parser = parse({delimiter: ','}, function (err, data) {
  async.eachSeries(data, function (line, callback) {
    // do something with the line
    doSomething(line).then(function() {
      // when processing finishes invoke the callback to move to the next one
      callback();
    });
  })
});
fs.createReadStream(inputFile).pipe(parser);




function doSomething(line){
  //console.log("line is "+ line);





  // CUSTOMER FIELDS
  //custno,firstName,lastName,phone,cell,email,company,address1,address2,
  //address3,city,state,zip,shipaddress1,shipaddress2,shipaddress3,shipCity,
  //shipState,shipZip,displayName,lastUpdated

  var customer = new Customer();


  //customer._id = req.body._id
  customer.customerNumber = line[0];
  customer.firstName = line[1];
  customer.lastName = line[2];
  customer.phone = line[3];
  customer.cell = line[4];
  customer.email = line[5];
  customer.company = line[6];
  customer.billingAddress1 = line[7];
  customer.billingAddress2 = line[8];
  customer.billingAddress3 = line[9];
  customer.billingCity = line[10];
  customer.billingState = line[11];
  customer.billingZip = line[12];
  customer.address1 = line[13];
  customer.address2 = line[14];
  customer.address3 = line[15];
  customer.city = line[16];
  customer.state = line[17];
  customer.zip = line[18];
  customer.displayName = line[19];
  customer.lastUpdated = line[20];
  //customer.country = req.body.country;


  var query = {
      //_id: customer._id
  };
  customer.save( function(err, doc) {
      if (err) {
        console.log("error"+ err);
      }
      //return res.send("succesfully saved");
  });




  console.log("lastName is " + line[2]);
  return Promise.resolve(true);
}
