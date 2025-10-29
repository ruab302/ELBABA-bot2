module.exports = {
  name: 'setname',
  description: 'يغير اسم البوت داخل السيرفر فقط.',
  async execute(message, args) {
    if (!message.member.permissions.has('MANAGE_NICKNAMES')) {
      return message.reply('❌ ما عندكش صلاحية إدارة الأسماء.');
    }

    const newName = args.join(' ');
    if (!newName) return message.reply('❌ اكتب الاسم الجديد.');

    try {
      await message.guild.members.me.setNickname(newName);
      message.reply(`✅ تم تغيير اسم البوت داخل السيرفر إلى: **${newName}**`);
    } catch (error) {
      console.error(error);
      message.reply('⚠️ حصل خطأ أثناء تغيير الاسم.');
    }
  }
};
