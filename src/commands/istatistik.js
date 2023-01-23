const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const db = require("../models/schema.js");
const config = require("../config.js");
require("moment-duration-format");
const moment = require("moment");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("istatistik")
    .setDescription("Botun istatistiksel bilgilerini gösterir."),
  run: async (client, interaction) => {
    var mongoose = require("mongoose");
    let a = "";
    let b = mongoose.connection.readyState;
    if (b === 0) a = "Bağlantı Koptu";
    if (b === 1) a = "Bağlı";
    if (b === 2) a = "Bağlanılıyor";
    if (b === 3) a = "Bağlantı Kesiliyor";
    if (b === 99) a = "Aktif Degil";

    let x = await db.find();

    const uptime = moment
      .duration(client.uptime)
      .format(" D [gün], H [saat], m [dakika], s [saniye]");
    const embed = new EmbedBuilder()
      .setAuthor({
        name: "Alvi",
        iconURL: client.user.avatarURL({ dynamic: true }),
      })
      .setTitle("Alvi | Yardım Menüsü")
      .setThumbnail(client.user.avatarURL())
      .setColor("Blue")
      .addFields(
        { name: "Aktiflik Süresi:", value: `${uptime}`, inline: true },
        { name: "Kütüphane:", value: "discord.js", inline: true },
        {
          name: "Kullanıcı Sayısı:",
          value: `${client.guilds.cache
            .reduce((a, b) => a + b.memberCount, 0)
            .toLocaleString()}`,
          inline: true,
        },
        {
          name: "Sunucu Sayısı:",
          value: `${client.guilds.cache.size.toLocaleString()}`,
          inline: true,
        },
        { name: "Ping:", value: `${client.ws.ping}ms`, inline: true },
        { name: "Database Durumu:", value: `${a}`, inline: true },
        {
          name: "Deprem Bilgi Sistemi ayarlı olan sunucu sayısı:",
          value: `${x.length || 0}`,
          inline: true,
        },
        {
          name: "Link:",
          value: `[Destek Sunucusu](${config.destek})\n[Destekle (Botu ekle)](${config.davet})`,
          inline: true,
        }
      );

    interaction.reply({ embeds: [embed] });
  },
};
