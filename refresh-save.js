var express = require('express');
var fs = require('fs');
var parse = require('csv-parse');
var async = require('async');

var Customer = require('./models/customer');
var Product = require('./models/product');
var Invoice = require('./models/invoice');
var Return = require('./models/return');
var Repair = require('./models/repair');

var app = express();
var bodyParser = require('body-parser');
const path = require('path');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/lager');

console.log("refreshing DB");

//mongoose.disconnect();

loadCsvFile("data/Inventory.txt",loadProduct);
//loadCsvFile("data/Customers.txt",loadCustomer);
//loadCsvFile("data/Invoices.txt",loadInvoice);
//loadCsvFile("data/Returns.txt",loadReturn);
//loadCsvFile("data/RepairSample.txt",loadRepair);
//loadCsvFile("data/Invoice_Detail.txt",loadInvoiceDetail);

function loadCsvFile(file,functionRef){

  var count=0;
  var ids = new Array();

  fs.readFile(file, 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }

    parse(data, {comment: '#'}, function(err, output){
      for (var i = 0; i < output.length; i++) {
          line = output[i];
          id = line[0];
          var line =  output[i];
          line[0] = dedupeValue(ids,id);
          console.log("LINE:"+output[i]);
          functionRef(line);
      }
    });
  });
}

function dedupeValue(array,value){
  if(array.includes(value)){
    value = dedupeValue(array,value + "_a");
  }else{
    array.push(value);
  }
  return value;
}

function loadCustomer(line){
  //console.log("line is "+ line);

  // CUSTOMER FIELDS
  //custno,firstName,lastName,phone,cell,email,company,address1,address2,
  //address3,city,state,zip,shipaddress1,shipaddress2,shipaddress3,shipCity,
  //shipState,shipZip,displayName,lastUpdated

  var customer = new Customer();

  customer._id = line[0];
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

  Customer.findOneAndUpdate({ "_id" : customer.id }, customer, {
      upsert: true
  }, function(err, doc) {
      if (err) {
        console.log("error"+ err);
      }
  });

  console.log("loaded customer " + line[0]+ " "+ line[1]+ " " + line[2]);
  //return Promise.resolve(true);
  return Promise.resolve(true);
}


function loadProduct(line){

  // PRODUCT FIELDS
  //itemNo,productType,manufacturer,title,style,model,condition,gender,features,case,
  //size,dial,bracelet,comments,serialNo,modelYear,longDesc,supplier,mfgr,lastUpdated,userId,cost,listPrice,sellingPrice,totalRepairCost,
  //photo,saleDate,status,notes

  var product = new Product();

  product._id = line[0];
  product.productType = line[1];
  product.manufacturer = line[2];
  product.title = line[3];
  product.style = line[4];
  product.model = line[5];
  product.condition = line[6];
  product.gender = line[7];
  product.features = line[8];
  product.case = line[9];
  product.size = line[10];
  product.dial = line[11];
  product.bracelet = line[12];
  product.comments = line[13];
  product.serialNo = line[14];
  product.modelYear = line[15];
  product.longDesc = line[16];
  product.supplier = line[17];
  product.mfgr = line[18];
  product.lastUpdated = line[19];
  product.userId = line[20];
  product.cost = line[21];
  product.listPrice = line[22];
  product.sellingPrice = line[23];
  product.totalRepairCost = line[24];
  product.photo = line[25];
  product.saleDate = line[26];
  product.status = line[27];
  product.notes = line[28];
  product.history = [{
    user: "system",
    date: Date.now(),
    action: "item created"
  }];

  Product.findOneAndUpdate({ "_id" : product.id }, product, {
      upsert: true
  }, function(err, doc) {
      if (err) {
        console.log("error"+ err);
      }
  });

  console.log("loaded product " + product._id + " " + product.title);
  return Promise.resolve(true);
}




