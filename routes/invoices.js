var express = require('express');
var router = express.Router();
var Invoice = require('../models/invoice');
var history = require('./history');
var format = require('date-format');
var Counter = require('../models/counter');
var Product = require('../models/product');
var Avatax = require('avatax');
var avataxCredentials = require('../avatax-credentials.js');
var avataxConfig = require('../avatax-config.js');

var emailAddresses = require('../email-addresses.js');

var mustache = require("mustache");
var fs = require("fs");

const checkJwt = require('./jwt-helper').checkJwt;
const formatCurrency = require('format-currency');

// load aws sdk
var aws = require('aws-sdk');

// load aws config
aws.config.loadFromPath('aws-credentials.js');

// load AWS SES
var ses = new aws.SES({
    apiVersion: '2010-12-01'
});

// send to list
var to = emailAddresses.to;
var bcc = emailAddresses.bcc;

function getFullName(name){
    var fullName = name;
    if("david"==name)fullName = "David Knoernschild";
    else if("ryan"==name) fullName = "Ryan Ables";
    else if("marijo"==name) fullName = "Mari Jo Bueno";
    else if("colby"==name) fullName = "Colby Vick";
    else if("janet"==name) fullName = "Janet Gary";
}

function buildSearchField(doc){

    var search = "";
    if(doc._id != null){
        search += doc._id + " ";
    }

    search += doc.customerFirstName + " " + doc.customerLastName + " " + format('yyyy-MM-dd', doc.date) + " ";

    if (doc.lineItems != null) {
        for (var i = 0; i < doc.lineItems.length; i++) {
            if(doc.lineItems[i] != null){
                search += " " + doc.lineItems[i].itemNumber + " " + doc.lineItems[i].name;
            }
        }
    }
    return search;
}

async function upsertInvoice(req,res){

    var invoice = new Invoice();
    invoice._id = req.body._id;
    invoice.invoiceNumber = req.body.invoiceNumber;
    invoice.customerFirstName = req.body.customerFirstName;
    invoice.customerLastName = req.body.customerLastName;
    invoice.customerPhone = req.body.customerPhone;
    invoice.customerEmail = req.body.customerEmail;
    invoice.customerId = req.body.customerId;
    invoice.project = req.body.project;
    invoice.date = new Date(req.body.date);
    invoice.shipVia = req.body.shipVia;
    invoice.paidBy = req.body.paidBy;
    invoice.authNumber = req.body.authNumber;
    invoice.total = req.body.total;
    invoice.methodOfSale = req.body.methodOfSale;
    invoice.salesPerson = req.body.salesPerson;
    invoice.invoiceType = req.body.invoiceType;
    invoice.shipToName = req.body.shipToName;
    invoice.shipAddress1 = req.body.shipAddress1;
    invoice.shipAddress2 = req.body.shipAddress2;
    invoice.shipAddress3 = req.body.shipAddress3;
    invoice.shipCity = req.body.shipCity;
    invoice.shipState = req.body.shipState;
    invoice.shipZip = req.body.shipZip;
    invoice.shipCountry = req.body.shipCountry;
    invoice.billingAddress1 = req.body.billingAddress1;
    invoice.billingAddress2 = req.body.billingAddress2;
    invoice.billingAddress3 = req.body.billingAddress3;
    invoice.billingCity = req.body.billingCity;
    invoice.billingState = req.body.billingState;
    invoice.billingZip = req.body.billingZip;
    invoice.billingCountry = req.body.billingCountry;
    invoice.taxExempt = req.body.taxExempt;
    invoice.lineItems = req.body.lineItems;
    invoice.subtotal = req.body.subtotal;
    invoice.shipping = req.body.shipping;
    invoice.copyAddress = req.body.copyAddress;
    invoice.trackingNumber = req.body.trackingNumber;

    if(invoice._id==null) {
        var counter = await Counter.findByIdAndUpdate({_id: 'invoiceNumber'}, {$inc: {seq: 1}});
        invoice._id = counter.seq;
        console.log("new invoice ID is "+ invoice._id);
    }

    invoice.tax = await calcTax(invoice);
    console.log('calcTax complete, total tax is', invoice.tax);

    invoice.total = invoice.subtotal + invoice.tax + invoice.shipping;

    // update item status to sold, but only if NOT Partner
    if(invoice.invoiceType!="Partner"){
        var itemStatus = "Sold";
        var itemAction = "sold item";

        if ("Memo" == invoice.invoiceType) {
            itemStatus = "Memo";
            itemAction = "item memo"
        }
        history.updateProductHistory(req.body.lineItems, itemStatus, itemAction, req.user['http://mynamespace/name'],invoice._id);
    }

    // end try
    invoice.search = buildSearchField(invoice);
    console.log("search is " + invoice.search);

              var query = {
                  _id: invoice._id
              };
              Invoice.findOneAndUpdate(query, invoice, {
                  upsert: true
              }, function(err, doc) {
                  if (err) return res.send(500, {
                      error: err
                  });
                  return res.send("invoice saved");
              });
}


