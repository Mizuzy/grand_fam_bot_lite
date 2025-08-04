const { SlashCommandBuilder } = require('discord.js');
const db = require('../utils/mysql');

const configs = [
    { name: 'send_forty', value: 'send_forty' },
    { name: 'send_bizwar', value: 'send_bizwar' },
    { name: 'send_RPTicket', value: 'send_RPTicket' },
    { name: 'send_waffenfabrik', value: 'send_waffenfabrik' },
    { name: 'send_giesserei', value: 'send_giesserei' },
    { name: 'send_cayo', value: 'send_cayo' },
    { name: 'send_ekz', value: 'send_ekz' },
    { name: 'send_hotel', value: 'send_hotel' },
    { name: 'E-send_weinberge', value: 'E-send_weinberge' },];

const values = [
    { name: '0', value: '0' },
    { name: '1', value: '1' },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Setzt Map und/oder Prio für Forty')
        .addStringOption(option =>
            option.setName('config')
                .setDescription('Wähle die Config (z.B. Map)')
                .setRequired(true)
                .addChoices(...configs)
        )
        .addStringOption(option =>
            option.setName('wert')
                .setDescription('Wähle die Priorität (Low/Medium/High)')
                .setRequired(true)
                .addChoices(...values)
        ),

    async execute(interaction) {
        const selectedConfig = interaction.options.getString('config');
        const selectedValue = interaction.options.getString('wert');

        if (!selectedConfig && !selectedValue) {
            return await interaction.reply({
                content: '⚠️ Bitte wähle mindestens eine Option (`config` oder `wert`).',
                ephemeral: true,
            });
        }

        try {
            if (selectedConfig && selectedValue) {
                const selectedValue = interaction.options.getString('wert');
                const intValue = parseInt(selectedValue, 10); // String zu Integer konvertieren

                await db.execute(
                    "UPDATE config SET setconfig = ? WHERE config = ?",
                    [intValue, selectedConfig]
                );

            }

            await interaction.reply({
                content:
                    `✅ Daten für **40er** gespeichert:` +
                    (selectedConfig ? `\n🗺️ Config: \`${selectedConfig}\`` : '') +
                    (selectedValue ? `\n⚠️ Wert: \`${selectedValue}\`` : ''),
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
