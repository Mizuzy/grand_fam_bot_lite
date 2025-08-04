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


async function CreateEmbed(guildName) {
    let prio = '🟡 Medium';
    let map = '/';
    let imgLink = null;
    let timeKey = new Date().getHours();

    try {
        const [rows] = await db.execute(
            "SELECT * FROM events WHERE Event = '40' LIMIT 1"
        );

        if (rows.length > 0) {
            const event = rows[0];
            prio = event.Prio || prio;

            if (event.MapID) {
                const [mapRows] = await db.execute(
                    "SELECT MAP, IMG FROM maps WHERE ID = ? LIMIT 1",
                    [event.MapID]
                );

                if (mapRows.length > 0) {
                    map = mapRows[0].MAP;
                    imgLink = mapRows[0].IMG;
                }
            }

            // Reset nach Erstellung
            await db.execute(
                "UPDATE events SET Prio = '🟡 Medium', MapID = NULL WHERE ID = ?",
                [event.ID]
            );

        }

    } catch (err) {
        console.error('❌ Fehler beim DB-Zugriff:', err);
    }

    const baseEmbed = new ContainerBuilder()
        .setAccentColor(5831679)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# 40er ${timeKey}:40`),
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
            new TextDisplayBuilder().setContent("📞 **Call**                https://discord.com/channels/1397954631883161630/" + process.env.vierzigerEVENT_CALL),
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("-# ⠀ ⠀ ⠀ ⠀ ⠀ ⠀ "),
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`- **Information:**\n> Um ${timeKey}:30 ausgerüstet an der Event-Zone`),
        )



    if (map !== '/' && imgLink) {
        baseEmbed
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`🖼️ **Map**               \`${map}\``),
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
            )
            .addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems(
                    new MediaGalleryItemBuilder().setURL(imgLink)
                )
            );
    }

    baseEmbed.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
    ).addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`-# ${guildName}︲Bot by Cavara︲` + "<@&" + process.env.EV_PING_ROLE + ">"),
    );

    return [baseEmbed];
}

module.exports = function startfortyHandler(client) {
    cron.schedule("30 * * * *", async () => {

                const send = settings.send_events.send_forty;
        
                // Accept both string and number
                if (send = true) {
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
