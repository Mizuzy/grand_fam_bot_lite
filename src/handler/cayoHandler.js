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
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

const ev_ank = process.env.EV_ANKUENDIGUNG;
const settingsPath = path.resolve(__dirname, '../settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));


async function CreateEmbed(guildName) {
    let prio = '🟡 Medium';
    let map = '/';
    let imgLink = null;
    let timeKey = new Date().getHours();



    const baseEmbed = new ContainerBuilder()
        .setAccentColor(5831679)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# Cayo Event  ${timeKey}:35`),
        )
        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`⚡️ **Prio**                 \`${prio}\``),
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("🔫 **Abgesägte**     ✅"),
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("-#  ⠀ ⠀ ⠀ ⠀ ⠀ ⠀ "),
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("📞 **Call**                https://discord.com/channels/1397954631883161630/" + process.env.fuenfundzwanzigerEVENT_VOICE),
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("-# ⠀ ⠀ ⠀ ⠀ ⠀ ⠀ "),
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`- **Information:**\n> Um ${timeKey}:35 kann übers Handy beigetreten werden`),
        )
        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
        ).addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`-# ${guildName}︲Bot by Cavara︲` + "<@&" + process.env.OP_EV_PING_ROLE + ">"),
        );

    return [baseEmbed];
}

module.exports = function startCayoHandler(client) {
    cron.schedule("25 17 * * *", async () => {

const send = settings.send_events.send_cayo;

        // Accept both string and number
        if (send === true) {
            try {
                const channel = await client.channels.fetch(ev_ank);
                if (channel && channel.isTextBased()) {
                    const components = await CreateEmbed(channel.guild.name);

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
    });
};
