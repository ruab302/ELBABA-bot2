const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "send",
  description: "يبعت رسالة خاصة لشخص محدد.",
  async execute(message, args, client) {
    // التأكد إن الشخص عنده صلاحية (اختياري)
    if (!message.member.permissions.has("ADMINISTRATOR")) {
      return message.reply("❌ ما عندكش صلاحية تستخدم الأمر ده.");
    }

    const user = message.mentions.users.first();
    if (!user) return message.reply("❌ منشن الشخص اللي عايز تبعته له.");

    const msg = args.slice(1).join(" ");
    if (!msg) return message.reply("❌ اكتب الرسالة اللي عايز تبعتها.");

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `Message from ${message.guild.name}`,
        iconURL: message.guild.iconURL({ dynamic: true }),
      })
      .setDescription(msg)
      .setColor(0x2f3136)
      .setFooter({
        text: `Sent by ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    try {
      await user.send({ embeds: [embed] });
      message.reply(`✅ تم إرسال الرسالة إلى ${user.tag} بنجاح.`);
    } catch (err) {
      console.error(err);
      message.reply("⚠️ ما قدرتش أبعت له، يمكن قافل الخاص.");
    }
  },
};
