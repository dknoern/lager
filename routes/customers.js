var express = require('express');
var router = express.Router();
var Counter = require('../models/counter');
var Customer = require('../models/customer');
var Invoice = require('../models/invoice');
var Return = require('../models/return');

const checkJwt = require('./jwt-helper').checkJwt;
const { isEmpty, valueOrBlank, getLastOrCompany, overlayField } = require('./utils/validation-utils');
const { parseDataTablesRequest, handleDataTablesQueryWithEstimatedCount, sendDataTablesResponse } = require('./utils/datatables-helper');

router.use(function(req, res, next) {
    next();
});

var upsertCustomer = function(req, res, customerId) {
    var customer = new Customer();

    customer._id = customerId
    customer.firstName = req.body.firstName;
    customer.lastName = req.body.lastName;
    customer.company = req.body.company;
    customer.phone = req.body.phone;
    customer.email = req.body.email;
    customer.address1 = req.body.address1;
    customer.address2 = req.body.address2;
    customer.address3 = req.body.address3;
    customer.city = req.body.city || "";
    customer.state = req.body.state || "";
    customer.zip = req.body.zip;
    customer.country = req.body.country;
    customer.billingAddress1 = req.body.billingAddress1;
    customer.billingAddress2 = req.body.billingAddress2;
    customer.billingAddress3 = req.body.billingAddress3;
    customer.billingCity = req.body.billingCity;
    customer.billingState = req.body.billingState || "";
    customer.billingZip = req.body.billingZip;
    customer.billingCountry = req.body.billingCountry;
    customer.lastUpdated = Date.now();
    customer.copyAddress = req.body.copyAddress;
    customer.customerType = req.body.customerType;

    customer.search = customer._id + " " + customer.firstName + " " + getLastOrCompany(customer) + " " +customer.city + " " + customer.email + " " + customer.phone + " " + customer.country;

    var query = {
        _id: customer._id
    };
    Customer.findOneAndUpdate(query, customer, {
        upsert: true
    }, function(err, doc) {
        if (err) return res.send(500, {
            error: err
        });
        return res.send("succesfully saved");
    });
}

router.route('/customers')
    .post(checkJwt, function(req, res) {

        if (req.body._id == null) {
            Counter.findByIdAndUpdate({
                _id: 'customerNumber'
            }, {
                $inc: {
                    seq: 1
                }
            }, function(err, counter) {
                if (err) {
                    console.error("Error incrementing customer counter:", err);
                    return res.send(500, {
                        error: err
                    });
                }
                return upsertCustomer(req, res, counter.seq);
            });
        } else {
            return upsertCustomer(req, res, req.body._id);
        }

    })

    .get(checkJwt, function(req, res) {
        const params = parseDataTablesRequest(req);
        
        const transformRow = (customer) => {
            var cityAndState = customer.city;
            if(customer.state != null && customer.state != ""){
                cityAndState += ', ' + customer.state;
            }
            
            // Check if this is being called from a modal context (for invoice/repair creation)
            var customerLink;
            if (req.query.modal === 'true') {
                customerLink = '<a href="#" onclick="selectCustomer(' + customer._id + ')">' + customer._id + '</a>';
            } else {
                customerLink = '<a href="/app/customers/' + customer._id + '">' + customer._id + '</a>';
            }
            
            return [
                customerLink,
                customer.firstName + ' ' + getLastOrCompany(customer),
                cityAndState,
                customer.email,
                customer.phone,
                customer.company,
                '<input type="checkbox" class="togglecheck" onclick="toggleCustomer(this, '+customer._id + ')" id='+customer._id+'>'
            ];
        };
        
        const queryPromise = handleDataTablesQueryWithEstimatedCount(Customer, params, {
            baseQuery: { 'status': {$ne: 'Deleted'} },
            searchField: 'search',
            sortClause: { lastUpdated: -1 },
            selectFields: {
                firstName: 1,
                lastName: 1,
                city: 1,
                state: 1,
                email: 1,
                phone: 1,
                company: 1
            },
            transformRow
        });
        
        sendDataTablesResponse(res, queryPromise);

    });

