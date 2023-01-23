const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  EmbedBuilder
} = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
  ],
  shards: "auto",
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Reaction,
    Partials.GuildScheduledEvent,
    Partials.User,
    Partials.ThreadMember,
  ],
});
const config = require("./src/config.js");
const { readdirSync } = require("fs");
const moment = require("moment");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const db = require("quick.db");

let token = config.token;

client.commands = new Collection();

const rest = new REST({ version: "10" }).setToken(token);

const log = (l) => {
  console.log(`[${moment().format("DD-MM-YYYY HH:mm:ss")}] ${l}`);
};

//command-handler
const commands = [];
readdirSync("./src/commands").forEach(async (file) => {
  const command = require(`./src/commands/${file}`);
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
});

client.on("ready", async () => {
  try {
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    });
  } catch (error) {
    console.error(error);
  }
  log(`${client.user.username} Aktif Edildi!`);
});

//event-handler
readdirSync("./src/events").forEach(async (file) => {
  const event = require(`./src/events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
});
//

client.login(token);

const datas = require("./src/models/schema.js")

setInterval(async () => {
  let mongo = require("mongoose");
  if (mongo.connection.readyState != 1) return;

  let x = await datas.find();
  if (x.length <= 0) return;
  try {
    await fetch(`https://api.orhanaydogdu.com.tr/deprem/live.php?limit=1`)
      .then((res) => res.json())
      .then((json) => {
        x.forEach(async (a) => {
          let cikti = json.result;
        
          const embed = new EmbedBuilder()
            .setColor("Blue")
            .setThumbnail(client.user.avatarURL())
            .setFooter({
              text: "Depremden etkilenen herkese geçmiş olsun...",
              iconURL: client.user.avatarURL()
            });
          for (const ayn of cikti) {
            console.log(ayn)
            embed.setDescription(
              `**${ayn.lokasyon}**\n **Zaman:** <t:${ayn.timestamp}> (<t:${ayn.timestamp}:R>)\n **Büyüklük:** ${ayn.mag}\n **Derinlik:** ${ayn.depth}km`
            );

            let deprem = await db.fetch(`sondeprem`);
            if (deprem === ayn.timestamp) {
              return;
            }

            await db.set(`sondeprem`, ayn.timestamp);

            if (a.status == "false") {
              return;
            }
            client.channels.cache
              .get(a.kanal)
              .send({ embeds: [embed] })
              .catch((err) => {
                console.log(err);
              });
          }
        });
      });
  } catch (err) {
    console.log(err);
  }
}, 20000);

const mongoose = require('mongoose');
mongoose.connect(config.mongo);
const dba = mongoose.connection;

dba.on('error', console.error.bind(console, 'Connection error:'));
dba.once('open', () => {
    console.log('[Info] Connection: TRUE');
});
