const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'mute',
  description: 'إسكات مستخدم.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return message.reply('❌ لا تمتلك صلاحية إسكات الأعضاء.');

    const member = message.mentions.members.first();
    if (!member) return message.reply('⚠️ الاستخدام الصحيح: `!mute @user [المدة بالدقائق]`');

    const duration = parseInt(args[1]) || 10; // الديفولت 10 دقايق
    const reason = args.slice(2).join(' ') || 'بدون سبب';

    try {
      await member.timeout(duration * 60 * 1000, reason);
      const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle('🔇 تم إسكات المستخدم')
        .setDescription(`> المستخدم: ${member}\n> المدة: ${duration} دقيقة\n> السبب: ${reason}`)
        .setFooter({ text: 'All in One • إدارة', iconURL: message.client.user.displayAvatarURL() });
      message.reply({ embeds: [embed] });
    } catch {
      message.reply('❌ فشل في إسكات العضو.');
    }
  },
};
