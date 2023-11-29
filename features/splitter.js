 /**
 * Takes a string of text, divides it into chunks of a sizeable length and replies to the given `message` with each chunk being replied to the previous message.
 * The first message will be an edit of the original message, NOT a reply.
 * @param {string} text The text to split
 * @param {import('discord.js').Message} message The initial message to reply to
 * @param {number} elapsed The current index of the chunks
 * @param {number} total The total number of chunks
 * @returns If `elapsed <= total`, it returns a call to itself with the rest of the chunks, else `undefined`.
 */

async function replyWithChunks(text, message, elapsed, total) {
  const chunks = [];
  const chunkSize = 1900;
  for (let i = 0; i < text.length; i += chunkSize)
    chunks.push(text.slice(i, i + chunkSize));
  //const toBeEdited = !(elapsed ?? total);
  elapsed ??= 1;
  total ??= chunks?.length;
  if (elapsed > total) return;
  const emote = elapsed === total ? '<:check:1120622481699512340>' : '<a:bookpageflip:1120621835558584350>';
  const content = `[TrollGPT: ${emote} ${elapsed}/${total}]\n${chunks[0]}`;
  const repliedChunk = await message.reply(content);
  if (++elapsed <= total)
    return await replyWithChunks(chunks.slice(1).join(''), repliedChunk, elapsed, total);
}

module.exports = replyWithChunks;