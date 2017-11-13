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


//var datadir = "/Users/davidk/Dropbox/demesy-data";

//loadCsvFile("data/Inventory.txt",loadProduct);
//loadCsvFile("data/Customers.txt",loadCustomer);
//loadCsvFile("data/Invoices.txt", loadInvoice);
//loadCsvFile("data/Returns.txt",loadReturn);
//loadCsvFile("data/Repairs.txt",loadRepair);
loadCsvFile("data/Invoice_Detail.txt",loadInvoiceDetail);
//loadCsvFile("data/Returns_Detail.txt",loadReturnDetail);

function loadCsvFile(file, functionRef) {

    var count = 0;
    var ids = new Array();

    fs.readFile(file, 'utf8', function(err, data) {
        if (err) {
            return console.log(err);
        }

        parse(data, {
            comment: '#'
        }, function(err, output) {
            for (var i = 0; i < output.length; i++) {
                line = output[i];
                id = line[0];
                var line = output[i];
                line[0] = dedupeValue(ids, id);
                console.log("LINE:" + output[i]);
                functionRef(line);
            }
        });
    });
}


function dedupeValue(array, value) {
    if (array.includes(value)) {
        value = dedupeValue(array, value + "_a");
    } else {
        array.push(value);
    }
    return value;
}




function loadCustomer(line) {
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


   // using promise instead of callback
  //  return Customer.findOneAndUpdate({ "_id" : customer.id }, customer, {'upsert': true}).exec();

    Customer.findOneAndUpdate({
        "_id": customer.id
    }, customer, {
        upsert: true
    }, function(err, doc) {
        if (err) {
            console.log("error" + err);
        }
    });

    console.log("loaded customer " + line[0] + " " + line[1] + " " + line[2]);
    //return Promise.resolve(true);
    return Promise.resolve(true);
}


function loadProduct(line) {

    var statuses = [];
    statuses[1] = "In Stock";
    statuses[2] = "Repair";
    statuses[3] = "Memo";
    statuses[4] = "Sold";
    statuses[5] = "Sale Pending";
    statuses[6] = "At Show";
    statuses[7] = "Partnership";
    statuses[8] = "Unavailable";
    statuses[9] = "Problem";

    var productTypes = [];
    productTypes[1] = "Watch";
    productTypes[2] = "Jewelry";
    productTypes[3] = "Accessories";
    productTypes[4] = "Pocket Watch";

    var mfrs = [];

    mfrs[1] = "A. Lange & Sohne";
    mfrs[2] = "Audemars Piguet";
    mfrs[3] = "Baume & Mercier";
    mfrs[4] = "Blancpain";
    mfrs[5] = "Breguet";
    mfrs[6] = "Breitling";
    mfrs[7] = "Bvlgari";
    mfrs[8] = "Cartier";
    mfrs[9] = "Chanel";
    mfrs[10] = "Chopard";
    mfrs[11] = "Chronoswiss";
    mfrs[12] = "Concord";
    mfrs[13] = "Corum";
    mfrs[14] = "Ebel";
    mfrs[15] = "F.P. Journe";
    mfrs[16] = "Franck Muller";
    mfrs[17] = "Gerald Genta";
    mfrs[18] = "Girard-Perregaux";
    mfrs[19] = "Hublot";
    mfrs[20] = "IWC";
    mfrs[21] = "Jaeger-LeCoultre";
    mfrs[22] = "Movado";
    mfrs[23] = "Omega";
    mfrs[24] = "Panerai";
    mfrs[25] = "Parmigiani";
    mfrs[26] = "Patek Philippe & Co";
    mfrs[27] = "Piaget";
    mfrs[28] = "Roger Dubuis";
    mfrs[29] = "Rolex";
    mfrs[30] = "Ulysse Nardin";
    mfrs[31] = "Vacheron Constantin";
    mfrs[32] = "Additional Brands";
    mfrs[33] = "x";
    mfrs[34] = "x";
    mfrs[35] = "x";
    mfrs[37] = "x";
    mfrs[37] = "Maurice Lacroix";
    mfrs[38] = "Zenith";

    var  condition = [];
    condition[6] = "Pre-owned";
    condition[7] = "Unused";

    var gender = [];
    gender[1] = "Men's";
    gender[2] = "Ladies";
    gender[3] = "Unisex";
    gender[4] = "Midsize";
    gender[5] = "Men's or Ladies";


    // PRODUCT FIELDS
    //itemNo,productType,manufacturer,title,style,model,condition,gender,features,case,
    //size,dial,bracelet,comments,serialNo,modelYear,longDesc,supplier,mfgr,lastUpdated,userId,cost,listPrice,sellingPrice,totalRepairCost,
    //photo,saleDate,received,status,notes

    var product = new Product();

    product._id = line[0];
    var productTypeId = line[1];
    product.productType = productTypes[productTypeId];
    var manufacturerId = line[2];
    product.manufacturer = mfrs[manufacturerId];
    product.title = line[3];

    //product.style = line[4];
    product.modelNumber = line[4];

    product.model = line[5];
    var conditionId = line[6];
    product.condition = condition[conditionId];
    var genderId = line[7];
    product.gender = gender[genderId];
    product.features = line[8];
    product.case = line[9];
    product.size = line[10];
    product.dial = line[11];
    product.bracelet = line[12];
    product.comments = line[13];
    product.serialNo = line[14];
    product.modelYear = line[15];
    product.longDesc = line[16];
    product.seller = line[17]; // supplier
    var mfgr = line[18];  // never used

    product.lastUpdated = new Date(line[19]);
    var userId = line[20]; // never used
    product.cost = line[21].replace("$", "").replace(")", "").replace("(", "-");
    product.listPrice = line[22].replace("$", "").replace(")", "").replace("(", "-");
    product.sellingPrice = line[23].replace("$", "").replace(")", "").replace("(", "-");
    product.totalRepairCost = line[24].replace("$", "").replace(")", "").replace("(", "-");
    product.photo = line[25];
    product.saleDate = line[26];
    product.received = line[27];
    var statusId = line[28];
    product.status = statuses[statusId];
    product.notes = line[29];
    product.history = [{
        user: "system",
        date: Date.now(),
        action: "item created"
    }];

    product.save(function(err, doc) {
        if (err) {
            console.log("error" + err);
        }
    });

    console.log("loaded product " + product._id + " " + product.title);
    return Promise.resolve(true);
}