function loadInvoice(line){
  //console.log("line is "+ line);

  // INVOICE FIELDS
  // invoiceNo,custNo,invoiceDate,invoiceType,shipVia,paidBy,pmtId,taxable,subtotal,shipping,salesTax,
  // total,salesPerson,shipToName,shipAddress1,shipAddress2,shipAddress3,shipCity,shipState,shipZip

  var invoice = new Invoice();

  invoice._id = line[0];
  invoice.customerId = line[1];
  invoice.invoiceDate = line[2];
  invoice.invoiceType = line[3];
  invoice.shipVia = line[4];
  invoice.paidBy = line[5];
  invoice.paymemtId = line[6];
  invoice.taxable = line[7];
  invoice.subtotal = line[8];
  invoice.shipping = line[9];
  invoice.salesTax = line[10];
  invoice.total = line[11];
  invoice.salesPerson = line[12];
  invoice.shipToName = line[13];
  invoice.shipAddress1 = line[14];
  invoice.shipAddress2 = line[15];
  invoice.shipAddress3 = line[16];
  invoice.shipCity = line[17];
  invoice.shipState = line[18];
  invoice.shipZip = line[19];

  Invoice.findOneAndUpdate({ "_id" : invoice.id }, invoice, {
      upsert: true
  }, function(err, doc) {
      if (err) {
        console.log("error"+ err);
      }
  });

  console.log("loaded invoice " + line[0]);
  return Promise.resolve(true);
}


function loadReturn(line){

  // RETURN FIELDS
  // returnId,returnDate,invoiceNo,taxable,subTotal,shipping,
  // salesTax,totalReturnAmount,salesPerson,customerName,processed

  var retrn = new Return();

  retrn._id = line[0];
  retrn.returnDate = line[1];
  retrn.invoiceId = line[2];
  retrn.taxable = line[3];
  retrn.subTotal = line[4];
  retrn.shipping = line[5];
  retrn.salesTax = line[6];
  retrn.totalReturnAmount = line[7];
  retrn.salesPerson = line[8];
  retrn.customerId = line[9];
  retrn.processed = line[10];

  if(retrn.customerId != null && retrn.customerId.length>0){
    Customer.findById(retrn.customerId, function(err, customer) {
      if (err){
        console.log(err);
      }
      if(customer!=null){
        retrn.customerName =  customer.firstName + " " +  customer.lastName;
      }
      saveReturn(retrn);
    });
  }else{
    saveReturn(retrn);
  }

  console.log("loaded return " + line[0]);
  return Promise.resolve(true);
}



function loadRepair(line){

  // REPAIR FIELDS
  // repairId,dateOut,expectedReturnDate,returnDate,itemNo,description,
  //repairIssues,vendor,customerName,phone,email,repairNotes,cost,hasPapers


  var repair = new Repair();

  repair._id = line[0];
  repair.dateOut = line[1];
  repair.expectedReturnDate = line[2];
  repair.returnDate = line[3];
  repair.itemId = line[4];
  repair.description = line[5];
  repair.repairIssues = line[6];
  repair.vendor = line[7];
  repair.customerName = line[8];
  repair.phone = line[9];
  repair.email = line[10];
  repair.repairNotes = line[11];
  repair.cost = line[12];
  repair.hasPapers = line[13];


  Repair.findOneAndUpdate({ "_id" : repair._id }, repair, {
      upsert: true
  }, function(err, doc) {
      if (err) {
        console.log("error"+ err);
      }else{

      }
  });

  return Promise.resolve(true);
}


function loadInvoiceDetail(line){

  //invoiceDetail fields
  //invoiceDetailId,invoiceNo,itemNo,description,amount

  var invoiceDetailId = line[0];
  var invoiceId = line[1];
  var itemNumber = line[2];
  var description = line[3];
  var amount = line[4].replace("$", "").replace(")", "").replace("(", "-");

  //lineItems: [{
  //    productId: String,
  //    name: String,
  //    amount: Number,
  //    serialNumber: String,
  //    itemNumber: String,
  //    longDesc: String
  //}]

  var lineItem = {
    "name": description,
    "amount": amount,
    "longDesc": description
  }

  Invoice.findOneAndUpdate({
      _id: invoiceId
  }, {
      "$push": {
          "lineItems": lineItem
      }
  }, {
      upsert: true
  }, function(err, doc) {
      if (err) {
          console.log("ERROR adding line item " + err);
      }
      console.log('line item ' + invoiceDetailId + " added to invoice " + invoiceId);
  });

  return Promise.resolve(true);
}


function saveReturn(retrn){
  Return.findOneAndUpdate({ "_id" : retrn.id }, retrn, {
      upsert: true
  }, function(err, doc) {
      if (err) {
        console.log("error"+ err);
      }
  });
}
