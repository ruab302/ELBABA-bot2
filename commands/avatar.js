const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'avatar',
  description: 'يعرض صورة المستخدم',
  execute(message) {
    const user = message.mentions.users.first() || message.author;
    const embed = new EmbedBuilder()
      .setTitle(`🖼️ صورة ${user.username}`)
      .setImage(user.displayAvatarURL({ size: 1024, dynamic: true }))
      .setColor('#9b59b6');

    message.reply({ embeds: [embed] });
  }
};
