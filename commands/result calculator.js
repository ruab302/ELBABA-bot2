const { 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  StringSelectMenuBuilder, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  AttachmentBuilder 
} = require('discord.js');
const { createCanvas } = require('@napi-rs/canvas');

// Helper: ensure results structure exists for a scrim/team
function ensureResultsStructure(scrims, scrimId) {
  if (!scrims[scrimId]) return false;
  if (!scrims[scrimId].results) scrims[scrimId].results = {};
  const members = scrims[scrimId].members || [];
  for (const m of members) {
    if (!scrims[scrimId].results[m.id]) {
      scrims[scrimId].results[m.id] = {
        teamName: m.name,
        rounds: { round1: null, round2: null, round3: null }
      };
    } else {
      scrims[scrimId].results[m.id].teamName = m.name;
      if (!scrims[scrimId].results[m.id].rounds) 
        scrims[scrimId].results[m.id].rounds = { round1: null, round2: null, round3: null };
    }
  }
  return true;
}

// تنفيذ أمر .result calculator
console.log('✅ result calculator file is running!');

module.exports = {
  name: 'result calculator',
  description: 'Show scrim result calculator',
  async execute(message, args, client, scrims) {
    try {
      const scrimId = args[0];
      if (!scrimId || !scrims[scrimId]) 
        return message.reply('❌ السكرم مش موجود أو انتهى.');

      ensureResultsStructure(scrims, scrimId);

      const members = scrims[scrimId].members || [];
      if (!members.length) 
        return message.reply('❌ مفيش فرق مسجّلة في السكرم ده.');

      // 🟣 إنشاء Select Menu لاختيار الفريق (افتراضي للجولة 1)
      const select = new StringSelectMenuBuilder()
        .setCustomId(`rc_team_select|${scrimId}|round1`)
        .setPlaceholder('اختر الفريق اللي هتسجل له النتيجة')
        .addOptions(
          members.map(m => ({
            label: m.name.length > 100 ? m.name.slice(0, 100) : m.name,
            value: m.id,
            description: `Team ID: ${m.id}`
          }))
        );

      const row = new ActionRowBuilder().addComponents(select);

      // 🔵 أزرار الجولات
      const roundButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
           .setCustomId(`rc_round|round1|${scrimId}`)
           .setLabel('🟢 Round 1')
           .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
           .setCustomId(`rc_round|round2|${scrimId}`)
           .setLabel('🟡 Round 2')
           .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
           .setCustomId(`rc_round|round3|${scrimId}`)
           .setLabel('🔴 Round 3')
           .setStyle(ButtonStyle.Primary)
      );

      // 🟠 أزرار التحكم
      const controlButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`rc_double|${scrimId}`).setLabel('Double Points').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`rc_total|${scrimId}`).setLabel('Total').setStyle(ButtonStyle.Success)
      );

      await message.reply({ 
        content: '📊 اختر الجولة أو الفريق من القوائم بالأسفل:', 
        components: [roundButtons, row, controlButtons] 
      });
    } catch (err) {
      console.error('Result calculator error:', err);
      return message.reply('⚠️ حصل خطأ أثناء تشغيل Result Calculator.');
    }
  }
};

// =========================
// Total Button Handler (داخل interactionCreate)
// =========================
async function handleTotalButton(interaction, scrims) {
  const [ , scrimId ] = interaction.customId.split('|');
  if (!scrimId || !scrims[scrimId]) 
    return interaction.reply({ content: '❌ السكرم مش موجود أو انتهى.', flags: 64 });

  ensureResultsStructure(scrims, scrimId);

  const resultsObj = scrims[scrimId].results || {};
  const rankPoints = { 1:10, 2:6, 3:5, 4:4, 5:3, 6:2, 7:1, 8:1 };
  const teams = [];

  for (const teamId of Object.keys(resultsObj)) {
    const entry = resultsObj[teamId];
    const rounds = entry.rounds || {};
    let wwcd = 0, pointsOnly = 0, killsTotal = 0;
    for (const rKey of ['round1','round2','round3']) {
      const r = rounds[rKey];
      if (r) {
        if (r.rank === 1) wwcd++;
        pointsOnly += (rankPoints[r.rank] || 0);
        killsTotal += (r.kills || 0);
      }
    }
    const total = pointsOnly + killsTotal;
    teams.push({ teamId, teamName: entry.teamName, wwcd, pointsOnly, kills: killsTotal, total });
  }

  teams.sort((a,b) => b.total - a.total);
  const top = teams.slice(0,10);

  // توليد PNG
  const width = 1000;
  const rowHeight = 48;
  const headerHeight = 140;
  const footerHeight = 30;
  const height = headerHeight + Math.max(10, top.length)*rowHeight + footerHeight;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000000';
  console.log('🎨 Painting background black');

  ctx.fillRect(0,0,width,height);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🏆 SCRIM RESULTS 🏆', width/2, 46);
  ctx.font = '16px Arial';
  ctx.fillText(`Scrim Time ⤳ ${scrims[scrimId].scrimTime || scrimId}`, width/2, 76);

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40,90);
  ctx.lineTo(width-40,90);
  ctx.stroke();

  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  const startX = 60, colTeamX=120, colWWCDX=560, colPointsX=640, colKillsX=740, colTotalX=840;
  ctx.fillText('TOP', startX, 120);
  ctx.fillText('Team', colTeamX, 120);
  ctx.fillText('WWCD', colWWCDX, 120);
  ctx.fillText('Points', colPointsX, 120);
  ctx.fillText('Kills', colKillsX, 120);
  ctx.fillText('Total', colTotalX, 120);

  ctx.font = '16px Arial';
  for (let i=0;i<top.length;i++) {
    const y = headerHeight + i*rowHeight;
    const t = top[i];
    ctx.fillText(`#${i+1}`, startX, y);
    const name = t.teamName.length>36 ? t.teamName.slice(0,33)+'...' : t.teamName;
    ctx.fillText(name, colTeamX, y);
    ctx.fillText(String(t.wwcd), colWWCDX, y);
    ctx.fillText(String(t.pointsOnly), colPointsX, y);
    ctx.fillText(String(t.kills), colKillsX, y);
    ctx.fillText(String(t.total), colTotalX, y);
  }

  ctx.beginPath();
  ctx.moveTo(40, headerHeight + top.length*rowHeight +10);
  ctx.lineTo(width-40, headerHeight + top.length*rowHeight +10);
  ctx.stroke();

  const buffer = canvas.toBuffer('image/png');
  const attachment = new AttachmentBuilder(buffer, { name: `scrim_${scrimId}_results.png` });

  await interaction.reply({ files: [attachment] });
}

module.exports.handleTotalButton = handleTotalButton;
