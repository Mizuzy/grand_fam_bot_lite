require("dotenv").config();
const {
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ContainerBuilder,
    MessageFlags,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder
} = require('discord.js');
const db = require('../utils/mysql');
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

const ev_ank = process.env.EV_ANKUENDIGUNG;
const settingsPath = path.resolve(__dirname, '../settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));


async function CreateBizEmbed(guildName) {
    let prio = '🟡 Medium';
    let timeKey = new Date().getHours() === 18 ? "19:05" : new Date().getHours() === 0 ? "01:05" : "???";
    let timeKeyTwo = new Date().getHours() === 18 ? "18:50" : new Date().getHours() === 0 ? "00:50" : "???";

    const baseEmbed = new ContainerBuilder()
        .setAccentColor(5831679)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# Bizwar ${timeKey}`),
        )
        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`⚡️ **Prio**                 \`${prio}\``),
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("🔫 **Abgesägte**     ❌"),
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("-#  ⠀ ⠀ ⠀ ⠀ ⠀ ⠀ "),
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("📞 **Call**                https://discord.com/channels/1397954631883161630/" + process.env.WARTEHALLE_CALL),
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("-# ⠀ ⠀ ⠀ ⠀ ⠀ ⠀ "),
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`- **Information:**\n> Um ${timeKeyTwo} ausgerüstet an der Event-Zone`),
        )
        addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
        )   
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`-# ${guildName}︲Bot by Cavara︲` + "<@&" + process.env.EV_PING_ROLE + ">"),
        );

    return [baseEmbed];
}

module.exports = function startBizwarHandler(client) {
    cron.schedule("50 18 * * *", async () => {
        await handleBizwar(client);
    });
    cron.schedule("50 0 * * *", async () => {
        await handleBizwar(client);
    });

    async function handleBizwar(client) {
        const send = settings.send_events.send_bizwar;

        // Accept both string and number
        if (send = true) {
            try {
                const channel = await client.channels.fetch(ev_ank);
                if (channel && channel.isTextBased()) {
                    const components = await CreateBizEmbed(channel.guild.name);

                    const message = await channel.send({
                        components: components,
                        flags: MessageFlags.IsComponentsV2,
                    });

                    setTimeout(async () => {
                        try {
                            await message.delete();
                        } catch (deleteErr) {
                            console.error("❌ Fehler beim Löschen der Nachricht:", deleteErr);
                        }
                    }, 1200 * 1000);

                } else {
                    console.warn('⚠️ Channel ist nicht textbasiert oder nicht gefunden');
                }
            } catch (err) {
                console.error('❌ Fehler im Bizwar Cronjob:', err);
            }
        } else {
            console.log('Kein Eintrag gefunden oder send_bizwar ist nicht 1');
        }
    }

};

