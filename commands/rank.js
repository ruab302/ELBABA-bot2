const { EmbedBuilder } = require('discord.js');

const xpData = new Map(); // هنا بنخزن نقاط المستخدمين مؤقتًا

module.exports = {
  name: 'rank',
  description: 'يعرض مستواك الحالي وعدد نقاطك',
  execute(message) {
    const userId = message.author.id;
    const userXP = xpData.get(userId) || { xp: 0, level: 1 };

    const embed = new EmbedBuilder()
      .setTitle(`🏆 المستوى - ${message.author.username}`)
      .setDescription(`المستوى الحالي: **${userXP.level}**\nالخبرة (XP): **${userXP.xp}**`)
      .setColor('#9b59b6')
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));

    message.reply({ embeds: [embed] });
  }
};
