const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'ban',
  description: 'يحظر عضو من السيرفر',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply('❌ ماعندكش صلاحية البان.');
    }

    const member = message.mentions.members.first();
    if (!member) return message.reply('⚠️ منشن الشخص اللي عايز تعمله بان.');

    if (!member.bannable) return message.reply('❌ مش قادر أعمل بان للشخص ده.');

    const reason = args.slice(1).join(' ') || 'بدون سبب';
    await member.ban({ reason });

    const embed = new EmbedBuilder()
      .setTitle('🔨 تم حظر عضو')
      .addFields(
        { name: '👤 العضو', value: `${member.user.tag}`, inline: true },
        { name: '🧑‍⚖️ بواسطة', value: `${message.author.tag}`, inline: true },
        { name: '📄 السبب', value: reason }
      )
      .setColor('#9b59b6');

    message.reply({ embeds: [embed] });
  }
};
