const { prefix, token } = require("./config.json");
const { Client } = require("discord.js");
const DataLayer = require("./datalayer");

const config = {
  connectionString:
    "postgres://zoespcpd:1tM_nOhTx6f5-ohaXd9QgHasZLoGqrx0@raja.db.elephantsql.com:5432/zoespcpd"
};

const dl = new DataLayer(config);
console.log(dl);

const bot = new Client({
  disableEveryone: true,

  disabledEvents: ["TYPING_START"]
});

bot.on("ready", () => {
  bot.user.setActivity("Observing toxicity");
  console.log(
    `Bot is online!\n${bot.users.size} users, in ${
      bot.guilds.size
    } servers connected.`
  );
});

bot.on("guildCreate", guild => {
  console.log(
    `I've joined the guild ${guild.name} (${guild.id}), owned by ${
      guild.owner.user.username
    } (${guild.owner.user.id}).`
  );
});

bot.on("message", async message => {
  if (message.author.bot || message.system) return; // Ignore bots

  if (message.channel.type === "dm") {
    // Direct Message
    return; // Where most action will occur
  }

  console.log(message.content); // Log chat to console for debugging/testing

  if (message.content.indexOf(prefix) === 0) {
    let msg = message.content.slice(prefix.length); // slice of the prefix on the message

    let args = msg.split(" "); // break the message into part by spaces

    let cmd = args[0].toLowerCase(); // set the first word as the command in lowercase just in case

    args.shift(); // delete the first word from the args

    if (cmd === "report" || cmd === "bad") {
      // the first command [I don't like ping > pong]
      let targetName = args[0].slice(2, -1); // The user, removes <@> with slice
      let sender = message.member.user.id;
      let text = args.slice(1).join(" ");
      let result = dl.reportUser(targetName, sender, text, (err, result) => {
        console.log("HIT REPORT CALLBACK");
        if (err) {
          console.log(err);
        } else {
          console.log(result);
        }
      });
      return result;
    } else if (cmd === "ping") {
      return message.channel.send("pong");
    } else if (cmd === "getReports") {
      let targetName = args[0]; // The user
      dl.getuserReports(targetName);
      return;
    } else if (cmd === "praise") {
      let targetName = args[0]; // The user
      let sender = message.member.user.id;
      let text = args.slice(1).join(" ");
      let result = dl.praiseUser(targetName, sender, text, (err, isGood) => {
        if (isGood) {
          console.log("is good");
        } else {
          console.log(err);
        }
      });
      return;
    } else if (cmd === "score") {
      let targetName = args[0]; // The user
      dl.getUserScore(targetName);
      return;
    } else if (cmd === "getid") {
      let targetName = args[0]; // The user
      dl.getUserId(targetName);
      return targetName;
    } else {
      // if the command doesn't match, we reply with this. It should be a help command in the future.
      message.channel.send(`Command not found`);
      return;
    }
  } else if (
    message.content.indexOf("<@" + bot.user.id) === 0 ||
    message.content.indexOf("<@!" + bot.user.id) === 0
  ) {
    // Catch @Mentions
    return message.channel.send(`Use \`${prefix}\` to interact with me.`); //help people learn your prefix
  }
  return;
});

// Catch Errors before they crash the app.
process.on("uncaughtException", err => {
  const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, "g"), "./");
  console.error("Uncaught Exception: ", errorMsg);
  // process.exit(1); //Eh, should be fine, but maybe handle this?
});

process.on("unhandledRejection", err => {
  console.error("Uncaught Promise Error: ", err);
  // process.exit(1); //Eh, should be fine, but maybe handle this?
});

bot.login(token);
