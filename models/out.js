var mongoose = require('mongoose');

var OutSchema = new mongoose.Schema({
    date: Date,
    sentTo: String,
    description: String,
    comments: String,
    user: String,
    search: String,
    signature: String,
    signatureDate: Date,
    signatureUser: String
});

module.exports = mongoose.model('Out', OutSchema);
