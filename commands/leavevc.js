// commands/leavevc.js
const { ChannelType } = require('discord.js');

module.exports = {
  name: 'leavevc',
  description: 'يخلي البوت يخرج من الروم الصوتي',
  async execute(message, args, client) {
    try {
      // نجيب السيرفر (guild)
      const guild = message.guild;
      if (!guild) return message.reply('❌ لا يمكن العثور على السيرفر.');

      // نجيب الروم الصوتي اللي البوت فيه
      const connection = client.voice?.adapters?.get(guild.id);
      const voiceChannel = guild.members.me?.voice?.channel;

      if (!voiceChannel) {
        return message.reply('❌ البوت مش موجود في أي روم صوتي.');
      }

      await voiceChannel.leave();
      return message.reply('👋 تم خروج البوت من الروم الصوتي بنجاح.');
    } catch (err) {
      console.error('❌ خطأ في leavevc:', err);
      message.reply('⚠️ حصل خطأ أثناء محاولة مغادرة الروم الصوتي.');
    }
  }
};
