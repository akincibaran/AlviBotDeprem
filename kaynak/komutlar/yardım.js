const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const config = require("../config.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("yardım")
    .setDescription("Botun yardım menüsünü gösterir."),
  run: async (client, interaction) => {
    const embed = new EmbedBuilder()
      .setTitle("Alvi | Yardım Menüsü")
      .setThumbnail(client.user.avatarURL())
      .setColor("Blue")
      .setAuthor({
        name: "Alvi",
        iconURL: client.user.avatarURL({ dynamic: true }),
      })
      .setDescription(
        `**/yardım** \`=\` Yardım menüsünü gösterir.\n**/deprem** \`=\` Deprem Bilgi sistemi komutları.\n**/istatistik** \`=\` Bot istatistigi.\n**/ping** \`=\` Botun gecikme süresini gösterir.\nLinkler \`=>\`\n[Destek Sunucusu](${config.destek})\n[Destekle (Botu ekle)](${config.davet})`
      );

    interaction.reply({ embeds: [embed] });
  },
};
