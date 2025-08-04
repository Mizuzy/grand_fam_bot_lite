require("dotenv").config();
const {
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ContainerBuilder,
    MessageFlags
} = require('discord.js');
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const express = require('express');
const app = express();
app.use(express.json());

// Serve static files from the src folder
app.use(express.static(path.join(__dirname, '..')));

const ev_ank = process.env.EV_ANKUENDIGUNG;
const settingsPath = path.resolve(__dirname, '../settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

async function CreateAnkuendigungEmbed(guildName, text) {
    let timeKey = new Date().getHours();

    const baseEmbed = new ContainerBuilder()
        .setAccentColor(5831679)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# Ankündigung für ${guildName}`),
        )
        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(text),
        )
        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`-# ${guildName}︲Bot by Cavara︲` + "<@&" + process.env.MITGLIEDER_PING_ROLE + ">"),
        );

    return [baseEmbed];
}

module.exports = async function startAnkuendigungsHandler(client) {
    app.post('/api/announcement', async (req, res) => {
        const { text } = req.body;
        const channel = await client.channels.fetch(ev_ank);
        if (channel && channel.isTextBased()) {
            const components = await CreateAnkuendigungEmbed(channel.guild.name, text);

            const message = await channel.send({
                components: components,
                flags: MessageFlags.IsComponentsV2,
            });

            console.log(`📢 Announcement sent to ${channel.name} in guild ${channel.guild.name}`);

            res.status(200).send('Announcement sent!');
        } else {
            console.warn('⚠️ Channel ist nicht textbasiert oder nicht gefunden');
            res.status(500).send('Channel not found');
        }
    });

    app.listen(3000, () => console.log('Webserver running on port 3000'));
};