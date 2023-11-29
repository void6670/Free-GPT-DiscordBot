/**
 * Respond to certain troll commands before processing through the API :trolley:
 * @param {{[cmd: string]: string}} config An object in the form `command`: `response`
 * @param {import('discord.js').Message} message The Discord message to reply to
 * @param {string} content The message content
 * @returns True or false, indicating a match for `command`
 */
async function troll(config, message, content) {
  if (!content) return false;
  else
    for (const entry of Object.entries(config))
      if (content === entry[0]) return Boolean(await message.reply(entry[1]))
  return false;
}

module.exports = troll;
