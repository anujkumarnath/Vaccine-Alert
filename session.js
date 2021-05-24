const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
	sessionId     : String,
	capacity      : Number,
	min_age_limit : Number,
});

module.exports = mongoose.model('Session', sessionSchema); 
