const verify = require('./verify')
/**
 * Replaces all occurences of `search`, along with all possible variations, with `replace` :trolley:
 * @param {string} text The string of text to brand
 * @param {string} search The word to be replace
 * @param {string} replace The word to replace all occurences of `search`
 * @returns The branded text
 */
function brand(text, search, replace) {
  let intrusion = '[a-zA-Z0-9_!@#$%^&*()\\-+=?<>[\\]\\\\`~;:\'",.{}|]*?';
  return verify(text) ? text.replace(
    new RegExp(
      search.split('').reduce((l, m) => l + intrusion + m),
      'gi'
    ),
    replace
  ) : text;
}

module.exports = brand;
