// commands/scrim-start.js
const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'scrim-start',
  description: 'Start a scrim and DM accepted teams',

  async execute(messageOrInteraction, args, client, scrims = {}) {
    try {
      // تمييز إذا النداء جاي من تفاعل (Modal/Interaction) أو رسالة
      const isInteraction = !!(messageOrInteraction && (typeof messageOrInteraction.isModalSubmit === 'function' || messageOrInteraction.user));
      const safeReply = async (content) => {
        if (isInteraction) {
          // لو مديتها defer من قبل فاستعمل editReply وإلا reply
          if (!messageOrInteraction.deferred && !messageOrInteraction.replied) {
            await messageOrInteraction.reply({ content, flags: 64 }).catch(() => {});
          } else {
            await messageOrInteraction.editReply({ content }).catch(() => {});
          }
        } else {
          await messageOrInteraction.channel.send(content).catch(() => {});
        }
      };

      // --- نطوّع args لأن شكلها يختلف لو جاي من message أو من interaction/modal
      // أمثلة:
      // من message: args === ['start', '00:00', 'Erangel', '12345678', 'ss', '00:00'] (بعد ما فصلت commandName)
      // من modal/interaction (حسب كيفية بناءك للـ args): args === ['scrim','start','00:00', ...]
      let payload = Array.isArray(args) ? args.slice() : [];

      if (payload[0] === 'scrim' && payload[1] === 'start') {
        payload = payload.slice(2);
      } else if (payload[0] === 'start') {
        payload = payload.slice(1);
      }
      // الآن payload يجب أن يكون: [scrimTime, mapName, roomId, password, startTime, ...optional]

      if (payload.length < 5) {
        return safeReply('❌ الصيغة غلط.\nاستخدم: `.scrim start <scrimTime> <mapName> <roomId> <password> <startTime>`');
      }

      const [scrimTime, mapNameRaw, roomId, password, startTime] = payload;
      const mapName = String(mapNameRaw || '').trim();
      const scrimId = String(scrimTime || '').replace(/:/g, '-');

      // اقرأ ملف السكرمز من القرص (مصدر الحقيقة)
      const scrimsPath = path.join(__dirname, '..', 'scrims.json');
      if (!fs.existsSync(scrimsPath)) return safeReply('❌ ملف السكرمز مش موجود.');

      const data = JSON.parse(fs.readFileSync(scrimsPath, 'utf8'));
      const scrim = data[scrimId] || scrims[scrimId];
      if (!scrim) return safeReply(`❌ السكرم ${scrimId} مش موجود.`);

      // حدّث الحالة و احفظ
      scrim.status = 'started';
      data[scrimId] = scrim;
      fs.writeFileSync(scrimsPath, JSON.stringify(data, null, 2));

      const acceptedTeams = Array.isArray(scrim.members) ? scrim.members : [];
      if (acceptedTeams.length === 0) return safeReply('❌ مفيش فرق مقبولة لهذا السكرم.');

      // صور الخرائط
      const mapImages = {
        erangel: 'https://media.discordapp.net/attachments/1416129837160075274/1430849995451662398/erangel.jpg',
        miramar: 'https://media.discordapp.net/attachments/1416129837160075274/1430851702327869482/miramar.jpg',
        sanhok:  'https://media.discordapp.net/attachments/1416129837160075274/1430851701962834011/sanhok.png'
      };
      const mapImage = mapImages[mapName.toLowerCase()] || mapImages.erangel;

      const guild = isInteraction ? messageOrInteraction.guild : messageOrInteraction.guild;
      const serverIcon = guild?.iconURL ? guild.iconURL({ dynamic: true, size: 64 }) : null;
      const serverName = "𝐄𝐋¹ ᴢ ᴇ ᴛ丨𝐄𝗦𝗣𝗢𝗥𝗧𝗦";

      // صمّم الإيمبد
      const embed = new EmbedBuilder()
        .setAuthor({ name: serverName, iconURL: serverIcon })
        .setTitle(`Scrim Time ⤳ ${scrimTime}`)
        .setColor('#6614B8')
        .addFields(
          { name: 'MAP', value: `\`\`\`${mapName}\`\`\``, inline: true },
          { name: 'ID',  value: `\`\`\`${roomId}\`\`\``, inline: true },
          { name: 'PASS', value: `\`\`\`${password}\`\`\``, inline: true },
          { name: 'START', value: `\`\`\`${startTime}\`\`\``, inline: true }
        )
        .setImage(mapImage)
        .setFooter({ text: '𝐄𝐋¹ ᴢ ᴇ ᴛ丨ESPORTS', iconURL: serverIcon })
        .setTimestamp();

      // أرسل DM لكل فريق (صاحب الطلب)
      let sentCount = 0;
      const mentionIds = [];
      for (const team of acceptedTeams) {
        try {
          if (!team.ownerId) continue;
          const user = await client.users.fetch(team.ownerId).catch(() => null);
          if (!user) {
            console.log(`⚠️ لم أجد المستخدم ${team.ownerTag || team.ownerId}`);
            continue;
          }
          await user.send({ embeds: [embed] }).catch(() => { throw new Error('dmFailed'); });
          sentCount++;
          mentionIds.push(team.ownerId);
        } catch (err) {
          console.log(`⚠️ فشل الإرسال إلى ${team.ownerTag || team.ownerId}`);
        }
      }

      // أرسل نفس الإيمبد في قناة التسجيل مع منشن للأعضاء اللي وصلهم DM
      // نحاول استعمال القناة المحفوظة في السكرم (regMessageChannelId) وإلا نستخدم القناة الحالية
      let regChannel = null;
      try {
        if (scrim.regMessageChannelId) {
          regChannel = await client.channels.fetch(scrim.regMessageChannelId).catch(() => null);
        }
      } catch {}
      if (!regChannel && isInteraction) regChannel = messageOrInteraction.channel;
      if (!regChannel && !isInteraction) regChannel = messageOrInteraction.channel;

      const mentionText = mentionIds.length ? mentionIds.map(id => `<@${id}>`).join(' ') : '';

      if (regChannel) {
        // أرسِل الإيمبد مع منشن
        try {
          await regChannel.send({
            content: mentionText ? `🎯 Scrim started — notifying: ${mentionText}` : '🎯 Scrim started!',
          //  embeds: [embed]
          });
        } catch (err) {
          console.log('⚠️ فشل إرسال الإيمبد في قناة التسجيل:', err);
        }
      }

      // رد للـ command / interaction
      await safeReply(`✅ تم بدء السكرم (${scrimTime}) وإرسال الإيمبد إلى ${sentCount}/${acceptedTeams.length} فريق.`);

    } catch (err) {
      console.error('❌ Scrim Start Error:', err);
      try {
        if (isInteraction) {
          if (!messageOrInteraction.deferred && !messageOrInteraction.replied) {
            await messageOrInteraction.reply({ content: '⚠️ حصل خطأ أثناء إرسال السكرم.', flags: 64 }).catch(() => {});
          } else {
            await messageOrInteraction.editReply({ content: '⚠️ حصل خطأ أثناء إرسال السكرم.' }).catch(() => {});
          }
        } else {
          await messageOrInteraction.channel.send('⚠️ حصل خطأ أثناء إرسال السكرم.').catch(() => {});
        }
      } catch {}
    }
  }
};
