var express = require('express');
var router = express.Router();
var Counter = require('../models/counter');
var Customer = require('../models/customer');

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

    customer.search = customer._id + " " + customer.firstName + " " + customer.lastName + " " +customer.city + " " + customer.email + " " + customer.phone + " " + customer.country;

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

            'search': new RegExp(search, 'i')

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
                        customers[i].firstName + ' ' + customers[i].lastName,
                       cityAndState,
                        customers[i].email,
                        customers[i].phone,
                        customers[i].company
                    ]
                );
            }

            Customer.count({}, function(err, count) {
                results.recordsTotal = count;

                if (search == '' || search == null) {
                    results.recordsFiltered = count;
                    res.json(results);
                } else {
                    Customer.count({
                        $or: [{
                                'firstName': new RegExp(search, 'i')
                            },
                            {
                                'lastName': new RegExp(search, 'i')
                            },
                            {
                                'city': new RegExp(search, 'i')
                            },
                            {
                                'state': new RegExp(search, 'i')
                            },
                            {
                                'phone': new RegExp(search, 'i')
                            },
                            {
                                'email': new RegExp(search, 'i')
                            },
                            {
                                'company': new RegExp(search, 'i')
                            }
                        ]
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
        Customer.remove({
            _id: req.params.customer_id
        }, function(err, customer) {
            if (err)
                res.send(err);
            res.json({
                message: 'Successfully deleted'
            });
        });
    });

module.exports = router;
