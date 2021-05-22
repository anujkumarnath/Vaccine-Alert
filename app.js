// command to delete all documents
// db.sessions.deleteMany({})

const CronJob	 	= require('cron').CronJob;
const moment		= require('moment-timezone');
const envs          = require('./env_config');
const httpsRequest 	= require('./request');
const sendMessage 	= require('./telegram');
const sessionManager    = require('./session_manager');

const test = false;

async function check(pincode, date) {
	const options = {
		hostname: 'cdn-api.co-vin.in',
		port: 443,
		path: `/api/v2/appointment/sessions/public/calendarByPin?pincode=${pincode}&date=${date}`,
		method: 'GET'
	};
	try {
		let available = [];

		const data = await httpsRequest(options);
		const centers = JSON.parse(data).centers; 

		for (let i = 0; i < centers.length; i++) {
			const center = centers[i];
			//console.log(center);
			const name       = center.name;
			const address 	 = center.address;
			const block_name = center.block_name;
			const pincode	 = center.pincode;
			const sessions   = center.sessions;

			for (let j = 0; j < sessions.length; j++) {
				const session       = sessions[j];
				const sessionId     = session.session_id;
				const vaccine       = session.vaccine;
				const capacity	    = session.available_capacity;
				const dose1         = session.available_capacity_dose1; 
				const dose2         = session.available_capacity_dose2; 
				const min_age_limit = session.min_age_limit;
				const date          = session.date;

				// if sessioin already sent to the user skip the session
				if (await sessionManager.sessionExists({ sessionId, capacity })) continue;

				if (test) {
					available.push({date, min_age_limit, name, address, block_name, vaccine, capacity, dose1, dose2, pincode});

				} else if (min_age_limit === 18 && capacity > 0) {
					available.push({date, min_age_limit, name, address, block_name, vaccine, capacity, dose1, dose2, pincode});
				}

				// save the session in the db to skip in next iteration
				await sessionManager.addSession({ sessionId, capacity });
			}
		}

		return available;
	} catch (error) {
		console.log(error);
	}
}

let checkWithPincode = async (pincode, groupId) => {
	const tomorrow = moment().add(1, 'days').tz('Asia/Kolkata').format('DD-MM-YYYY');

	// checks from current date to next 7 days
	let available = await check(pincode, tomorrow);
	console.log(pincode, available);

	if (available && available.length > 0 ) {
		let text = test ? pincode + '\n' : '';
		available.forEach(center => {
			text += center.date + '\n'
			+ center.name + '\n'
			+ center.address + '\n'
			+ center.vaccine + '\n'
			+ 'Total: ' + center.capacity + '\n'
			+ 'Dose1: ' + center.dose1 + '\n'
			+ 'Dose2: ' + center.dose2 + '\n'
			+ '----------------------------------------------\n';
		});

		sendMessage(groupId, 'The following centers are available: \n----------------------------------------------\n' + text);
	}

};

function main() {
	if (test) {
		checkWithPincode(788710, envs.GROUPID_TEST);
		checkWithPincode(788001, envs.GROUPID_TEST);
		checkWithPincode(788003, envs.GROUPID_TEST);
		checkWithPincode(788004, envs.GROUPID_TEST);
		checkWithPincode(788166, envs.GROUPID_TEST);
	} else {
		checkWithPincode(788710, envs.GROUPID_788710);
		checkWithPincode(788001, envs.GROUPID_SILCHAR);
		checkWithPincode(788003, envs.GROUPID_SILCHAR);
		checkWithPincode(788004, envs.GROUPID_SILCHAR);
		checkWithPincode(788166, envs.GROUPID_788166);
	}
}

const app       = new CronJob('*/20 * * * * *', main, null, true, 'Asia/Kolkata');
const dbCleanup = new CronJob('0 2 * * *', sessionManager.deleteAllSessions, null, true, 'Asia/Kolkata');

app.start();
dbCleanup.start();
