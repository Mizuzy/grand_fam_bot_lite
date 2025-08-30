const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configs = [
    { name: 'send_forty', value: 'send_forty' },
    { name: 'send_bizwar', value: 'send_bizwar' },
    { name: 'send_RPTicket', value: 'send_RPTicket' },
    { name: 'send_waffenfabrik', value: 'send_waffenfabrik' },
    { name: 'send_giesserei', value: 'send_giesserei' },
    { name: 'send_cayo', value: 'send_cayo' },
    { name: 'send_ekz', value: 'send_ekz' },
    { name: 'send_hotel', value: 'send_hotel' },
    { name: 'send_weinberge', value: 'send_weinberge' },
];

const values = [
    { name: 'true', value: 'true' },
    { name: 'false', value: 'false' },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Setzt Map und/oder Prio für Forty')
        .addStringOption(option =>
            option.setName('config')
                .setDescription('Wähle die Config')
                .setRequired(true)
                .addChoices(...configs)
        )
        .addStringOption(option =>
            option.setName('wert')
                .setDescription('Wähle den Wert')
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
                // Convert value to boolean
                const boolValue = selectedValue === 'true';

                // Read settings.json
                const settingsPath = path.join(__dirname, '..//settings.json');
                const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

                // Update send_events value
                if (!settings.send_events) settings.send_events = {};
                settings.send_events[selectedConfig] = boolValue;

                // Write back to settings.json
                fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
            }

            await interaction.reply({
                content:
                    `✅ Daten für **40er** gespeichert:` +
                    (selectedConfig ? `\n🗺️ Config: \`${selectedConfig}\`` : '') +
                    (selectedValue ? `\n⚠️ Wert: \`${selectedValue}\`` : ''),
                ephemeral: true,
            });

        } catch (err) {
            console.error('❌ Fehler beim Zugriff auf settings.json:', err);
            await interaction.reply({
                content: '❌ Interner Fehler beim Speichern der Daten.',
                ephemeral: true,
            });
        }
    },
};
