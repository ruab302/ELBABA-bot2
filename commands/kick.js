const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'kick',
  description: 'طرد عضو من السيرفر',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return message.reply('❌ ماعندكش صلاحية لطرد الأعضاء.');
    }

    const member = message.mentions.members.first();
    if (!member) return message.reply('⚠️ منشن الشخص اللي عايز تطرده.');

    if (!member.kickable) return message.reply('❌ مش قادر أطرد الشخص ده.');

    const reason = args.slice(1).join(' ') || 'بدون سبب';
    await member.kick(reason);

    const embed = new EmbedBuilder()
      .setTitle('👢 تم طرد عضو')
      .addFields(
        { name: '👤 العضو', value: `${member.user.tag}`, inline: true },
        { name: '🧑‍⚖️ بواسطة', value: `${message.author.tag}`, inline: true },
        { name: '📄 السبب', value: reason }
      )
      .setColor('#9b59b6');

    message.reply({ embeds: [embed] });
  }
};
