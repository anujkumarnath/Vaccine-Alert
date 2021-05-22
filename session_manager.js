const db                = require('./db');
const Session           = require('./session');

let sessionManager = {};

sessionManager.sessionExists = async (session) => {
	let sess = await Session.findOne({ 
		sessionId : session.sessionId,
		capacity  : session.capacity
	});

	if (sess) {
		console.log('Session exists');
		return true;
	}

	return false;
};

sessionManager.addSession = async (session) => {

	if (await sessionManager.sessionExists(session)) return;

	await Session.collection.insertOne({
		sessionId : session.sessionId,
		capacity  : session.capacity, 
	});

	console.log('Session inserted');
};

sessionManager.deleteAllSessions = async() => {
	await Session.collection.deleteMany({});
	console.log('Deleted all sessions');
};

module.exports = sessionManager;
