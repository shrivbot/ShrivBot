import { prefix, owner, token } from './config.json';
import { Client } from 'discord.js';
import { inspect } from 'util';

const bot = new Client({
    disableEveryone: true,
    disabledEvents: ['TYPING_START']
});

bot.on("ready", () => {
    bot.user.setGame('Observing toxicity'); 
    console.log(`Bot is online!\n${bot.users.size} users, in ${bot.guilds.size} servers connected.`);
});

bot.on("guildCreate", guild => {
    console.log(`I've joined the guild ${guild.name} (${guild.id}), owned by ${guild.owner.user.username} (${guild.owner.user.id}).`);
});

bot.on("message", async message => { 

    if(message.author.bot || message.system) return; // Ignore bots
    
    if(message.channel.type === 'dm') { // Direct Message
        return; // Where most action will occur
    } 

    console.log(message.content); // Log chat to console for debugging/testing
    
    if (message.content.indexOf(prefix) === 0) {
        
        let msg = message.content.slice(prefix.length); // slice of the prefix on the message

        let args = msg.split(" "); // break the message into part by spaces

        let cmd = args[0].toLowerCase(); // set the first word as the command in lowercase just in case

        args.shift(); // delete the first word from the args

        
        if (cmd === 'report' || cmd === 'bad') { // the first command [I don't like ping > pong]
            let targetName = args[1].toLowerCase(); // The user
            return; 
        }

        else if (cmd === 'ping') {
            return message.channel.send('pong');
        }

        else { // if the command doesn't match, we reply with this. It should be a help command in the future.
            message.channel.send(`Command not found`);
            return;
        }
        
    } else if (message.content.indexOf("<@"+bot.user.id) === 0 || message.content.indexOf("<@!"+bot.user.id) === 0) { // Catch @Mentions
        return message.channel.send(`Use \`${prefix}\` to interact with me.`); //help people learn your prefix
    }
    return;
});

// Catch Errors before they crash the app.
process.on('uncaughtException', (err) => {
    const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, 'g'), './');
    console.error('Uncaught Exception: ', errorMsg);
    // process.exit(1); //Eh, should be fine, but maybe handle this?
});

process.on('unhandledRejection', err => {
    console.error('Uncaught Promise Error: ', err);
    // process.exit(1); //Eh, should be fine, but maybe handle this?
});

bot.login(token);