module.exports = {
  name: "ready",
  run: async (client) => {
    console.clear();
    console.log(`[Bot] ${client.user.tag} foi iniciado com sucesso!`);
  },
};
