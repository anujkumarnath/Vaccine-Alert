const https = require('https');

module.exports = function httpsRequest(options) {
	return new Promise((resolve, reject) => {
		const req = https.request(options, res => {
			res.on('data', d => {
				resolve(d);
			});

			req.on('error', error => {
				reject(error);
			});

		});
		req.end()
	});
}
