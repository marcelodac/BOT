const { 
  Client, 
  GatewayIntentBits, 
  Collection, 
  Partials 
} = require('discord.js');
const axios = require('axios');
const evento = require('./handler/Events');

console.clear();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.AutoModerationExecution,
  ],
  partials: [Partials.Message, Partials.Channel],
});

module.exports = client;

client.slashCommands = new Collection();

evento.run(client);
require('./handler/index')(client);

// Pega o token da variável de ambiente
const token = process.env.TOKEN;

(async () => {
  try {
    const data = {
      description: "Créditos: !zKingzs",
    };
    await axios.patch(
      "https://discord.com/api/v10/applications/@me",
      data,
      {
        headers: {
          Authorization: `Bot ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Descrição do bot atualizada com sucesso.');
  } catch (error) {
    console.error('Erro ao atualizar a descrição do bot:', error);
  }
})();

client.login(token)
  .then(() => console.log('Bot conectado com sucesso.'))
  .catch((err) => console.error('Erro ao conectar o bot:', err));
