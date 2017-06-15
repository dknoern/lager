var mongoose     = require('mongoose');

var CustomerSchema   = new mongoose.Schema({
	    firstName: String,
	    LastMName: String,
	    email: String,
	    phone: String
});

module.exports = mongoose.model('Customer', CustomerSchema);
