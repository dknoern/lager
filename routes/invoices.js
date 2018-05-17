var express = require('express');
var router = express.Router();
var Invoice = require('../models/invoice');
var Customer = require('../models/customer');
var history = require('./history');
var format = require('date-format');
var Counter = require('../models/counter');

const checkJwt = require('./jwt-helper').checkJwt;
const formatCurrency = require('format-currency');
function upsertInvoice(req,res,invoice){

          var itemStatus = "Sold";
          var itemAction = "sold item";

          if ("Memo" == invoice.invoiceType) {
              itemStatus = "Memo";
              itemAction = "item memo"
          }

          history.updateProductHistory(req.body.lineItems, itemStatus, itemAction, req.user['http://mynamespace/name']);

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
        invoice.customerId = req.body.customerId;
        invoice.project = req.body.project;
        invoice.date = new Date(req.body.date);
        invoice.shipVia = req.body.shipVia;
        invoice.paidBy = req.body.paidBy;
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
        invoice.lineItems = req.body.lineItems;
        invoice.subtotal = req.body.subtotal;
        invoice.tax = req.body.tax;
        invoice.shipping = req.body.shipping;
        invoice.total = req.body.total;


        customerId = req.body.customerId;

        if(customerId == null){
          console.log("customer id is null, will create customer");

          var customer = new Customer();

          customer.firstName = req.body.customerFirstName;
          customer.lastName = req.body.customerLastName;
          customer.address1 = req.body.shipAddress1;
          customer.city = req.body.shipCity;
          customer.state = req.body.shipState;
          customer.zip = req.body.shipZip;
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

    .get(function(req, res) {

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


            $or: [{
                    'customerLastName': new RegExp(search, 'i')
                },
                {
                    'customerFirstName': new RegExp(search, 'i')
                },
                {
                    'lineItems.itemNumber': new RegExp(search, 'i')
                }
                ,
                {
                    'lineItems.name': new RegExp(search, 'i')
                }
            ]
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
                        formatCurrency(invoices[i].total,opts)
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
                        'customer': new RegExp(search, 'i')
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
            total: 1
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

// find invoices for a particular customer
router.route('/customers/:customer_id/invoices')
    .get(function(req, res) {

         var customerId = req.params.customer_id;
         var query = Invoice.find({ 'customerId': customerId });
          query.select('customer date invoiceNumber customerId total');
          query.exec(function (err, invoices) {
          if (err)
            res.send(err);
            res.json(invoices);
          })
        });


module.exports = router;
