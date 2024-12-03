const { Telegraf } = require('telegraf');
const fs = require('fs');
const winston = require('winston');
require('dotenv').config();

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.File({ filename: 'bot.log' })
    ]
});

const bot = new Telegraf(process.env.BOT_TOKEN);

function generateFileListMessage(files) {
    logger.info(`Generated a file list message`);
    let message = '<b>Available Files:</b>\n\n';

    files.forEach(file => {
        message += `<b>[${file.id}]</b> ${file.name}\n`;
    });

    message += `\nTo download a file, type /files get &lt;id&gt;`;
    return message;
}

bot.start((ctx) => {
    logger.info(`User ${ctx.from.username} started the bot`);
    ctx.replyWithHTML(
        `Welcome, <b>${ctx.from.first_name}</b>!\nI'm PontusBot, an open source Telegram bot.\nHow can I help you?`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: 'Help', callback_data: 'help' },
                        { text: 'About', callback_data: 'about' }
                    ]
                ]
            }
        }
    );
});

bot.help((ctx) => {
    logger.info(`User ${ctx.from.username} requested help`);
    ctx.replyWithHTML('Please choose a topic:', {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'General', callback_data: 'general' },
                    { text: 'Files', callback_data: 'hfiles' },
                    { text: 'Management', callback_data: 'management' },
                    { text: 'Go Back', callback_data: 'start' }
                ]
            ]
        }
    });
});

bot.command('about', (ctx) => {
    logger.info(`User ${ctx.from.username} requested about information`);
    ctx.replyWithHTML(
        `<b>About PontusBot</b>\n\nPontusBot is an open source Telegram bot created by ihatenodejs.\n\nSource code: <a href="https://github.com/ihatenodejs/pontus-bot">Available on GitHub</a>`,
        {
            parse_mode: 'HTML'
        }
    );
});

bot.command('files', (ctx) => {
    const args = ctx.message.text.split(' ');
    if (args[1] === 'list') {
        logger.info(`User ${ctx.from.username} requested file list`);
        fs.readFile('files.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                ctx.reply('Failed to load files.');
                return;
            }

            const files = JSON.parse(data).apkFiles;
            const message = generateFileListMessage(files);

            ctx.replyWithHTML(message);
        });
    } else if (args[1] === 'get' && args[2]) {
        logger.info(`User ${ctx.from.username} requested to download file with ID: ${args[2]}`);
        const fileId = args[2];
        fs.readFile('files.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                ctx.reply('Failed to load files.');
                return;
            }

            const files = JSON.parse(data).apkFiles;
            const file = files.find(f => f.id === fileId);

            if (file) {
                if (file.multipleArch) {
                    let message = `<b>File found successfully:</b>\n\n`;
                    message += `<b>${file.name}</b>\n`;
                    message += `${file.isMod ? '<b>MODDED</b>\n' : ''}`;
                    message += `Author: ${file.author}\n\n`;
                    message += `Please select an architecture:`;
                
                    ctx.replyWithHTML(message, {
                        reply_markup: {
                            inline_keyboard: [
                                ...file.architectures.map(arch => [
                                    { text: arch.architecture, callback_data: `arch_${file.id}_${arch.architecture}` }
                                ]),
                                [{ text: 'Go Back', callback_data: 'files' }]
                            ]
                        }
                    });
                } else {
                    let message = `<b>File found successfully:</b>\n\n`;
                    message += `<b>${file.name}</b>\n`;
                    message += `${file.isMod ? '<b>MODDED</b>\n' : ''}`;
                    message += `Author: ${file.author}\n`;
                    message += `Architecture: ${file.architecture}\n`;
                    message += `\n`;
                    message += `<a href="${file.link}">Download</a>\n`;
                
                    ctx.replyWithHTML(message, {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Go Back', callback_data: 'files' }]
                            ]
                        }
                    });
                }
            } else {
                ctx.reply('File not found.');
            }
        });
    } else {
        logger.info(`User ${ctx.from.username} entered an invalid command`);
        ctx.replyWithHTML('Invalid command. Please use the format /files list or /files get &lt;id&gt;');
    }
});

// ACTIONS

bot.action('help', (ctx) => {
    logger.info(`User ${ctx.from.username} requested help (via action)`);
    ctx.answerCbQuery();
    ctx.editMessageText('Please choose a topic:', {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'General', callback_data: 'general' },
                    { text: 'Files', callback_data: 'hfiles' },
                    { text: 'Management', callback_data: 'management' },
                    { text: 'Go Back', callback_data: 'start' }
                ]
            ]
        }
    });
});

bot.action('start', (ctx) => {
    logger.info(`User ${ctx.from.username} went to welcome menu (via action)`);
    ctx.answerCbQuery();
    ctx.editMessageText(
        `Welcome, <b>${ctx.from.first_name}</b>!\nI'm PontusBot, an open source Telegram bot.\nHow can I help you?`,
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: 'Help', callback_data: 'help' },
                        { text: 'About', callback_data: 'about' }
                    ]
                ]
            }
        }
    );
});

