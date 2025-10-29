const ffmpeg = require('ffmpeg-static');

// commands/joinvc.js
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior } = require('@discordjs/voice');
const path = require('path');
const fs = require('fs');

module.exports = {
  name: 'joinvc',
  description: 'Join a voice channel and play silent loop (keeps bot in VC). Usage: !joinvc <voiceChannelId?>',
  async execute(message, args, client) {
    try {
      // permission checks
      if (!message.guild.members.me.permissions.has('Connect') || !message.guild.members.me.permissions.has('Speak')) {
        return message.reply('❌ البوت محتاج صلاحيات Connect و Speak في السيرفر عشان يدخل الصوت.');
      }

      // determine target channel: arg or user's voice
      let channel = null;
      if (args[0]) {
        const id = args[0].replace(/[<#>]/g, '');
        channel = message.guild.channels.cache.get(id) || await message.guild.channels.fetch(id).catch(()=>null);
      } else {
        channel = message.member?.voice?.channel;
      }

      if (!channel) return message.reply('❌ رجاءً منشن روم صوتي أو كون داخل روم صوتي وأعد المحاولة.');

      // check it's a voice channel
      if (channel.type !== 2 && channel.type !== 'GUILD_VOICE') {
        // channel.type numeric may vary; discord.js v14 voice type is 2
        // just check .joinedMembers existence
      }

      // create / reuse player stored on client
      if (!client._vcConnections) client._vcConnections = new Map();

      // if already connected to this guild/channel, reply
      const guildKey = `${message.guild.id}`;
      if (client._vcConnections.get(guildKey)) {
        return message.reply('✅ البوت بالفعل متصل في قناة صوتية في هذا السيرفر.');
      }

      // join voice
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: true
      });

      // create player and loop silent resource
      const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });

      // path to silent file (must exist)
      const silentPath = path.join(__dirname, '..', 'silent.wav');
      if (!fs.existsSync(silentPath)) {
        return message.reply('❌ ملف silent.wav مش موجود في فولدر المشروع. نفّذ make_silence.js أو حط ملف silent.wav.');
      }

      let resource = createAudioResource(silentPath, {
  inputType: null,
  inlineVolume: false,
  ffmpegExecutable: ffmpeg
});

      player.play(resource);
      connection.subscribe(player);

      // on idle, replay resource (loop)
      player.on(AudioPlayerStatus.Idle, () => {
        try {
          const r = createAudioResource(silentPath);
          player.play(r);
        } catch (e) { console.error('loop play error', e); }
      });

      // save references
      client._vcConnections.set(guildKey, { connection, player, channelId: channel.id, startedAt: Date.now() });

      message.reply(`✅ دخلت الروم الصوتي وبدأت تشغيل صامت (silent loop) في <#${channel.id}>. هيفضل موجود طالما السيرفر شغال.`);

    } catch (err) {
      console.error('joinvc error', err);
      return message.reply('❌ حصل خطأ أثناء محاولة الدخول للكول. شوف الكونسول.');
    }
  }
};
