const fs = require('fs');
const path = require('path');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'scrim create',
  description: 'Create a scrim: !scrim create <scrimTime> <spareTime> <startTime> <mapType> [on]',

  async execute(message, args, client, scrims = {}, config = {}, saveData) {
    try {
      if (!args[0] || args[0].toLowerCase() !== 'create') {
        return message.reply('❌ استخدم: `!scrim create <scrimTime> <spareTime> <startTime> <mapType> [on]`');
      }

      if (args.length < 5) {
        return message.reply('❌ الصيغة: `!scrim create 10:00 10:15 10:30 1 on`');
      }

      const scrimTime = args[1];
      const spareTime = args[2];
      const startTime = args[3];
      const mapType = parseInt(args[4], 10);
      const mode = args[5]?.toLowerCase() === 'on' ? 'on' : 'auto';

      const mapRotationOptions = {
        1: ['Room [1]: Erangel', 'Room [2]: Miramar', 'Room [3]: Sanhok'],
        2: ['Room [1]: Erangel', 'Room [2]: Miramar', 'Room [3]: Erangel'],
        3: ['Room [1]: Erangel', 'Room [2]: Miramar', 'Room [3]: Vikendi']
      };

      const mapRotation = mapRotationOptions[mapType];
      if (!mapRotation) return message.reply('❌ رقم الماب غير صحيح! اختار 1 أو 2 أو 3.');

      const scrimId = `${scrimTime.replace(/:/g, '-')}_${Date.now()}`;
      const scrimsPath = path.join(__dirname, '..', 'scrims.json');
      const diskScrims = fs.existsSync(scrimsPath)
        ? JSON.parse(fs.readFileSync(scrimsPath, 'utf8'))
        : {};

      const scrimEntry = {
        id: scrimId,
        scrimTime,
        spareTime,
        startTime,
        mapType,
        mapRotation,
        mode,
        members: [],
        pending: [],
        createdBy: {
          id: message.author.id,
          tag: message.author.tag,
          username: message.member?.displayName || message.author.username
        },
        createdAt: new Date().toISOString(),
        regMessageId: null,
        regMessageChannelId: null,
        listMessageId: null,
        listMessageChannelId: null
      };

      diskScrims[scrimId] = scrimEntry;
      scrims[scrimId] = scrimEntry;
      fs.writeFileSync(scrimsPath, JSON.stringify(diskScrims, null, 2));
      if (typeof saveData === 'function') saveData();

      // Logs Embed
      const logsEmbed = new EmbedBuilder()
        .setTitle('🟢 Scrim created successfully')
        .addFields(
          { name: 'Scrim Details', value: `**Scrim Time:** ${scrimTime}\n**Spare Time:** ${spareTime}\n**Start Time:** ${startTime}` },
          { name: 'Map Rotation', value: mapRotation.join('\n') },
          { name: 'Created By', value: `User: <@${message.author.id}>\nUser ID: ${message.author.id}\nUsername: ${scrimEntry.createdBy.username}` },
          { name: 'Creation Time', value: `<t:${Math.floor(Date.now() / 1000)}:R>` }
        )
        .setColor('#6f00ff')
        .setThumbnail(message.author.displayAvatarURL({ extension: 'png', size: 256 }))
        .setTimestamp();

      const logsChannelId = config?.channels?.logs || null;
      let logsChannel = null;
      if (logsChannelId) {
        try { logsChannel = await client.channels.fetch(logsChannelId); } catch {}
      }
      if (!logsChannel) logsChannel = message.channel;
      await logsChannel.send({ embeds: [logsEmbed] });

      // Registration Embed
      const bigDescription = [
        `- تم فتح باب التسجيل لـ سكرم الساعة ${scrimTime} بتوقيت مصر و السعوديه`,
        ``,
        `-  التوحيد 2`,
        ``,
        `-  غرف متقدمة`,
        ``,
        `-  استمتع مع   𝐄𝐋¹ ᴢ ᴇ ᴛ丨𝐄𝐒𝐏𝐎𝐑𝐓𝐒`,
        ``,
        `--------------------------------------`,
        ``,
        `・𝗦𝗰𝗿𝗶𝗺 𝗥𝗲𝗴𝗶𝘀𝘁𝗿𝗮𝘁𝗶𝗼𝗻 𝗛𝗮𝘀 𝗢𝗽𝗲𝗻𝗲𝗱 𝗙𝗼𝗿 𝗦𝗰𝗿𝗶𝗺 𝗔𝘁 ${scrimTime}`,
        ``,
        `・𝗨𝗻𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻: 𝟮`,
        ``,
        `・𝗔𝗱𝘃𝗮𝗻𝗰𝗲𝗱 𝗥𝗼𝗼𝗺s`,
        ``,
        `・𝗘𝗻𝗷𝗼𝘆   𝐄𝐋¹ ᴢ ᴇ ᴛ丨𝐄𝗦𝗣𝗢𝗥𝗧𝐒`,
        ``,
        `𝗠𝗲𝗻𝘁𝗶𝗼𝗻: ||**@everyone**||`
      ].join('\n');

      const regEmbed = new EmbedBuilder()
        .setDescription(bigDescription)
        .setColor('#6f00ff')
        .setTimestamp();

      const registerBtn = new ButtonBuilder().setCustomId(`register_${scrimId}`).setLabel('Register').setStyle(ButtonStyle.Success);
      const cancelBtn = new ButtonBuilder().setCustomId(`cancelreg_${scrimId}`).setLabel('Cancel Registration').setStyle(ButtonStyle.Secondary);
      const rowReg = new ActionRowBuilder().addComponents(registerBtn, cancelBtn);

      const regChannelId = config?.channels?.registration || null;
      let regChannel = null;
      if (regChannelId) {
        try { regChannel = await client.channels.fetch(regChannelId); } catch {}
      }
      if (!regChannel) regChannel = message.channel;

      let regMessage = null;
      try {
        regMessage = await regChannel.send({ content: '@everyone', embeds: [regEmbed], components: [rowReg] });
      } catch {
        regMessage = await regChannel.send({ embeds: [regEmbed], components: [rowReg] });
      }

      const smallEmbed = new EmbedBuilder()
        .setTitle('Total Registered 0')
        .setDescription('Registered Teams:\n*No teams yet*')
        .setColor('#6f00ff')
        .setTimestamp();

      const listMessage = await regChannel.send({ embeds: [smallEmbed] });

      diskScrims[scrimId].regMessageId = regMessage.id;
      diskScrims[scrimId].regMessageChannelId = regChannel.id;
      diskScrims[scrimId].listMessageId = listMessage.id;
      diskScrims[scrimId].listMessageChannelId = regChannel.id;

      scrims[scrimId] = diskScrims[scrimId];
      fs.writeFileSync(scrimsPath, JSON.stringify(diskScrims, null, 2));
      if (typeof saveData === 'function') saveData();

      await message.reply(`🟢 تم إنشاء السكرم بنجاح!\n📅 Time: **${scrimTime}**\n📍 Channel: <#${regChannel.id}>`);
    } catch (err) {
      console.error(err);
      message.reply('❌ حصل خطأ أثناء إنشاء السكرم.');
    }
  }
};
