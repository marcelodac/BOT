const { ApplicationCommandType } = require("discord.js");
const config = require("../../config.json");

module.exports = {
    name: `nuke`,
    description: `[🤖] Recriar um canal.`,
    type: ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        if (interaction.user.id !== config.owner) {
            return interaction.reply({
                content: `<:no:1409545199461597337> Você não tem permissão para usar este comando.`,
                ephemeral: true
            });
        }

        const newChannel = await interaction.channel.clone();

        await interaction.channel.delete();

        newChannel.send({
            content: `Nuked by \`${interaction.user.username}\``
        });
    }
};
