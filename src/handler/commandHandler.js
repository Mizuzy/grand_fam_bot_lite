const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
require('dotenv').config();

module.exports = (client) => {
  const commands = [];
  const commandFiles = fs.readdirSync(path.join(__dirname, '..', 'commands')).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
    } else {
      console.warn(`[WARN] Die Datei ${file} hat kein korrektes Command-Format.`);
    }
  }

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  (async () => {
    try {
      console.log('🔃 Registriere Slash Commands...');

      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands },
      );

      console.log('✅ Slash Commands registriert!');
    } catch (error) {
      console.error('❌ Fehler beim Registrieren der Commands:', error);
    }
  })();
};