router.route('/invoices')
    .post(checkJwt, function(req, res) {
        upsertInvoice(req,res);
        console.log("customer id is NOT null, will use existing customer");
    })

    .get(checkJwt, function(req, res) {
        var query = "";
        var draw = req.query.draw;
        var start = 0;
        var length = 10;
        if (req.query.start) start = req.query.start;
        if (req.query.length) length = req.query.length;


        var search = req.query.search.value;

        var opts = { format: '%s%v', symbol: '$' };

        var results = {
            "draw": draw,
            "recordsTotal": 0,
            "recordsFiltered": 0,
            "data": []
        };

        Invoice.find({

            'search': new RegExp(search, 'i'),
            status: {$ne: 'Deleted'}

        }, function(err, invoices) {
            if (err)
                res.send(err);

            for (var i = 0; i < invoices.length; i++) {

                var itemNo = "";
                var itemName = "";

                if (invoices[i].lineItems != null) {


                    for (var j=0;j< invoices[i].lineItems.length ;j++){
                        itemNo += invoices[i].lineItems[j].itemNumber + "<br/>";
                        itemName +=  " " + invoices[i].lineItems[j].name + "<br/>";

                    }

                }


                var customerName = "";
                if(invoices[i].customerFirstName!=null) customerName +=invoices[i].customerFirstName + " ";
                if(invoices[i].customerLastName!=null) customerName +=invoices[i].customerLastName + " ";

                results.data.push(
                    [
                        '<a href=\"/#/app/invoice/' + invoices[i]._id + '\">' + invoices[i]._id + '</a>',
                        customerName,
                        '<div style="white-space: nowrap;">' + format('yyyy-MM-dd', invoices[i].date)+'</div>',
                        itemNo,
                        itemName,
                        invoices[i].trackingNumber,
                        formatCurrency(invoices[i].total,opts),
                        invoices[i].invoiceType
                    ]
                );
            }

            Invoice.estimatedDocumentCount({}, function(err, count) {
                results.recordsTotal = count;

                if (search == '' || search == null) {
                    results.recordsFiltered = count;
                    res.json(results);
                } else {
                    Invoice.countDocuments({

                        'search': new RegExp(search, 'i')

                    }, function(err, count) {

                        results.recordsFiltered = count;
                        res.json(results);
                    });
                }
            });

        }).sort({
            _id: -1
        }).skip(parseInt(start)).limit(parseInt(length)).select({
            customerFirstName: 1,
            customerLastName: 1,
            date: 1,
            lineItems: 1,
            total: 1,
            invoiceType: 1,
            trackingNumber: 1
        });
    });

router.route('/invoices/:invoice_id/print')
  //  .get(checkJwt, function(req, res) {
    .get( function(req, res) {
        var opts = { format: '%s%v', symbol: '$' };

        Invoice.findById(req.params.invoice_id, function(err, invoice) {
            if (err) {
                res.send(err);
            }
            else {

                invoice.subtotalFMT = formatCurrency(invoice.subtotal, opts);
                invoice.taxFMT = formatCurrency(invoice.tax, opts);
                invoice.shippingFMT = formatCurrency(invoice.shipping, opts);
                invoice.totalFMT = formatCurrency(invoice.total, opts);
                invoice.dateFMT =  format('MM/dd/yyyy', invoice.date);

                for (var i = 0; i < invoice.lineItems.length; i++) {

                    invoice.lineItems[i].nameFMT = invoice.lineItems[i].name.toUpperCase();
                    invoice.lineItems[i].amountFMT = formatCurrency(invoice.lineItems[i].amount, opts);
                    invoice.lineItems[i].itemNumberFMT = invoice.lineItems[i].itemNumber+ format('dd', invoice.date);
                }

                fs.readFile('./src/app/modules/invoice/invoice-content.html', 'utf-8', function (err, template) {
                    if (err) throw err;
                    var output = mustache.to_html(template, {
                        data: invoice,
                        logoUrl:"/assets/images/logo/logo.png",
                        logoWidth:333,
                        fontSize:11,
                        bigFontSize:14,
                        hugeFontSize:32,
                        footerFontSize:8,
                        iconWidth:32
                    });
                    res.send(output);
                });
            }
        });
    });

