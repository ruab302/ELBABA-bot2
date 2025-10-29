const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'serverinfo',
  description: 'معلومات عن السيرفر',
  execute(message) {
    const { guild } = message;

    const embed = new EmbedBuilder()
      .setTitle(`📊 معلومات السيرفر: ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: '👑 المالك', value: `<@${guild.ownerId}>`, inline: true },
        { name: '👥 الأعضاء', value: `${guild.memberCount}`, inline: true },
        { name: '📅 أُنشئ في', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true }
      )
      .setColor('#9b59b6');

    message.reply({ embeds: [embed] });
  }
};