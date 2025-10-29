const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'userinfo',
  description: 'يعرض معلومات عن المستخدم',
  execute(message) {
    const user = message.mentions.users.first() || message.author;

    const embed = new EmbedBuilder()
      .setTitle(`👤 معلومات ${user.username}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '🆔 ID', value: user.id, inline: true },
        { name: '📅 انضم إلى ديسكورد في', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`, inline: true }
      )
      .setColor('#9b59b6');

    message.reply({ embeds: [embed] });
  }
};
