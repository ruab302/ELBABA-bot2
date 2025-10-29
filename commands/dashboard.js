const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'dashboard',
  description: 'عرض لوحة تحكم السكرمز',
  async execute(message) {
    try {
      // 🎨 الإيمبد الرئيسي
      const embed = new EmbedBuilder()
        .setColor('#3b2f2f') // لون بني غامق
        .setTitle('🧭 Scrim Management Panel')
        .setDescription(
          'Use the buttons below to manage the current scrim session.\n\n' +
          '━━━━━━━━━━━━━━━━━━\n' +
          '### ⚙️ **Scrim Actions**\n' +
          '> Manage registrations and scrim settings.\n\n' +
          '━━━━━━━━━━━━━━━━━━\n' +
          '### 💠 **Spare Management**\n' +
          '> Open or close spare registrations.\n\n' +
          '━━━━━━━━━━━━━━━━━━\n' +
          '### 🧰 **Extra Actions**\n' +
          '> Edit or remove registration lists.\n' +
          '━━━━━━━━━━━━━━━━━━'
        )
        .setFooter({ text: '𝐄𝐋¹ ᴢ ᴇ ᴛ丨𝐄𝗦𝗣𝗢𝗥𝗧𝗦 Dashboard' })
        .setTimestamp();

      // ⚙️ صف أزرار Scrim Actions
      const scrimActions = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('dash_open_reg')
          .setLabel('🟢 Open Registration')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('dash_close_reg')
          .setLabel('🔒 Close Registration')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('dash_end_scrim')
          .setLabel('🔥 End Scrim')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('dash_edit_scrim')
          .setLabel('🪄 Edit Scrim')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('dash_delete_scrim')
          .setLabel('🗑️ Delete Scrim')
          .setStyle(ButtonStyle.Danger)
      );

      // 💠 صف Spare Management
      const spareManagement = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('dash_open_spare')
          .setLabel('🟢 Open Spare Registration')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('dash_close_spare')
          .setLabel('⚫ Close Spare Registration')
          .setStyle(ButtonStyle.Secondary)
      );

      // 🧰 صف Extra Actions
      const extraActions = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('dash_new_scrim')
          .setLabel('🆕 New Scrim')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('dash_start_scrim')
          .setLabel('🚀 Start Scrim')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('dash_list_scrims')
          .setLabel('📜 List of Scrims')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('dash_edit_list')
          .setLabel('🪄 Edit List')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('dash_remove_registration')
          .setLabel('🗑️ Remove Registration')
          .setStyle(ButtonStyle.Danger)
      );

     //  💎 إرسال الرسالة بإطار ملوّن يوهم أن الأزرار جوه الإيمبد
      await message.reply({

        embeds: [embed],
        components: [scrimActions, spareManagement, extraActions],
        allowedMentions: { repliedUser: false },
      });

    } catch (err) {
      console.error('❌ Dashboard Error:', err);
      message.reply('⚠️ حصل خطأ أثناء إنشاء لوحة التحكم.');
    }
  },
};
