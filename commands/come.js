const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'come',
  description: 'ينادي على شخص برسالة خاصة 💌',
  async execute(message, args) {
    const target = message.mentions.members.first();
    if (!target) return message.reply('⚠️ استخدم: `!come @user`');

    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle('📩 عندك رسالة جديدة!')
      .setDescription(`> ${message.author} بينادي عليك 😏✨`)
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: 'All in One • تفاعل', iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();

    try {
      await target.send({ embeds: [embed] });
      await message.react('✅'); // يضيف ريآكشن نجاح
    } catch (err) {
      message.reply('❌ مقدرتش أبعتله، يمكن قافل الرسائل الخاصة.');
    }
  },
};
