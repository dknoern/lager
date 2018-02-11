var express = require('express');
var router = express.Router();
var LogItem = require('../models/logitem');
var Counter = require('../models/counter');
const checkJwt = require('./jwt-helper').checkJwt;

router.use(function (req, res, next) {
    next();
});



var getNextSequence = function () {
    Counter.findByIdAndUpdate({
        _id: 'logItemId'
    }, {
        $inc: {
            seq: 1
        }
    }, function (error, counter) {
        return counter.seq;
    });
}

var upsertLogItem = function (req, res, logItemId, action) {

    LogItem.findOneAndUpdate({
            _id:
            logItemId
        },
        {

            "$set":
                {
                    "_id":
                    logItemId,
                    "itemNumber":
                    req.body.itemNumber,
                    "title":
                    req.body.title,
                    "customerName":
                    req.body.customerName,
                    "receivedBy":
                    req.body.receivedBy,
                    "receivedFrom":
                req.body.receivedFrom,
                    "comments":
                    req.body.comments,
                    "date":
                        new Date()
                }
        }
        ,
        {
            upsert: true
        }
        ,

        function (err, doc) {
            if (err) return res.send(500, {
                error: err
            });
            return res.send("succesfully saved");
        }
    )
    ;
}


router.route('/logitems')

    .get(function(req, res) {
        res.send('hi there')
    })
    .post(checkJwt, function (req, res) {

        if (req.body._id == null) {

            Counter.findByIdAndUpdate({
                _id: 'productNumber'
            }, {
                $inc: {
                    seq: 1
                }
            }, function (err, counter) {
                if (err) {
                    console.log(err);
                    return res.send(500, {
                        error: err
                    });
                }
                return upsertLogItem(req, res, counter.seq, "logItem created");
            });
        } else {
            return upsertLogItem(req, res, req.body._id, "logItem updated");
        }
    });


router.route('/logitems/:item_id')
    .get(checkJwt, function(req, res) {

        if (req.params.item_id) {
            LogItem.findById(req.params.item_id, function(err, logitem) {
                if (err)
                    res.send(err);
                res.json(logitem);
            });
        }
    })

    .put(checkJwt, function(req, res) {
        LogItem.findById(req.params.item_id, function(err, logitem) {
            if (err)
                res.send(err);

            logitem.itemNumber = req.body.itemNumber;
            logitem.receivedFrom = req.body.receivedFrom;
            logitem.title = req.body.title;
            logitem.customerName = req.body.customerName;
            logitem.receivedBy = req.body.receivedBy;
            logitem.comments = req.body.comments;

            logitem.save(function(err) {
                if (err)
                    res.send(err);
                res.json({
                    message: 'Item updated!'
                });
            });
        });
    })

    .delete(checkJwt, function(req, res) {

        LogItem.findById(req.params.item_id, function(err, logitem) {
            if (err)
                res.send(err);
            logitem.status = 'Deleted';
            logitem.save(function(err) {
                if (err)
                    res.send(err);
                res.json({
                    message: 'Item updated!'
                });
            });
        });

    });

module.exports = router;

