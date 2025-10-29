module.exports = {
  name: 'ping',
  description: 'يعرض سرعة استجابة البوت',
  execute(message) {
    message.reply(`🏓 البينج: ${message.client.ws.ping}ms`);
  }
};
