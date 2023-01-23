const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const databs = require("../models/schema");
const fetch = require("node-fetch");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deprem")
    .setDescription("deprem")
    .addSubcommand((subcommand) => {
      return subcommand
        .setName("otomatik-kur")
        .setDescription("Sistemi otomatik olarak kurarsınız.");
    })
    .addSubcommand((subcommand) => {
      return subcommand
        .setName("aç")
        .setDescription("Sistemi açarsınız.");
    })
    .addSubcommand((subcommand) => {
      return subcommand
        .setName("kapat")
        .setDescription("Sistemi kapatırsınız.");
    })
    .addSubcommand((subcommand) => {
      return subcommand
        .setName("ayarlar")
        .setDescription("Deprem bilgi ayarlarını.");
    })
    .addSubcommand((subcommand) => {
      return subcommand
        .setName("sıfırla")
        .setDescription("Sistemi sıfırlarsınız.");
    })
    .addSubcommand((subcommand) => {
      return subcommand
        .setName("son-depremler")
        .setDescription("Son depremlere liste şeklinde atar.")
        .addIntegerOption((option) => {
          return option
            .setName("sayı")
            .setDescription("Ne kadar deprem görmek istediğinizi seçin.")
            .setMinValue(1)
            .setMaxValue(20)
            .setRequired(true);
        });
    })
    .addSubcommand((subcommand) => {
      return subcommand
        .setName("kanal")
        .setDescription("Deprem bilgi kanalını ayarlarsınız.")
        .addChannelOption((option) => {
          return option
            .setName("kanal")
            .setDescription("Deprem bilgi olarak ayarlanıcak kanalı seçiniz.")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true);
        });
    }),
  run: async (client, interaction) => {
    if (!interaction.member.permissions.has("Administrator")) {
      return interaction.reply({
        ephemeral: true,
        content:
          "Bu komutu kullanmak için **Yönetici** yetkisine ihtiyacın var.",
      });
    }

    if (interaction.options.getSubcommand() === "otomatik-kur") {
      try {
        let a = await databs.find({ sunucu: interaction.guild.id });

        if (a.status)
          return interaction.reply({
            ephemeral: true,
            content: "Deprem Bilgi sistemi zaten kurulmuş.",
          });

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`onay`)
            .setLabel("✅")
            .setStyle(ButtonStyle.Success)
        );

        const embed = new EmbedBuilder()
          .setAuthor({
            name: "Alvi",
            iconURL: client.user.avatarURL({ dynamic: true }),
          })
          .setThumbnail(client.user.avatarURL())
          .setColor("Blue")
          .setTitle("Alvi | Otomatik Kurulum")
          .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.avatarURL({ dynamic: true }),
          })
          .setDescription(
            `**Deprem Bilgi sistemini otomatik kurmak istermisiniz?**\n**Bu işlemi onaylıyorsanız aşagıdaki butona basın.**\n**30 saniye içinde butona basılmazsa işlemi reddetmiş olursunuz.**\n**İşlemin düzgün ayarlanabilmesi için bota gerekli yetkileri verin.**    `
          );

        const message = await interaction.reply({
          embeds: [embed],
          components: [row],
          fetchReplu: true,
        });

        const row2 = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`deaktif`)
            .setLabel("Mesaj aktif değil")
            .setDisabled(true)
            .setStyle(ButtonStyle.Danger)
        );

        const collector = interaction.channel.createMessageComponentCollector({
          time: 150000,
        });

        collector.on("collect", async (i) => {
        if (!i.isButton()) return;
        if (i.user.id != interaction.user.id) return;

          if (i.customId === `onay`) {
            let kanalad = "deprem-bilgi";
            interaction.guild.channels
              .create({
                name: kanalad,
                permissionOverwrites: [
                  {
                    id: interaction.guild.id,
                    allow: ["ViewChannel"],
                    deny: ["SendMessages"],
                  },
                ],
              })
              .then(async (kanal) => {
                new databs({
                  kanal: kanal.id,
                  sunucu: interaction.guild.id,
                  status: true,
                  channel: true,
                }).save();

                const row3 = new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setCustomId(`başarılı`)
                    .setLabel("Otomatik Kurulum Gerçekleşti.")
                    .setDisabled(true)
                    .setStyle(ButtonStyle.Success)
                );

                await i.update({
                  content:
                    "Otomatik kurulum başarılı bir şekilde gerçekleştirildi!",
                  components: [row3],
                });

                await kanal.send({
                  content:
                    "Bu kanal deprem bilgi kanalı olarak ayarlandı. (Otomatik Kurulum)",
                });
              });
          }
        });

        collector.on("end", () => {
          message.editUpdate({ componnets: [row2] });
        });
      } catch (err) {
        console.error(err);
      }
    } else if (interaction.options.getSubcommand() === "kanal") {
      const channel = interaction.options.getChannel("kanal");

      try {
        let a = await databs.findOne({ sunucu: interaction.guild.id });
        if (channel.id === a.kanal || "YOK") {
          const embed = new EmbedBuilder()
            .setAuthor({
              name: "Alvi",
              iconURL: client.user.avatarURL({ dynamic: true }),
            })
            .setColor("Blue")
            .setDescription(
              `**Zaten bu kanal deprem bilgi kanalı olarak ayarlı.** Bunun bir hata oldugunu düşünüyorsan [destek sunucusuna](${config.destek}) katılarak bize ulaşabilirsin.`
            );
          return interaction.reply({ ephemeral: true, embeds: [embed] });
        }
      } catch (err) {
        console.log(err);
      }

      await databs.findOneAndDelete({ sunucu: interaction.guild.id });

      await client.channels.cache
        .get(channel.id)
        .send({ content: `Bu kanal deprem bilgi kanalı olarak ayarlandı` });

      await new databs({
        kanal: channel.id,
        sunucu: interaction.guild.id,
        status: true,
        channel: true,
      }).save();

      const embed2 = new EmbedBuilder()
        .setDescription("Deprem Bilgi kanalı ${channel} olarak ayarlandı.")
        .setColor("Blue");
      interaction.reply({ embeds: [embed2] });
    } else if (interaction.options.getSubcommand() === "kapat") {
      try {
        let a = await databs.findOne({ sunucu: interaction.guild.id });

        if (a.status === false)
          return interaction.reply({
            ephemeral: true,
            content: "Deprem Bilgi sistemi zaten kapalı.",
          });

        await databs.findOneAndUpdate({
          sunucu: interaction.guild.id,
          status: false,
        });
        await databs.updateOne({ sunucu: interaction.guild.id }, { status: false });
      } catch (err) {
        console.log(err);
        return interaction.reply({
          ephemeral: true,
          content: "Sistem kapatılırken bir sorun oluştu.",
        });
      }

      const embed3 = new EmbedBuilder()
        .setDescription("Deprem Bilgi sistemi başarıyla kapatıldı.")
        .setColor("Blue");
      interaction.reply({ embeds: [embed3] });
    } else if (interaction.options.getSubcommand() === "aç") {
      try {
        let a = await databs.find({ sunucu: interaction.guild.id });

        if (a.status === true)
          return interaction.reply({
            ephemeral: true,
            content: "Deprem Bilgi sistemi zaten açık.",
          });

        await databs.findOneAndUpdate({
          sunucu: interaction.guild.id,
          status: true,
        });
      } catch (err) {
        console.log(err);

        return interaction.reply({
          ephemeral: true,
          content: "Sistem açılırken bir sorun oluştu.",
        });
      }

      const embed4 = new EmbedBuilder()
        .setDescription("Deprem Bilgi sistemi başarıyla açıldı.")
        .setColor("Blue");
      interaction.reply({ embeds: [embed4] });
    } else if (interaction.options.getSubcommand() === "sıfırla") {
      try {
        eval(await databs.deleteOne({ sunucu: interaction.guild.id }));
      } catch (err) {
        console.log(err);
        return interaction.reply({
          ephemeral: true,
          content: "Sistem sıfırlanırken bir sorun oluştu.",
        });
      }

      const embed3 = new EmbedBuilder()
        .setDescription("Deprem Bilgi sistemi başarıyla sıfırlandı.")
        .setColor("Blue");
      interaction.reply({ embeds: [embed3] });
    } else if (interaction.options.getSubcommand() === "ayarlar") {
      let x = await databs.findOne({ sunucu: interaction.guild.id });

      let kanal;
      if (x == null) kanal = "**🔴 Kanal ayarlanmamış.**";
      else kanal = `✅ **Kanal ayarlı.** (<#${x.kanal}>)`;

      let durum;
      if (x == null || x.status == "false")
        durum = "**🔴 Sistem aktif değil.**";
      else durum = `✅ **Sistem aktif.**`;

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${interaction.guild.name} | Deprem Bilgi Sistemi`,
          iconURL:
            interaction.guild.iconURL({ dynamic: true }) ||
            client.user.avatarURL(),
        })
        .setThumbnail(
          interaction.guild.iconURL({ dynamic: true }) ||
            client.user.avatarURL()
        )
        .setColor("Blue")
        .addFields(
          {
            name: "📖 Sunucu Adı",
            value: interaction.guild.name,
            inline: false,
          },
          {
            name: "🎟 Sunucu Kimliği (ID)",
            value: interaction.guild.id,
            inline: false,
          },
          { name: "🔨 Deprem Sistemi Durumu", value: durum, inline: true },
          { name: "🍁 Deprem Kanal", value: kanal, inline: true }
        );

      interaction.reply({ embeds: [embed] });
    } else if (interaction.options.getSubcommand() === "son-depremler") {
      const sayı = interaction.options.getInteger("sayı");
      if (sayı > 20)
        return interaction.reply({
          ephemeral: true,
          content: "En fazla 20 tane deprem görüntüleyebilirsiniz.",
        });

      try {
        await fetch(
          `https://api.orhanaydogdu.com.tr/deprem/live.php?limit=${sayı}`
        )
          .then((res) => res.json())
          .then((json) => {
            let cikti = json.result;
            var bot = "";
            const embed = new EmbedBuilder()
              .setTitle(`Deprem Listesi (${sayı})`)
              .setColor("Blue")
              .setThumbnail(client.user.avatarURL())
              .setFooter({
                text: "Depremlerden etkilenen herkese geçmiş olsun...",
                iconURL: client.user.avatarURL(),
              });
            for (const ayn of cikti) {
              embed.addFields({
                name: `${ayn.lokasyon}`,
                value: `**Zaman:** <t:${ayn.timestamp}> (<t:${ayn.timestamp}:R>)\n **Büyüklük:** ${ayn.mag}\n **Derinlik:** ${ayn.depth}km \n`,
                inline: false,
              });
            }

            interaction.reply({ embeds: [embed] });
          });
      } catch (err) {
        console.log(err);
        return interaction.reply({
          ephemeral: true,
          content: "Listeyi gönderirken bir sorun oluştu.",
        });
      }
    }
  },
};
