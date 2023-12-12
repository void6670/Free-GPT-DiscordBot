const { Client, Intents } = require('discord.js');
const {
  parseResetHistoryCmd,
  deleteSession,
  parseSummariseYTCmd,
} = require('./features/history');
const replyWithChunks = require('./features/splitter');
const brand = require('./features/branding');
const troll = require('./features/troll');
const verifyProcessable = require('./features/verify');
const { callApi } = require('./features/callApi');
const keepAlive = require('./keepAlive');

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const activityNames = [
  'Ping me to chat.',
  'Hey there!',
  'Let\'s generate some ai art.',
  'Who is TrollGPT?',
];

function setRandomActivity() {
  const randomIndex = Math.floor(Math.random() * activityNames.length);
  const activityName = activityNames[randomIndex];
  client.user.setActivity(activityName, { type: 'PLAYING' });
}

client.on('ready', () => {
  setRandomActivity();
  setInterval(setRandomActivity, 2000); // Change activity every 5 seconds
});

const basicallySuffixes = ['-18242678', '-18217199', '-24368996'];

client.on('messageCreate', async (message) => {
  if (basicallySuffixes.some((s) => message.content.endsWith(s))) {
    return message.reply('Basically ^');
  }

  const pinged = message.content.startsWith(`<@${client.user.id}>`);

  let { channel, message_reference: reply } = message
  const repliedTo = await channel.messages.fetch(reply.message_id);

  if (pinged || repliedTo.author.bot) {
    await message.channel.sendTyping();
    const content = (!message.author.bot
      ? message.content.substring(`<@${client.user.id}>`.length + 1)
      : message.content
    )?.trim();

    const cl = content.toLowerCase();

    const trollConfig = {
      'ping': `Pong! Latency: ${Date.now() - message.createdTimestamp}ms.`,
      'explode': '<:explod:1107305161866620988>',
      'amogus': '<a:amoguspet:1075897170701586442>',
      'waltuh we need to cook':
        'https://tenor.com/view/walter-white-breaking-bad-falling-pain-sad-gif-20448687',
      'jesse we need to cook': 'https://tenor.com/yl0z.gif',
      'https://tenor.com/view/discordmods-gif-18217199': 'Basically ^',
      'https://tenor.com/view/discord-mod-discord-gif-18242678': 'Basically ^',
      'give me nitro': 'Click this for free nitro\nhttps://is.gd/freeniteo',
    };

    if (await troll(trollConfig, message, cl)) return;

    if (!verifyProcessable(content)) return;

    const userID =
      message.type === 'REPLY'
        ? (await getRepliedMessage(message)).author.id
        : message.author.id;

    const contentWithoutMentions = content
      .replace(/<@&(\d+)>/g, (match, roleId) => {
        const role = message.guild.roles.cache.get(roleId);
        return role ? role.name : 'Unknown Role';
      })
      .replace(/<@!?(\d+)>/g, (match, userId) => {
        const user = message.guild.members.cache.get(userId);
        return user ? user.displayName : 'Unknown User';
      });

    if (cl.startsWith('resethistory')) return await parseResetHistoryCmd(cl, message, userID);
    else if (cl.startsWith('summariseyt') || cl.startsWith('summarizeyt'))
      return await parseSummariseYTCmd(contentWithoutMentions, message);

    const response = await callApi(contentWithoutMentions, userID, message.author.bot);

    if (!response) return;

    const cuteResponse = brand(
      brand(
        brand(brand(response, 'OpenAI', 'Void & Shrihan'), '@here', Math.random() > 0.5 ? 'h3r3' : 'No'),
        '7WabGcsBsg',
        Math.random() > 0.5 ? '7WabGcsBsg' : '7WabGcsBsg'
      ),
      '@everyone',
      '@every1'
    );

    if (cuteResponse.length > 1950) return await replyWithChunks(cuteResponse, message);
    else return await message.reply(cuteResponse);
  }
});

keepAlive();

setInterval(() => deleteSession(true, 0), 10 * 60 * 1000);
setInterval(() => deleteSession(false, 69), 10 * 60 * 60 * 1000);

const token = 'BotTokenHere';

if (!token) {
  console.error("You dumbo, where's your token?");
  process.exit(1);
}

client.login(token);
