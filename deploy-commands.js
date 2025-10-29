const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data) commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.MTQyNTY2MDM3ODU1MzI1Mzg5OQ.GFUwlc.NOChWjttdertsio8k8UpHb-ySXcTrqaQrzG2fM);

(async () => {
  try {
    console.log('⏳ جاري تسجيل أوامر Slash Commands...');
    await rest.put(
      Routes.applicationCommands(process.env.1425660378553253899), // الـ Client ID للبوت
      { body: commands }
    );
    console.log('✅ تم تسجيل جميع أوامر Slash Commands!');
  } catch (error) {
    console.error(error);
  }
})();