router.route('/invoices/:invoice_id')
    .get(checkJwt, function(req, res) {
        Invoice.findById(req.params.invoice_id, function(err, invoice) {
            if (err)
                res.send(err);
            res.json(invoice);
        });
    })

    .put(checkJwt, function(req, res) {
        Invoice.findById(req.params.invoice_id, function(err, invoice) {
            if (err)
                res.send(err);

            invoice.customer = req.body.customer;
            invoice.project = req.body.project;
            invoice.invoiceNumber = req.body.invoiceNumber;
            invoice.documentType = req.body.documentType;

            invoice.save(function(err) {
                if (err)
                    res.send(err);

                res.json({
                    message: 'Invoice updated!'
                });
            });
        });
    })

.delete(checkJwt, function (req, res) {

    Invoice.findById(req.params.invoice_id, function (err, invoice) {
        if (err)
            res.send(err);
        invoice.status = 'Deleted';
        invoice.save(function (err) {
            if (err)
                res.send(err);
            res.json({
                message: 'Invoice ' + req.params.invoice_id + ' deleted'
            });
        });
    });
});

router.route('/invoices/partner/:product_id')
    .get(checkJwt, function (req, res) {

        Invoice.findOne({
                $and: [
                    {
                        $or: [
                            { invoiceType: 'Consignment' },
                            { invoiceType: 'Partner' }
                            ]
                    },
                    {'lineItems.productId': req.params.product_id}
                    ]
            },
            function (err, invoice) {
                if (err) {
                    console.log("error getting partner invoice");
                    res.send(err);
                } else {
                    if(invoice == null){
                        console.log("got partner invoice but it is null, creating partner invoice");

                        // create partner invoice
                        invoice = new Invoice();

                        console.log("lookng up product: "+ req.params.product_id);

                        Product.findById(req.params.product_id,function(err,product){
                            if(err){
                                console.log("error getting partner product " + err);
                                res.send(err);
                            }
                            else{

                                var amount = product.cost / 2.0;

                                invoice.invoiceType = product.sellerType;
                                invoice.customerFirstName = product.seller;
                                invoice.customerLastName = "";
                                invoice.total = amount;
                                invoice.subtotal = amount;
                                invoice.date = new Date();
                                invoice.lineItems.push(
                                    {
                                        name: product.title,
                                        longDesc: product.longDesc,
                                        serialNumber: product.serialNo,
                                        modelNumber: product.modelNumber,
                                        amount: amount,
                                        productId: product._id,
                                        itemNumber: product.itemNumber
                                    }
                                );

                                invoice.save(function(err) {
                                    if (err) {
                                        res.send(err);
                                    }else {
                                        res.json(invoice);
                                    }
                                });
                            }
                        });

                    }else{
                        console.log("got partner invoice, not null");
                        res.json(invoice);
                    }
                }
            });

    });

// find invoices for a particular customer
router.route('/customers/:customer_id/invoices')
    .get(function(req, res) {

        var opts = { format: '%s%v', symbol: '$' };

        var results = {
            "data": []
        };

         var customerId = req.params.customer_id;
         var query = Invoice.find({ 'customerId': customerId, status: {$ne: 'Deleted'} });
          query.select('customer date invoiceNumber customerId total invoiceType lineItems');
          query.exec(function (err, invoices) {
          if (err) {
              res.send(err);
          }else {

            for (var i = 0; i < invoices.length; i++) {

                var itemNo = "";
                var itemName = "";

                if (invoices[i].lineItems != null) {
                    for (var j=0;j< invoices[i].lineItems.length ;j++){
                        itemNo += invoices[i].lineItems[j].itemNumber + "<br/>";
                        itemName +=  " " + invoices[i].lineItems[j].name + "<br/>";

                    }
                }

                results.data.push(
                    [
                        '<a href=\"/#/app/invoice/' + invoices[i]._id + '\">' + invoices[i]._id + '</a>',
                        '<div style="white-space: nowrap;">' + format('yyyy-MM-dd', invoices[i].date)+'</div>',
                        itemNo,
                        itemName,
                        formatCurrency(invoices[i].total,opts),
                        invoices[i].invoiceType
                    ]
                );
            }

            res.json(results);
          }
          })
        });


    router.route('/customers/:customer_id/invoiceCount')
        .get(function(req, res) {
            var customerId = req.params.customer_id;
            Invoice.count({'customerId': customerId, status: {$ne: 'Deleted'} }, function( err, count){
                res.json({"invoiceCount": count});
            })
    });
    
