const fs = require('fs');
const configPath = './config.json';

module.exports = {
  name: 'setprefix',
  description: "Change the bot's prefix",
  async execute(message, args, client) { // اضفنا client هنا
    if (!args[0]) return message.reply('❌ ضع البريفكس الجديد.');
    try {
      const newPrefix = args[0];

      // تحديث البريفكس في الذاكرة
      client.prefix = newPrefix;

      // تحديث البريفكس في الكونفج
      const config = fs.existsSync(configPath)
        ? JSON.parse(fs.readFileSync(configPath, 'utf8'))
        : {};
      config.prefix = newPrefix;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      message.reply(`✅ تم تغيير البريفكس إلى: \`${newPrefix}\``);
    } catch (err) {
      console.error(err);
      message.reply('⚠️ حدث خطأ أثناء تغيير البريفكس.');
    }
  }
};
