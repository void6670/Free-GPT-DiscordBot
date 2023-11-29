const { existsSync } = require('fs');
const { writeFile } = require('fs/promises');

let convoHistory = {};

if (existsSync('./data/convo-history.json'))
  convoHistory = require('../data/convo-history.json');

/**
 * Append the given `message` to the history of the user defined by `userID`.
 * @param {string} message The message content 
 * @param {string} userID The user ID of the author
 * @param {boolean} If the user is a bot
 */
async function append(message, userID, isBot) {
  if (!convoHistory[userID])
    convoHistory[userID] = {
      messages: [],
      lastActive: new Date().getTime(),
    };
  convoHistory[userID].messages.push({
    content: message,
    role: isBot ? 'assistant' : 'user',
  });

  convoHistory[userID].lastActive = new Date().getTime();
  await writeBack();
}

/**
 * Retrieves the messages stored in the history of the user
 * @param {string} userID The ID of the user to retrive the history of
 * @returns The conversation history of the user
 */
function retrieve(userID) {
  return convoHistory[userID].messages;
}

/**
 * Deletes the session of a given user ID.
 * If `uid == 69`, the entire history is cleared.
 * @param {boolean} Whether to check for expired sessions 
 * @param {string} uid ID of the user whose session is to be deleted
 */
async function deleteSession(check, uid) {
  const reset = userID => {
    if (userID) convoHistory[userID] = {
      messages: [],
      lastActive: new Date().getTime(),
    };
    else convoHistory = {};
  };
  if (check) {
    for (const userID in convoHistory) {
      const now = new Date().getTime();
      const lastActive = convoHistory[userID].lastActive;
      if (now - lastActive >= 10 * 60 * 1000) reset(userID);
    }
  } else if (uid == 69)
    reset();
  else
    reset(uid);
  await writeBack();
}
/**
 * Writes the history to `/data/convo-history.json`
 */
async function writeBack() {
  await writeFile('./data/convo-history.json', JSON.stringify(convoHistory), {
    encoding: 'utf-8',
  });
}

/**
 * Parses the content for `resethistory` commands
 * @param {string} content The message content to parse
 * @param {import('discord.js').Message} message The Discord message to reply to
 * @param {string} userID The user ID of the author
 * @returns The replied message
 */
async function parseResetHistoryCmd(content, message, userID) {
  const devs = require('../data/devs.json');
  if (content.substring('resethistory'.length + 1) === 'all') {
    if (!devs.includes(userID))
      return message.reply(
        `[TrollGPT] This is a dev-only command. Ask one of ${devs.reduce(
          (a, b) => `<@${a}>, <@${b}>`
        )} to do that.`
      );
    await deleteSession(false, 69);
    return message.reply('[TrollGPT] Reset conversation history for all.');
  } else {
    await deleteSession(false, userID);
    return message.reply(
      '[TrollGPT] Reset conversation history for user ID ' + userID
    );
  }
}

module.exports = {
  append,
  retrieve,
  deleteSession,
  parseResetHistoryCmd
};
