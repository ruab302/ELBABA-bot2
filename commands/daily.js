const { EmbedBuilder } = require('discord.js');

const cooldowns = new Map();

module.exports = {
  name: 'daily',
  description: 'احصل على مكافأتك اليومية',
  execute(message) {
    const userId = message.author.id;
    const now = Date.now();
    const lastClaim = cooldowns.get(userId);

    if (lastClaim && now - lastClaim < 86400000) {
      const remaining = Math.ceil((86400000 - (now - lastClaim)) / (1000 * 60 * 60));
      return message.reply(`⏳ استنى ${remaining} ساعة قبل ما تاخد المكافأة اليومية تاني.`);
    }

    cooldowns.set(userId, now);
    const amount = Math.floor(Math.random() * 500) + 100;

    const embed = new EmbedBuilder()
      .setTitle('🎁 مكافأة يومية')
      .setDescription(`مبروك يا ${message.author}! خدت **${amount}** كوينز 💰`)
      .setColor('#9b59b6');

    message.reply({ embeds: [embed] });
  }
};
