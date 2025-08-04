const { SlashCommandBuilder } = require('discord.js');
const db = require('../utils/mysql');

const prioChoices = [
    { name: '🟢 Low', value: '🟢 Low' },
    { name: '🟡 Medium', value: '🟡 Medium' },
    { name: '🔴 High', value: '🔴 High' },
];

const dummyMaps = [
    { name: 'Feuerwehr', value: 'Feuerwehr' },
    { name: 'Öl Felder', value: 'Öl Felder' },
    { name: 'Windkrafft', value: 'Windkrafft' },
    { name: 'Hafen', value: 'Hafen' },
    { name: 'Theater', value: 'Theater' },
    { name: 'Tittenberger', value: 'Tittenberger' },
    { name: 'Famwar', value: 'Famwar' },
    { name: 'Filmstudios', value: 'Filmstudios' },
    { name: 'Flugzeugfriedhof', value: 'Flugzeugfriedhof' },
    { name: 'E-Werke', value: 'E-Werke' },
    { name: 'Baustelle', value: 'Baustelle' },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('forty_config')
        .setDescription('Setzt Map und/oder Prio für Forty')
        .addStringOption(option =>
            option.setName('prio')
                .setDescription('Wähle die Priorität des Matches')
                .setRequired(false)
                .addChoices(...prioChoices)
        )
        .addStringOption(option =>
            option.setName('map')
                .setDescription('Name der Map (muss für 40er in DB existieren)')
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
                    "SELECT ID FROM maps WHERE MAP = ? AND event = '40' LIMIT 1",
                    [mapName]
                );

                if (mapRows.length === 0) {
                    return await interaction.reply({
                        content: `❌ Die Map \`${mapName}\` existiert nicht oder ist nicht für 40er eingetragen.`,
                        ephemeral: true,
                    });
                }

                mapID = mapRows[0].ID;
            }

            const [rows] = await db.execute("SELECT ID, Prio, MapID FROM events WHERE Event = '40' LIMIT 1");

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
                    "UPDATE events SET Prio = ?, MapID = ? WHERE Event = '40'",
                    [newPrio, newMapID]
                );
            } else {
                await db.execute(
                    "INSERT INTO events (Event, Prio, MapID) VALUES ('40', ?, ?)",
                    [prio ?? null, mapID ?? null]
                );
            }

            await interaction.reply({
                content: `✅ Daten für **40er** gespeichert:` +
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
