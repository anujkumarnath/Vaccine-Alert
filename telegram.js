process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api');
const envs        = require('./env_config');

const bot = new TelegramBot(envs.TELEGRAM_BOT_TOKEN, {polling: false});

function sendMessage(groupId, message) {
	bot.sendMessage(groupId, message);
}

module.exports = sendMessage;
