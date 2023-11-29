 /** 
 * Verifies if `content` needs to be processed.
 * @param {string} content The message content
 * @returns A boolean indicating the verification
*/

function verifyProcessable(content) {
  const cond = content.startsWith("Please daddy") ||
    (content.startsWith("<") && content.endsWith(">")) ||
    content.startsWith("[TrollGPT") ||
    content.startsWith('https://') ||
    content === '<a:type:1016215574734442646> Processing...';
  return !cond;
}

module.exports = verifyProcessable;