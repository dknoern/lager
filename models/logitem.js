var mongoose     = require('mongoose');

var LogItemSchema   = new mongoose.Schema({
  	_id: String,
	itemNumber: String,
	receivedFrom: String,
	title: String,
	customerName: String,
	receivedBy: String,
	comments: String,
    date: Date
});



module.exports = mongoose.model('LogItem', LogItemSchema);
