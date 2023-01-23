const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const config = require("../config.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Botun gecikme bilgilerini gösterir."),
  run: async (client, interaction) => {
    const embed = new EmbedBuilder()
      .setThumbnail(client.user.avatarURL())
      .setColor("Blue")
      .setAuthor({
        name: "Alvi",
        iconURL: client.user.avatarURL({ dynamic: true }),
      })
      .setDescription(`Ping : ${client.ws.ping}`);

    interaction.reply({ embeds: [embed] });
  },
};
