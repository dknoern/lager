var express = require('express');
var router = express.Router();
var Counter = require('../models/counter');
var Customer = require('../models/customer');
var Invoice = require('../models/invoice');
var Return = require('../models/return');

const checkJwt = require('./jwt-helper').checkJwt;

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
                    console.log(err);
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

        var query = "";
        var draw = req.query.draw;
        var start = 0;
        var length = 10;
        if (req.query.start) start = req.query.start;
        if (req.query.length) length = req.query.length;
        var search = req.query.search.value;

        var results = {
            "draw": draw,
            "recordsTotal": 0,
            "recordsFiltered": 0,
            "data": []
        };

        Customer.find({

            'search': new RegExp(search, 'i'),
            'status': {$ne: 'Deleted'} 

        }, function(err, customers) {
            if (err)
                res.send(err);

            for (var i = 0; i < customers.length; i++) {


                var cityAndState = customers[i].city;
                if(customers[i].state!=null && customers[i].state!=""){
                    cityAndState += ', ' + customers[i].state;
                }

                results.data.push(
                    [
                    //  '<a href=\"/#/app/customer/' + customers[i]._id + '\">' + customers[i]._id + '</a>',
                      '<a href=\"#\" onclick=\"selectCustomer(' + customers[i]._id + ');return false;\">' + customers[i]._id + '</a>',
                        customers[i].firstName + ' ' + getLastOrCompany(customers[i]),
                       cityAndState,
                        customers[i].email,
                        customers[i].phone,
                        customers[i].company,
                        '<input type="checkbox" class="togglecheck" onclick="toggleCustomer(this, '+customers[i]._id + ')">'
                    ]
                );
            }

            Customer.estimatedDocumentCount({}, function(err, count) {
                results.recordsTotal = count;

                if (search == '' || search == null) {
                    results.recordsFiltered = count;
                    res.json(results);
                } else {
                    Customer.countDocuments({
                        'search': new RegExp(search, 'i'),
            'status': {$ne: 'Deleted'} 
                    }, function(err, count) {


                        results.recordsFiltered = count;
                        res.json(results);
                    });
                }

            });

        }).sort({
            lastUpdated: -1
        }).skip(parseInt(start)).limit(parseInt(length)).select({
            firstName: 1,
            lastName: 1,
            city: 1,
            state: 1,
            email: 1,
            phone: 1,
            company: 1
        });

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
        console.log('merging customers ', idsUnsorted);
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
                console.log("error ", err)
            } else {
                for (var i = 0; i < invoices.length; i++) {
                    if (id != canonicalId){
                      console.log("moving invoice ", invoices[i]._id, " from customer ", invoices[i].customerId, " to ", canonicalId);
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
                console.log("error ", err)
            } else {
                for (var i = 0; i < returns.length; i++) {
                    if (id != canonicalId){
                      console.log("moving return", returns[i]._id, " from customer ", returns[i].customerId, " to ", canonicalId);
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
            console.log("deleting merged customer ", ids[i]);
            await Customer.deleteOne({ _id: ids[i] }, function (err) {
                if (err) console.log(err);
            });
        }

        console.log('updating canonical customer ', canonicalId);

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

function overlayField(canonicalField, field) {
    if(isEmpty(canonicalField) && !isEmpty(field)){
        canonicalField = field;
    }
    return canonicalField;
}

function isEmpty(str) {
    return (!str || str.length === 0 );
}

function getLastOrCompany(customer){
    var lastOrCompany = "";
    if(!isEmpty(customer.lastName)) {
        lastOrCompany = customer.lastName;
    }else if (!isEmpty(customer.company)){
        lastOrCompany = customer.company;
    }
    return lastOrCompany;
}

module.exports = router;
