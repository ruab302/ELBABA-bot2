const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'clear',
  description: 'مسح عدد معين من الرسائل.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
      return message.reply('❌ لا تمتلك صلاحية مسح الرسائل.');

    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 100)
      return message.reply('⚠️ اكتب رقم بين 1 و 100.');

    await message.channel.bulkDelete(amount, true);
    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle('🧹 تم مسح الرسائل')
      .setDescription(`> تم مسح **${amount}** رسالة.`)
      .setFooter({ text: 'All in One • إدارة', iconURL: message.client.user.displayAvatarURL() });

    message.channel.send({ embeds: [embed] }).then(msg => setTimeout(() => msg.delete(), 5000));
  },
};
