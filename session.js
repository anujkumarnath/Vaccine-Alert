const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
	sessionId: String, 
	capacity: Number,
});

module.exports = mongoose.model('Session', sessionSchema); 
