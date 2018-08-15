var express = require('express');
var router = express.Router();
var Invoice = require('../models/invoice');
var Customer = require('../models/customer');
var history = require('./history');
var format = require('date-format');
var Counter = require('../models/counter');
var Product = require('../models/product');

var emailAddresses = require('../email-addresses.js');

var mustache = require("mustache");
var fs = require("fs");
var pdf = require('html-pdf');

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

function upsertInvoice(req,res,invoice){

    // update item status to sold, but only if NOT Partner
    if(invoice.invoiceType!="Partner"){
        var itemStatus = "Sold";
        var itemAction = "sold item";

        if ("Memo" == invoice.invoiceType) {
            itemStatus = "Memo";
            itemAction = "item memo"
        }
        history.updateProductHistory(req.body.lineItems, itemStatus, itemAction, req.user['http://mynamespace/name']);
    }

    invoice.search = invoice._id + " " + invoice.customerFirstName + " " + invoice.customerLastName + " " + format('yyyy-MM-dd', invoice.date) + " ";

    if (invoice.lineItems != null && invoice.lineItems.length > 0 && invoice.lineItems[0] != null) {

        invoice.search += invoice.lineItems[0].itemNumber + invoice.lineItems[0].name;
    }

    console.log('search is ' + invoice.search);

          // use save for updates, findOne and update for inserts for now until we
          // figure out the problem with the "pre" in mongoose.
          if (invoice._id == null || invoice._id == "") {
              invoice.save(function(err) {
                  if (err) {
                      console.log('error saving invoice: ' + err);
                      res.send(err);
                  } else {
                      res.json({
                          message: 'invoice updated'
                      });
                  }
              });
          } else {
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
}


router.route('/invoices')
    .post(checkJwt, function(req, res) {
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
        invoice.tax = req.body.tax;
        invoice.shipping = req.body.shipping;
        invoice.total = req.body.total;
        invoice.copyAddress = req.body.copyAddress;

        customerId = req.body.customerId;

        if(customerId == null){
          console.log("customer id is null, will create customer");

          var customer = new Customer();

          customer.firstName = req.body.customerFirstName;
          customer.lastName = req.body.customerLastName;
          customer.email = req.body.customerEmail;
          customer.address1 = req.body.shipAddress1;
          customer.city = req.body.shipCity;
          customer.state = req.body.shipState;
          customer.zip = req.body.shipZip;
          customer.country = req.body.shipCountry;
          customer.lastUpdated = Date.now();

            Counter.findByIdAndUpdate({
              _id: 'customerNumber'
          }, {
              $inc: {
                  seq: 1
              }
          }, function(err, counter) {
              if (err) {
                  console.log(err);
                  return res.send(500, {
                      error: err
                  });
              }

              customer._id=counter.seq;
              customer.search = customer._id + " " + customer.firstName + " " + customer.lastName + " " +customer.city + " " + customer.state;

              customer.save(function(err) {
                  if (err) {
                      console.log('xxx-error saving customer: ' + err);
                      res.send(err);
                  } else {

                    invoice.customerId = customer._id;
                    upsertInvoice(req,res,invoice);

                  }
              });
          });

        }else{
          upsertInvoice(req,res,invoice);
          console.log("customer id is NOT null, will use existing customer");
        }
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

            'search': new RegExp(search, 'i')

        }, function(err, invoices) {
            if (err)
                res.send(err);

            for (var i = 0; i < invoices.length; i++) {

                var itemNo = "";
                var itemName = "";
                if (invoices[i].lineItems != null && invoices[i].lineItems.length > 0) {
                    itemNo = invoices[i].lineItems[0].itemNumber;
                    itemName = invoices[i].lineItems[0].name;
                }
                results.data.push(
                    [
                        '<a href=\"/#/app/invoice/' + invoices[i]._id + '\">' + invoices[i]._id + '</a>',
                        invoices[i].customerFirstName + " " + invoices[i].customerLastName,
                        '<div style="white-space: nowrap;">' + format('yyyy-MM-dd', invoices[i].date)+'</div>',
                        itemNo,
                        itemName,
                        formatCurrency(invoices[i].total,opts),
                        invoices[i].invoiceType
                    ]
                );
            }

            Invoice.count({}, function(err, count) {
                results.recordsTotal = count;

                if (search == '' || search == null) {
                    results.recordsFiltered = count;
                    res.json(results);
                } else {
                    Invoice.count({

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
            invoiceType: 1
        });

    });





router.route('/invoices/:invoice_id/pdf')
    .get( function(req, res) {

        var opts = { format: '%s%v', symbol: '$' };

        Invoice.findById(req.params.invoice_id, function(err, invoice) {
            if (err) {
                res.send(err);
            }
            else {

                if (invoice.invoiceType == "Memo") invoice.logo = "http://demesyinventory.com/assets/images/logo/memo-logo.png";
                else invoice.logo = "http://demesyinventory.com/assets/images/logo/invoice-logo.png";

                invoice.subtotalFMT = formatCurrency(invoice.subtotal, opts);
                invoice.taxFMT = formatCurrency(invoice.tax, opts);
                invoice.shippingFMT = formatCurrency(invoice.shipping, opts);
                invoice.totalFMT = formatCurrency(invoice.total, opts);
                invoice.dateFMT =  format('MM/dd/yyyy', invoice.date);

                console.log("shipping: "+ invoice.shipping + " formatted "+ invoice.shippingFMT);

                for (var i = 0; i < invoice.lineItems.length; i++) {

                    invoice.lineItems[i].nameFMT = invoice.lineItems[i].name.toUpperCase();
                    invoice.lineItems[i].amountFMT = formatCurrency(invoice.lineItems[i].amount, opts);
                    invoice.lineItems[i].itemNumberFMT = invoice.lineItems[i].itemNumber+ format('dd', invoice.date);
                }

                fs.readFile('./src/app/modules/invoice/invoice-content.html', 'utf-8', function (err, template) {
                    if (err) throw err;
                    var output = mustache.to_html(template, {data: invoice});



                    var options = { format: 'Letter' };


                    console.log("making string");


                    pdf.create(output).toBuffer(function(err, buffer){

                        var pdfstring = buffer.toString();

                        //console.log("string is " + pdfstring);
                        res.setHeader('Content-disposition', 'inline; filename="demesy-invoice.pdf"');
                        res.setHeader('Content-type', 'application/pdf');

                        res.send(pdfstring);

                    });






                });
            }

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

                if (invoice.invoiceType == "Memo") invoice.logo = "http://demesyinventory.com/assets/images/logo/memo-logo.png";
                else invoice.logo = "http://demesyinventory.com/assets/images/logo/invoice-logo.png";

                invoice.subtotalFMT = formatCurrency(invoice.subtotal, opts);
                invoice.taxFMT = formatCurrency(invoice.tax, opts);
                invoice.shippingFMT = formatCurrency(invoice.shipping, opts);
                invoice.totalFMT = formatCurrency(invoice.total, opts);
                invoice.dateFMT =  format('MM/dd/yyyy', invoice.date);

                console.log("shipping: "+ invoice.shipping + " formatted "+ invoice.shippingFMT);

                for (var i = 0; i < invoice.lineItems.length; i++) {

                    invoice.lineItems[i].nameFMT = invoice.lineItems[i].name.toUpperCase();
                    invoice.lineItems[i].amountFMT = formatCurrency(invoice.lineItems[i].amount, opts);
                    invoice.lineItems[i].itemNumberFMT = invoice.lineItems[i].itemNumber+ format('dd', invoice.date);
                }

                fs.readFile('./src/app/modules/invoice/invoice-content.html', 'utf-8', function (err, template) {
                    if (err) throw err;
                    var output = mustache.to_html(template, {data: invoice});
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

    .delete(checkJwt, function(req, res) {
        Invoice.remove({
            _id: req.params.invoice_id
        }, function(err, invoice) {
            if (err)
                res.send(err);

            res.json({
                message: 'Successfully deleted'
            });
        });
    });

router.route('/invoices/partner/:product_id')
    .get(checkJwt, function (req, res) {


        Invoice.findOne({
                invoiceType: 'Partner',
                'lineItems.productId': req.params.product_id
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
                        invoice.invoiceType = "Partner";


                        console.log("lookng up product: "+ req.params.product_id);

                        Product.findById(req.params.product_id,function(err,product){
                            if(err){
                                console.log("error getting partner product " + err);
                                res.send(err);
                            }
                            else{

                                var amount = product.sellingPrice/2.0;

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

         var customerId = req.params.customer_id;
         var query = Invoice.find({ 'customerId': customerId });
          query.select('customer date invoiceNumber customerId total');
          query.exec(function (err, invoices) {
          if (err) {
              res.send(err);
          }else {
              res.json(invoices);
          }
          })
        });


router.route('/invoices/email')
    .post(checkJwt, function(req, res) {

        var to = req.body.emailAddresses.split(/[ ,\n]+/);

        console.log("emailing invoice " + req.body.invoiceId + " to " + JSON.stringify(to));


        var from = 'sales@info.demesyinventory.com';

        Invoice.findById(req.body.invoiceId, function (err, invoice) {
                if (err) {
                    res.send(err);

                    return "Error formatting invoice";
                }
                else {
                    fs.readFile('./src/app/modules/invoice/invoice-content.html', 'utf-8', function (err, template) {
                        if (err) throw err;
                        var output =
                            "<p>" + req.body.note + " </p>" + mustache.to_html(template, {data: invoice});
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




module.exports = router;