router.route('/invoices/email')
    .post(checkJwt, function(req, res) {

        var to = req.body.emailAddresses.split(/[ ,\n]+/);

        console.log("emailing invoice " + req.body.invoiceId + " to " + JSON.stringify(to));


        var from = 'marijo@demesy.com';

        Invoice.findById(req.body.invoiceId, function (err, invoice) {
                if (err) {
                    res.send(err);

                    return "Error formatting invoice";
                }
                else {
                    fs.readFile('./src/app/modules/invoice/invoice-content.html', 'utf-8', function (err, template) {
                        if (err) throw err;
                        var output =
                            "<p>" + req.body.note + " </p>" + mustache.to_html(template, {
                                data: invoice,
                                logoUrl:"http://demesyinventory.com/assets/images/logo/logo.png",
                                logoWidth:333,
                                fontSize:11,
                                bigFontSize:14,
                                hugeFontSize:32,
                                footerFontSize:8,
                                iconWidth:32

                            });

                        ses.sendEmail({
                                Source: from,
                                Destination: {
                                    ToAddresses: to,
                                    BccAddresses: bcc
                                },
                                Message: {
                                    Subject: {
                                        Data: 'DeMesy Invoice'
                                    },
                                    Body: {
                                        Text: {
                                            Data: 'invoice can only be viewed using HTML-capable email browser'
                                        },
                                        Html: {
                                            Data: output
                                        }
                                    }
                                }
                            }
                            , function (err, data) {
                                if (err) throw err
                                console.log('Email sent:');
                                console.log(data);
                            });
                    });
                }
            }
        );

        res.json("ok");
    });

async function calcTax(invoice){

    console.log("CALC TAX-------------------------");
    console.log("invoice is " + invoice._id);
    console.log("taxExempt: " + invoice.taxExempt);

    if(invoice.shipState == '' || invoice.shipState == null){
        console.log("state not specified, will not calculate tax");
        return 0;
    }else if (invoice.taxExempt) {
        console.log("taxExempt, no tax");
        return 0;
    }else if (invoice.shipState == 'TX') {
        var totalTax = 0;
        totalTax = invoice.subtotal * 0.0825;
        console.log("manually calculating TX tax: ", totalTax);
        return totalTax;
    }

    var taxRequest = {
        adjustmentReason: "Other",
        adjustmentDescription: "Invoice Creation or Update",
        createTransactionModel: {
        code: invoice._id,
        customerCode: '' + invoice.customerId,
        type: 'SalesInvoice',
        date: format('yyyy-MM-dd', new Date(invoice.date)),
        companyCode: 'DEFAULT',
        commit: true,
        currencyCode: 'USD',
        taxCode: 'PC040206',
        addresses: {
            SingleLocation: {
                line1: invoice.shipAddress1,
                line2: invoice.shipAddress2,
                line3: invoice.shipAddress3,
                city: invoice.shipCity,
                region: invoice.shipState,
                postalCode: invoice.shipZip
            }
        },
        lines: []
    }
    };

    var itemOrdinal = 0;
    invoice.lineItems.forEach(item => {
        itemOrdinal++;
        taxRequest.createTransactionModel.lines.push(
            {
            number: itemOrdinal,
            quantity: 1,
            amount: item.amount,
            itemCode: item.itemNumber,
            description: item.name
            } 
        );
    });

    var client = new Avatax(avataxConfig).withSecurity(avataxCredentials);

    console.log("SAVING tax doc is:" + JSON.stringify(taxRequest));

    var totalTax = 0.0;

    await client.createOrAdjustTransaction({ model: taxRequest }).then(result => {

        console.log(result);

        result.summary.forEach(item => {
            console.log("taxName: "+ item.taxName + ", tax: "+ item.tax);
            totalTax += item.tax;   
        });

        console.log("total tax: " + totalTax);

    },error=>{
        console.log("Avalara tax call failure: "+ error);
    }
    );

    return totalTax;
}

module.exports = router;
