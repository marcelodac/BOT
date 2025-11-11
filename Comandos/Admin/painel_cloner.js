const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { owner } = require("../../config.json");

module.exports = {
  name: "painel_cloner",
  description: "[🤖] Envie o painel de clonagem.",
  type: ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    if (interaction.user.id !== owner) {
      return interaction.reply({
        content: "<:no:1409545199461597337> Você não tem permissão para usar este comando.",
        ephemeral: true,
      });
    }

    try {
      await interaction.reply({
        content: "<:yes:1422213840136966254> Painel enviado com sucesso!",
        ephemeral: true,
      });

      const botImage = "https://i.ibb.co/DHT4w6QD/cloner-resized.png";

      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("🤖 BOT CLONE • ECLIPSE 🔥")
        .setDescription(`
> Olá, membro! Utilize os botões abaixo para acessar o **Painel de Clonagem**.

## 🧠 Instruções
• É necessário o **ID do servidor** que será clonado e o **ID do servidor de destino**.  
• A conta precisa estar presente em **ambos os servidores**.  
• O **token da conta** será exigido!
        `)
        .setImage(botImage)
        .setFooter({ text: "🔥 ECLIPSE 🔥" });

      const botoes = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("panel_cloner")
          .setLabel("Clonar Servidor")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("🔥"),

        new ButtonBuilder()
          .setCustomId("clonersite")
          .setLabel("Clonar Site")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("🌐"),

        new ButtonBuilder()
          .setLabel("YouTube")
          .setStyle(ButtonStyle.Link)
          .setURL("https://www.youtube.com/@hypecommunity") // substitua pelo seu link
          .setEmoji("🎥"),

        new ButtonBuilder()
          .setLabel("Ajuda?")
          .setStyle(ButtonStyle.Link)
          .setURL("https://discord.com/channels/1419103210559504494/1419810403969662997")
          .setEmoji("❓")
      );

      await interaction.channel.send({
        embeds: [embed],
        components: [botoes],
      });

      await interaction.channel.send({
        content: "> ⚠️ Quem for o **engraçadinho** de usar o cloner para copiar o nosso servidor... vai rodar!",
      });

    } catch (error) {
      console.error("Erro ao enviar painel:", error);
      if (!interaction.replied) {
        await interaction.reply({
          content: "<:no:1409545199461597337> Ocorreu um erro ao tentar enviar o painel.",
          ephemeral: true,
        });
      }
    }
  },
};
