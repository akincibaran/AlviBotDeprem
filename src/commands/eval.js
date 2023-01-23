const {
  EmbedBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const config = require("../config");
const Discord = require("discord.js");
const { inspect } = require("util");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("eval")
    .setDescription("eval")
    .addStringOption((option) =>
      option.setName("function").setDescription("function").setRequired(true)
    ),
  run: async (client, interaction) => {
    let code = interaction.options.getString("function");
    let hi = interaction.options.getString("function");
    let depth = 0;
    const originalCode = code;

    if(interaction.user.id != "1062005290997915688") {
        interaction.reply({ content: "Bu komutu sadece geliştiricilerim kullanabilir." })
    }
    
    try {
      if (originalCode.includes("--str"))
        code = `${code.replace("--str", "").trim()}.toString()`;
      if (originalCode.includes("--send"))
        code = `interaction.channel.send(${code.replace("--send", "").trim()})`;
      if (originalCode.includes("--async"))
        code = `(async () => {${code.replace("--async", "").trim()}})()`;
      if (originalCode.includes("--depth="))
        depth = originalCode.split("--depth=")[1];
      code = code.split("--depth=")[0];
      code = code.replace("--silent", "").trim();
      code = await eval(code);
      code = inspect(code, {
        depth: depth,
      });
      if (String(code).length > 1990) code = "Output is too long";
      if (String(code).includes(config.token))
        code = "This message contained client's token.";
      if (originalCode.includes("--silent")) return;
      else
        interaction.reply({
          content: `\`\`\`js\n${code}\n\`\`\``,
        });
    } catch (error) {
      interaction.reply({
        content: `\`\`\`js\n${error}\n\`\`\``,
      });
    }
  },
};
