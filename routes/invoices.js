var express = require('express');
var router = express.Router();
var Invoice = require('../models/invoice');
var history = require('./history');
var format = require('date-format');
var Counter = require('../models/counter');
var Product = require('../models/product');
var Avatax = require('avatax');
const config = require('../config');

const checkJwt = require('./jwt-helper').checkJwt;
const formatCurrency = require('format-currency');
const { renderTemplate } = require('./utils/email-utils');
const { sendTemplatedEmail, parseEmailAddresses } = require('./utils/email-utils');
const { parseDataTablesRequest, handleDataTablesQueryWithEstimatedCount, sendDataTablesResponse } = require('./utils/datatables-helper');

// Config references
const avataxCredentials = config.avatax.credentials;
const avataxConfig = config.avatax.config;

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
    }

    invoice.tax = await calcTax(invoice).then(result => {

        invoice.tax = result;
        invoice.total = invoice.subtotal + invoice.tax + invoice.shipping;

        // update item status to sold, but only if NOT Partner and NOT Estimate
        if(invoice.invoiceType!="Partner" && invoice.invoiceType!="Estimate"){
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

        var query = {
            _id: invoice._id
        };
        Invoice.findOneAndUpdate(query, invoice, {
            upsert: true, useFindAndModify: false
        }, function (err, doc) {
            if (err) return res.send(500, {
                error: err
            });
            return res.send("invoice saved");
        });
    }, error => {
        console.error("calcTax call failure:", error);
        res.send(500, {
            error: "" + error
        });
    });
}

router.route('/invoices')
    .post(checkJwt, function(req, res) {
        upsertInvoice(req,res);
    })

    .get(checkJwt, function(req, res) {
        const params = parseDataTablesRequest(req);
        const opts = { format: '%s%v', symbol: '$' };
        
        const transformRow = (invoice) => {
            let itemNo = "";
            let itemName = "";

            if (invoice.lineItems != null) {
                for (let j = 0; j < invoice.lineItems.length; j++) {
                    itemNo += invoice.lineItems[j].itemNumber + "<br/>";
                    itemName += " " + invoice.lineItems[j].name + "<br/>";
                }
            }

            let customerName = "";
            if (invoice.customerFirstName != null) customerName += invoice.customerFirstName + " ";
            if (invoice.customerLastName != null) customerName += invoice.customerLastName + " ";

            return [
                '<a href="/app/invoices/' + invoice._id + '">' + invoice._id + '</a>',
                customerName,
                '<div style="white-space: nowrap;">' + format('yyyy-MM-dd', invoice.date) + '</div>',
                itemNo,
                itemName,
                invoice.trackingNumber,
                formatCurrency(invoice.total, opts),
                invoice.invoiceType
            ];
        };
        
        const queryPromise = handleDataTablesQueryWithEstimatedCount(Invoice, params, {
            baseQuery: { status: {$ne: 'Deleted'} },
            searchField: 'search',
            sortClause: { _id: -1 },
            selectFields: {
                customerFirstName: 1,
                customerLastName: 1,
                date: 1,
                lineItems: 1,
                total: 1,
                invoiceType: 1,
                trackingNumber: 1
            },
            transformRow
        });
        
        sendDataTablesResponse(res, queryPromise);
    });

router.route('/invoices/:invoice_id/print')
    .get(checkJwt, function(req, res) {
        var opts = { format: '%s%v', symbol: '$' };

        Invoice.findById(req.params.invoice_id, async function(err, invoice) {
            if (err) {
                res.send(err);
                return;
            }

            // Format currency fields
            invoice.subtotalFMT = formatCurrency(invoice.subtotal, opts);
            invoice.taxFMT = formatCurrency(invoice.tax, opts);
            invoice.shippingFMT = formatCurrency(invoice.shipping, opts);
            invoice.totalFMT = formatCurrency(invoice.total, opts);
            invoice.dateFMT = format('MM/dd/yyyy', invoice.date);

            // Format line items
            for (var i = 0; i < invoice.lineItems.length; i++) {
                invoice.lineItems[i].nameFMT = invoice.lineItems[i].name.toUpperCase();
                invoice.lineItems[i].amountFMT = formatCurrency(invoice.lineItems[i].amount, opts);
                invoice.lineItems[i].itemNumberFMT = invoice.lineItems[i].itemNumber + format('dd', invoice.date);
            }

            try {
                const output = await renderTemplate('./app/modules/invoice/invoice-content.html', invoice);
                res.send(output);
            } catch (error) {
                console.error('Error rendering invoice template:', error);
                res.status(500).send('Error rendering invoice');
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
                    console.error("Error getting partner invoice:", err);
                    res.send(err);
                } else {
                    if(invoice == null){
                        // create partner invoice
                        invoice = new Invoice();

                        Product.findById(req.params.product_id,function(err,product){
                            if(err){
                                console.error("Error getting partner product:", err);
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
                        res.json(invoice);
                    }
                }
            });
    });

// find invoices for a particular customer
router.route('/customers/:customer_id/invoices')
    .get(checkJwt, function(req, res) {

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
                        '<a href=\"/app/invoices/' + invoices[i]._id + '\">' + invoices[i]._id + '</a>',
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
        .get(checkJwt, function(req, res) {
            var customerId = req.params.customer_id;
            Invoice.countDocuments({'customerId': customerId, status: {$ne: 'Deleted'} }, function( err, count){
                res.json({"invoiceCount": count});
            })
    });
    
router.route('/invoices/email')
    .post(checkJwt, function(req, res) {

        const to = parseEmailAddresses(req.body.emailAddresses);
        const subject = `${config.tenant.name} Invoice`;
        const templatePath = './app/modules/invoice/invoice-content.html';
        const note = req.body.note;

        Invoice.findById(req.body.invoiceId, async function (err, invoice) {
            if (err) {
                console.error("Error fetching invoice:", err);
                res.send(err);
                return;
            }

            try {
                await sendTemplatedEmail(to, subject, templatePath, invoice, note);
                res.json("ok");
            } catch (error) {
                console.error('Error sending invoice email:', error);
                res.status(500).send('Error sending email');
            }
        });
    });

async function calcTax(invoice){

    if(invoice.invoiceType=='Estimate'){
        return 0;
    }
    else if(invoice.shipState == '' || invoice.shipState == null){
        return 0;
    }else if (invoice.taxExempt) {
        return 0;
    }else if (invoice.methodOfSale == 'Ebay') {
        return 0;
    }else if (invoice.shipState == 'TX') {
        var totalTax = 0;
        totalTax = invoice.subtotal * 0.0825;
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

    var totalTax = 0.0;

    result = await client.createOrAdjustTransaction({ model: taxRequest });

    if(result.error != null){
        throw new Error(result.error.message);
    }

    result.summary.forEach(item => {
        totalTax += item.tax;
    });

    return totalTax;
}

module.exports = router;