function loadInvoice(line) {
    //console.log("line is "+ line);

    // INVOICE FIELDS
    // invoiceNo,custNo,invoiceDate,invoiceType,shipVia,paidBy,pmtId,taxable,subtotal,shipping,salesTax,
    // total,salesPerson,shipToName,shipAddress1,shipAddress2,shipAddress3,shipCity,shipState,shipZip

    var invoice = new Invoice();

    invoice._id = line[0];
    invoice.customerId = line[1];
    invoice.date = line[2];
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

    // do not inport blank invoices
    if (invoice.invoiceType!=null && invoice.invoiceType != "") {

        if (invoice.customerId != null) {
            Customer.findById(invoice.customerId, function(err, customer) {
                if (err) {
                    console.log(err);
                }
                if (customer != null) {

                    invoice.customerFirstName = customer.firstName;
                    invoice.customerLastName = customer.lastName;
                    invoice.customerEmail = customer.email;
                }
                saveInvoice(invoice);
            })
        } else {
            saveInvoice(invoice);
        }
    }
    return Promise.resolve(true);
}

function saveInvoice(invoice) {
    Invoice.findOneAndUpdate({
        "_id": invoice.id
    }, invoice, {
        upsert: true
    }, function(err, doc) {
        if (err) {
            console.log("error" + err);

            console.log("loaded invoice " + line[0]);
        }
    });
}

function loadReturn(line) {

    // RETURN FIELDS
    // returnId,returnDate,invoiceNo,taxable,subTotal,shipping,
    // salesTax,totalReturnAmount,salesPerson,customerName,processed

    var retrn = new Return();

    retrn._id = line[0];
    retrn.returnDate = line[1];
    retrn.invoiceId = line[2];
    retrn.taxable = line[3];
    retrn.subTotal = line[4].replace("$", "").replace(")", "").replace("(", "-");
    retrn.shipping = line[5].replace("$", "").replace(")", "").replace("(", "-");
    retrn.salesTax = line[6].replace("$", "").replace(")", "").replace("(", "-");
    retrn.totalReturnAmount = line[7].replace("$", "").replace(")", "").replace("(", "-");
    retrn.salesPerson = line[8];
    retrn.customerId = line[9];
    retrn.processed = line[10];

    if (retrn.customerId != null) {
        Customer.findById(retrn.customerId, function(err, customer) {
            if (err) {
                console.log(err);
            }
            if (customer != null) {
                retrn.customerName = customer.firstName + " " + customer.lastName;
            }
            saveReturn(retrn);
        });
    } else {
        saveReturn(retrn);
    }

    console.log("loaded return " + line[0]);
    return Promise.resolve(true);
}



function loadRepair(line) {

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


    Repair.findOneAndUpdate({
        "_id": repair._id
    }, repair, {
        upsert: true
    }, function(err, doc) {
        if (err) {
            console.log("error" + err);
        } else {

        }
    });

    return Promise.resolve(true);
}


function loadInvoiceDetail(line) {

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
        "productId": itemNumber,
        "name": description,
        "amount": amount,
        "serialNumber": '12344566',
        "longDesc": description,
    };

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



function saveReturn(retrn) {
    Return.findOneAndUpdate({
        "_id": retrn.id
    }, retrn, {
        upsert: true
    }, function(err, doc) {
        if (err) {
            console.log("error" + err);
        }
    });
}







function loadReturnDetail(line) {

    //returnDetail fields
    //subReturnId,returnId,invoiceDetailId,itemNo,description,amount,transSelect

    var subReturnId = line[0];
    var returnId = line[1]
    var invoiceDetailId = line[2];
    var productId = line[3];
    var description = line[4];
    var amount = line[5].replace("$", "").replace(")", "").replace("(", "-");
    var transSelect = line[6];

    var included = false;

    if (transSelect == '1') included = true;

    //lineItems: [{
    //    productId: String,
    //    name: String,
    //    amount: Number,
    //    serialNo: String,
    //    itemNo: String,
    //    longDesc: String,
    //    included: Boolean
    //}]

    var lineItem = {
        "productId": productId,
        "name": description,
        "amount": amount,
        "serialNumber": '12344566',
        "longDesc": description,
        "included": included
    };

    Return.findOneAndUpdate({
        _id: returnId
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
        console.log('line item ' + invoiceDetailId + " added to return " + returnId);
    });


    return Promise.resolve(true);
}
