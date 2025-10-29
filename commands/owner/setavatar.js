const { AttachmentBuilder } = require('discord.js');
module.exports = {
  name: 'setavatar',
  description: "Change the bot's avatar",
  async execute(message, args, client) {
    if (!args[0]) return message.reply('❌ ضع رابط الصورة.');
    try {
      await client.user.setAvatar(args[0]);
      message.reply('✅ تم تغيير صورة البوت بنجاح!');
    } catch (err) {
      console.error(err);
      message.reply('⚠️ حدث خطأ أثناء تغيير صورة البوت.');
    }
  }
};
