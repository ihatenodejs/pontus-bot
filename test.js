const { Telegraf } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.launch().then(() => {
    console.log('Bot is working!');
    process.exit(0);
}).catch((err) => {
    console.error('Failed:', err);
    process.exit(1);
});