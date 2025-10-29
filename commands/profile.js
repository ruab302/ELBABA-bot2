const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'profile',
  description: 'يعرض بروفايل المستخدم',
  execute(message) {
    const user = message.mentions.users.first() || message.author;

    const embed = new EmbedBuilder()
      .setTitle(`💜 بروفايل ${user.username}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '🆔 ID', value: user.id },
        { name: '🎮 التاج', value: user.tag },
        { name: '📅 انضم لديسكورد في', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>` }
      )
      .setColor('#9b59b6');

    message.reply({ embeds: [embed] });
  }
};
