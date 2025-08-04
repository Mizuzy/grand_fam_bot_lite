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
    let map = '/';
    let imgLink = null;
    let timeKey = new Date().getHours() === 18 ? "19:05" : new Date().getHours() === 0 ? "01:05" : "???";
    let timeKeyTwo = new Date().getHours() === 18 ? "18:50" : new Date().getHours() === 0 ? "00:50" : "???";

    try {
        const [rows] = await db.execute(
            "SELECT * FROM events WHERE Event = 'BIZWAR' LIMIT 1"
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
                "UPDATE events SET Prio = NULL, MapID = NULL WHERE ID = ?",
                [event.ID]
            );
        }

    } catch (err) {
        console.error('❌ Fehler beim DB-Zugriff:', err);
    }

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

module.exports = function startBizwarHandler(client) {
    cron.schedule("50 18 * * *", async () => {

        const [rows] = await db.execute(
            "SELECT `setconfig` FROM config WHERE config = 'send_bizwar'"
        );

        if (rows.length > 0 && rows[0].setconfig === '1') {



            try {
            const channel = await client.channels.fetch(ev_ank);
            if (channel && channel.isTextBased()) {
                const components = await CreateBizEmbed(channel.guild.name);

                const message = await channel.send({
                    components: components,
                    flags: MessageFlags.IsComponentsV2,
                });

                // Lösche die Nachricht nach 1 Minute
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
            console.log('Kein Eintrag gefunden');
        }

    });
};

module.exports = function startBizwarHandler(client) {
    cron.schedule("50 0 * * *", async () => {

        const [rows] = await db.execute(
            "SELECT `setconfig` FROM config WHERE config = 'send_bizwar'"
        );

        if (rows.length > 0 && rows[0].setconfig === 1) {

        try {
            const channel = await client.channels.fetch(ev_ank);
            if (channel && channel.isTextBased()) {
                const components = await CreateBizEmbed(channel.guild.name);

                const message = await channel.send({
                    components: components,
                    flags: MessageFlags.IsComponentsV2,
                });

                // Lösche die Nachricht nach 1 Minute
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
        console.log('Kein Eintrag gefunden');
        }

    });
};
