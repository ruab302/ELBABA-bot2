const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'unmute',
  description: 'إلغاء إسكات مستخدم.',
  async execute(message) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return message.reply('❌ لا تمتلك صلاحية إسكات الأعضاء.');

    const member = message.mentions.members.first();
    if (!member) return message.reply('⚠️ الاستخدام الصحيح: `!unmute @user`');

    try {
      await member.timeout(null);
      const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle('🔈 تم إلغاء الإسكات')
        .setDescription(`> المستخدم: ${member}`)
        .setFooter({ text: 'All in One • إدارة', iconURL: message.client.user.displayAvatarURL() });
      message.reply({ embeds: [embed] });
    } catch {
      message.reply('❌ فشل في إلغاء الإسكات.');
    }
  },
};
