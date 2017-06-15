var mongoose     = require('mongoose');

var Schema = new mongoose.Schema();

var LineItemSchema   = new mongoose.Schema({
	name: String,
	amount: Number
});


module.exports = mongoose.model('LineItem', LineItemSchema);
