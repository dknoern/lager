var mongoose = require('mongoose');

var Schema = new mongoose.Schema();

var Counter = require('./counter');

//var CounterSchema = new mongoose.Schema({
//    _id: {type: String, required: true},
//    seq: {type: Number, default: 0}
//});
//var CounterSchema = require('./invoice');

var ReturnSchema = new mongoose.Schema({
    customer: String,
    customerId: String,
    project: String,
    invoiceNumber: String,
    returnNumber: String,
    parentInvoiceId: String,
    parentInvoiceNumber: String,
    date: String,
    subtotal: String,
    tax: String,
    shipping: Number,
    total: String,
    salesPerson: String,
    lineItems: [{
        lineItemId: String,
        included: Boolean,
        name: String,
        amount: Number
    }]
});
/*
ReturnSchema.pre('save', function (next) {
    var doc = this;

    if (doc.rerturnNumber==null) {
        Counter.findByIdAndUpdate({_id: 'returnNumber'}, {$inc: {seq: 1}}, function (error, counter) {
            if (error)
                return next(error);
            doc.returnNumber = counter.seq;
            console.log("--------- returnNumberIs " + doc.returnNumber);

            next();
        });
    }else{
        next();
    }
});
*/



module.exports = mongoose.model('Return', ReturnSchema);
