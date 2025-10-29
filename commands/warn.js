const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'warn',
  description: 'تحذير عضو معين',
  execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('❌ ماعندكش صلاحية التحذير.');
    }

    const member = message.mentions.members.first();
    if (!member) return message.reply('⚠️ منشن الشخص اللي عايز تحذره.');

    const reason = args.slice(1).join(' ') || 'بدون سبب';

    const embed = new EmbedBuilder()
      .setTitle('⚠️ تم تحذير عضو')
      .addFields(
        { name: '👤 العضو', value: `${member.user.tag}`, inline: true },
        { name: '🧑‍⚖️ بواسطة', value: `${message.author.tag}`, inline: true },
        { name: '📄 السبب', value: reason }
      )
      .setColor('#9b59b6');

    message.reply({ embeds: [embed] });
  }
};
