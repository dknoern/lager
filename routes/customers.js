var express = require('express');
var router = express.Router();

var Customer = require('../models/customer');

router.use(function (req, res, next) {
    //console.log('Something is happening.');
    next();
});

router.route('/customers')
    .post(function (req, res) {
        var customer = new Customer();

        customer._id = req.body._id
        customer.firstName = req.body.firstName;
        customer.lastName = req.body.lastName;

        customer.company = req.body.company;
        customer.phone = req.body.phone;
        customer.email = req.body.email;

        customer.address1 = req.body.address1;
        customer.address2 = req.body.address2;
        customer.address3 = req.body.address3;
        customer.city = req.body.city;
        customer.state = req.body.state;
        customer.zip = req.body.zip;

        customer.billingAddress1 = req.body.billingAddress1;
        customer.billingAddress2 = req.body.billingAddress2;
        customer.billingAddress3 = req.body.billingAddress3;
        customer.billingCity = req.body.billingCity;
        customer.billingState = req.body.billingState;
        customer.billingZip = req.body.billingZip;

        var query = { _id: customer._id };
        Customer.findOneAndUpdate(query, customer, { upsert: true }, function (err, doc) {
            if (err) return res.send(500, { error: err });
            return res.send("succesfully saved");
        });

    })

    .get(function (req, res) {
        Customer.find(function (err, customers) {
            if (err)
                res.send(err);

            res.json(customers);
        });
    });

router.route('/customers/:customer_id')
    .get(function (req, res) {
        Customer.findById(req.params.customer_id, function (err, customer) {
            if (err)
                res.send(err);
            res.json(customer);
        });
    })

    .put(function (req, res) {
        Customer.findById(req.params.customer_id, function (err, customer) {
            if (err)
                res.send(err);
            customer.firstName = req.body.firstName;
            customer.lastName = req.body.lastName;
            customer.email = req.body.email;
            customer.phone = req.body.phone;
            customer.save(function (err) {
                if (err)
                    res.send(err);

                res.json({message: 'Customer updated!'});
            });
        });
    })

    .delete(function (req, res) {
        Customer.remove({
            _id: req.params.customer_id
        }, function (err, customer) {
            if (err)
                res.send(err);

            res.json({message: 'Successfully deleted'});
        });
    });

module.exports = router;