bot.action('general', (ctx) => {
    logger.info(`User ${ctx.from.username} requested general commands help (via action)`);
    ctx.answerCbQuery();
    ctx.editMessageText(
        `<b>General Commands</b>\n\n/start - Start the bot\n/help - Show the help menu\n/about - Show information about the bot`,
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Go Back', callback_data: 'help' }]
                ]
            }
        }
    );
});

bot.action('about', (ctx) => {
    logger.info(`User ${ctx.from.username} requested about message (via action)`);
    ctx.answerCbQuery();
    ctx.editMessageText(
        `<b>About PontusBot</b>\n\nPontusBot is an open source Telegram bot created by ihatenodejs.\n\nSource code: <a href="https://github.com/ihatenodejs/pontus-bot">Available on GitHub</a>`,
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Go Back', callback_data: 'start' }]
                ]
            }
        }
    );
});

bot.action('hfiles', (ctx) => {
    logger.info(`User ${ctx.from.username} requested file commands help (via action)`);
    ctx.answerCbQuery();
    ctx.editMessageText(
        `<b>File Commands</b>\n\n/files list - List all available files\n/files get <i>file_id</i> - Download a file by ID`,
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Go Back', callback_data: 'help' }]
                ]
            }
        }
    );
});

bot.action('management', (ctx) => {
    logger.info(`User ${ctx.from.username} requested management commands help (via action)`);
    ctx.answerCbQuery();
    ctx.editMessageText('Coming soon...', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Go Back', callback_data: 'help' }]
            ]
        }
    });
});

bot.action('files', (ctx) => {
    logger.info(`User ${ctx.from.username} requested file list (via action)`);
    fs.readFile('files.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            ctx.reply('Failed to load files.');
            return;
        }

        const files = JSON.parse(data).apkFiles;
        const message = generateFileListMessage(files);

        ctx.editMessageText(message, {
            parse_mode: 'HTML'
        });
    });
});

bot.action(/download_(.+)/, (ctx) => {
    logger.info(`User ${ctx.from.username} called /download (via action)`);
    const fileId = ctx.match[1];
    fs.readFile('files.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            ctx.reply('Failed to load files.');
            return;
        }

        const files = JSON.parse(data).apkFiles;
        const file = files.find(f => f.id === fileId);

        if (file) {
            if (file.multipleArch) {
                let message = `<b>File found successfully:</b>\n\n`;
                message += `<b>${file.name}</b>\n`;
                message += `${file.isMod ? '<b>MODDED</b>\n' : ''}`;
                message += `Author: ${file.author}\n\n`;
                message += `Please select an architecture:`;
            
                ctx.replyWithHTML(message, {
                    reply_markup: {
                        inline_keyboard: [
                            ...file.architectures.map(arch => [
                                { text: arch.architecture, callback_data: `arch_${file.id}_${arch.architecture}` }
                            ]),
                            [{ text: 'Go Back', callback_data: 'files' }]
                        ]
                    }
                });
            } else {
                let message = `<b>File found successfully:</b>\n\n`;
                message += `<b>${file.name}</b>\n`;
                message += `${file.isMod ? '<b>MODDED</b>\n' : ''}`;
                message += `Author: ${file.author}\n`;
                message += `Architecture: ${file.architecture}\n`;
                message += `\n`;
                message += `<a href="${file.link}">Download</a>\n`;
            
                ctx.replyWithHTML(message, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Go Back', callback_data: 'files' }]
                        ]
                    }
                });
            }
        } else {
            ctx.reply('File not found.');
        }
    });
});

bot.action(/arch_(.+)_(.+)/, (ctx) => {
    logger.info(`User ${ctx.from.username} called /arch (via action)`);
    const [fileId, arch] = ctx.match.slice(1);
    fs.readFile('files.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            ctx.reply('Failed to load files.');
            return;
        }

        const files = JSON.parse(data).apkFiles;
        const file = files.find(f => f.id === fileId);

        if (file) {
            const selectedArch = file.architectures.find(a => a.architecture === arch);

            if (selectedArch) {
                let message = `<b>File found successfully:</b>\n\n`;
                message += `<b>${file.name}</b>\n`;
                message += `Size: ${selectedArch.fileSize}\n`;
                message += `${file.isMod ? '<b>MODDED</b>\n' : ''}`;
                message += `Author: ${file.author}\n`;
                message += `Architecture: ${selectedArch.architecture}\n`;
                message += `\n`;
                message += `<a href="${selectedArch.link}">Download</a>\n`;
                
                ctx.editMessageText(message, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Go Back', callback_data: `download_${file.id}` }]
                        ]
                    }
                });
            } else {
                ctx.reply('Architecture not found.');
            }
        } else {
            ctx.reply('File not found.');
        }
    });
});

bot.launch();
console.log('Bot is running...\n');
logger.info(`Bot started successfully`);