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
        customer.firstName = req.body.firstName;
        customer.lastName = req.body.lastName;
        customer.email = req.body.email;
        customer.phone = req.body.phone;

        customer.save(function (err) {
            if (err)
                res.send(err);

            res.json({message: 'Customer created!'});
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
