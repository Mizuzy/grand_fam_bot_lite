const { SlashCommandBuilder } = require('discord.js');
const db = require('../utils/mysql');

const prioChoices = [
    { name: '🟢 Low', value: '🟢 Low' },
    { name: '🟡 Medium', value: '🟡 Medium' },
    { name: '🔴 High', value: '🔴 High' },
];

const dummyMaps = [
    { name: 'Hafen', value: 'Hafen' },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bizconfig')
        .setDescription('Setzt Map und/oder Prio für BIZWAR')
        .addStringOption(option =>
            option.setName('prio')
                .setDescription('Wähle die Priorität des Matches')
                .setRequired(false)
                .addChoices(...prioChoices)
        )
        .addStringOption(option =>
            option.setName('map')
                .setDescription('Name der Map (muss für Bizwar in DB existieren)')
                .setRequired(false)
                .addChoices(...dummyMaps)
        ),

    async execute(interaction) {
        const prio = interaction.options.getString('prio');
        const mapName = interaction.options.getString('map');
        let mapID = null;

        try {
            if (!prio && !mapName) {
                return await interaction.reply({
                    content: '⚠️ Bitte gib mindestens eine Option (`map` oder `prio`) an.',
                    ephemeral: true,
                });
            }

            if (mapName) {
                const [mapRows] = await db.execute(
                    "SELECT ID FROM maps WHERE MAP = ? AND event = 'bizwar' LIMIT 1",
                    [mapName]
                );

                if (mapRows.length === 0) {
                    return await interaction.reply({
                        content: `❌ Die Map \`${mapName}\` existiert nicht oder ist nicht für Bizwar eingetragen.`,
                        ephemeral: true,
                    });
                }

                mapID = mapRows[0].ID;
            }

            const [rows] = await db.execute("SELECT ID, Prio, MapID FROM events WHERE Event = 'BIZWAR' LIMIT 1");

            if (rows.length > 0) {
                const current = rows[0];

                const newPrio = prio ?? current.Prio;
                const newMapID = mapID ?? current.MapID;

                if (current.Prio === newPrio && current.MapID == newMapID) {
                    return await interaction.reply({
                        content: `ℹ️ Die eingegebenen Daten sind bereits gespeichert:\n🗺️ MapID: \`${newMapID}\`\n⚠️ Prio: \`${newPrio}\``,
                        ephemeral: true,
                    });
                }

                await db.execute(
                    "UPDATE events SET Prio = ?, MapID = ? WHERE Event = 'BIZWAR'",
                    [newPrio, newMapID]
                );
            } else {
                await db.execute(
                    "INSERT INTO events (Event, Prio, MapID) VALUES ('BIZWAR', ?, ?)",
                    [prio ?? null, mapID ?? null]
                );
            }

            await interaction.reply({
                content: `✅ Daten für **BIZWAR** gespeichert:` +
                    (mapID !== null ? `\n🗺️ MapID: \`${mapID}\`` : '') +
                    (prio ? `\n⚠️ Prio: \`${prio}\`` : ''),
                ephemeral: true,
            });

        } catch (err) {
            console.error('❌ Fehler beim Zugriff auf die Datenbank:', err);
            await interaction.reply({
                content: '❌ Interner Fehler beim Speichern der Daten.',
                ephemeral: true,
            });
        }
    },
};