router.route('/customers/:customer_id')
    .get(checkJwt, function(req, res) {

        Customer.findById(req.params.customer_id, function(err, customer) {
            if (err) {
                res.send(err);
            }else {
                res.json(customer);
            }
        });
    })

    .put(checkJwt, function(req, res) {
        Customer.findById(req.params.customer_id, function(err, customer) {
            if (err)
                res.send(err);
            customer.firstName = req.body.firstName;
            customer.lastName = req.body.lastName;
            customer.email = req.body.email;
            customer.phone = req.body.phone;
            customer.save(function(err) {
                if (err)
                    res.send(err);
                res.json({
                    message: 'Customer updated!'
                });
            });
        });
    })

    .delete(checkJwt, function(req, res) {
        Customer.findById(req.params.customer_id, function(err, customer) {
            if (err)
                res.send(err);
            customer.status = "Deleted";
            customer.save(function(err) {
                if (err)
                    res.send(err);
                res.json({
                    message: 'Customer deleted'
                });
            });
        });
    });

/* experimental endpoint to merge customers. */
router.route('/customers/merge')
    .post(checkJwt, function (req, res) {
        var idsUnsorted = req.body.ids;
        var ids = idsUnsorted.sort(function (a, b) {
            return a - b;
        });
        mergeCustomers(ids, res);
    });

function mergeCustomers(ids, res) {

    var canonicalId = ids[0];
    ids.forEach(id => {

        var query = Invoice.find({ 'customerId': id });
        query.select('customer date invoiceNumber customerId total invoiceType lineItems');
        query.exec(function (err, invoices) {
            if (err) {
                console.error("Error fetching invoices for merge:", err);
            } else {
                for (var i = 0; i < invoices.length; i++) {
                    if (id != canonicalId){
                      invoices[i].customerId = canonicalId;
                      invoices[i].save(function (err) {
                      });
                  }
                }
            }
        });

        var query3 = Return.find({ 'customerId': id });
        query3.select('customerId');
        query3.exec(function (err, returns) {
            if (err) {
                console.error("Error fetching returns for merge:", err);
            } else {
                for (var i = 0; i < returns.length; i++) {
                    if (id != canonicalId){
                      returns[i].customerId = canonicalId;
                      returns[i].save(function (err) {
                      });
                    }
                }
            }
        });
    });

    (async() => {
        const canonicalCustomer = await Customer.findById(canonicalId).exec();
        for (var i = 1; i < ids.length; i++) {
            const customer = await Customer.findById(ids[i]).exec();
            overlayCustomer(canonicalCustomer, customer);
            await Customer.deleteOne({ _id: ids[i] }, function (err) {
                if (err) console.error("Error deleting merged customer:", err);
            });
        }

        await canonicalCustomer.save();

        res.json({
            message: 'Customers merged.'
        });
    })();
}

function overlayCustomer(canonicalCustomer, customer) {
    if(customer == null){
        return;
    }

    if(canonicalCustomer == null){
        return;
    }

    canonicalCustomer.firstName = overlayField(canonicalCustomer.firstName, customer.firstName);
    canonicalCustomer.lastName = overlayField(canonicalCustomer.lastName, customer.lastName);
    canonicalCustomer.comapny = overlayField(canonicalCustomer.comapny, customer.company);
    canonicalCustomer.phone = overlayField(canonicalCustomer.phone, customer.phone);
    canonicalCustomer.email = overlayField(canonicalCustomer.email, customer.email);   
    canonicalCustomer.address1 = overlayField(canonicalCustomer.address1, customer.address1);  
    canonicalCustomer.address2 = overlayField(canonicalCustomer.address2, customer.address2);   
    canonicalCustomer.city = overlayField(canonicalCustomer.city, customer.city); 
    canonicalCustomer.state = overlayField(canonicalCustomer.state, customer.state); 
    canonicalCustomer.zip = overlayField(canonicalCustomer.zip, customer.zip); 
    canonicalCustomer.country = overlayField(canonicalCustomer.country, customer.country); 
    canonicalCustomer.billingAddress1 = overlayField(canonicalCustomer.billingAddress1, customer.billingAddress1);  
    canonicalCustomer.billingAddress2 = overlayField(canonicalCustomer.billingAddress2, customer.billingAddress2);   
    canonicalCustomer.billingCity = overlayField(canonicalCustomer.billingCity, customer.billingCity); 
    canonicalCustomer.billingState = overlayField(canonicalCustomer.billingState, customer.billingState); 
    canonicalCustomer.billingZip = overlayField(canonicalCustomer.billingZip, customer.billingZip); 
    canonicalCustomer.billingCountry = overlayField(canonicalCustomer.billingCountry, customer.billingCountry); 
}

// Utility functions moved to ./utils/validation-utils.js

module.exports = router;
