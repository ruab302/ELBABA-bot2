const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'addrole',
  description: 'إعطاء رول لمستخدم معين.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles))
      return message.reply('❌ لا تمتلك صلاحية إدارة الرتب.');

    const member = message.mentions.members.first();
    const role = message.mentions.roles.first();

    if (!member || !role)
      return message.reply('⚠️ الاستخدام الصحيح: `!addrole @user @role`');

    try {
      await member.roles.add(role);
      const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle('✅ تم إعطاء الرتبة بنجاح')
        .setDescription(`> المستخدم: ${member}\n> الرتبة: ${role}`)
        .setFooter({ text: 'All in One • إدارة', iconURL: message.client.user.displayAvatarURL() });
      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply('❌ حدث خطأ أثناء محاولة إعطاء الرتبة.');
    }
  },
};
