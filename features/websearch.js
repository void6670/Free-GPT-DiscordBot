const fetch = require('phin');
const google = require('googlethis');
const DOMPurify = require('isomorphic-dompurify');
const cheerio = require('cheerio');
const { stripHtml } = require('string-strip-html');

/** 
 * Removes all unnecessary elements from the given HTML string
 * @param {string} html The HTML string to sanitize
 * @returns The sanitized HTML
*/
function sanitizeHtml (html) {
  const purified = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ['b', 'em', 'strong', 'p', 'i']
  });
  const $ = cheerio.load(purified, null, false);
  ['head', 'header', 'nav', 'footer', 'ad', 'promo', 'style', 'script'].forEach(s => {
    $(`[class^=${s}]`).remove();
    $(`[id^=${s}]`).remove();
    $(s).remove();
  });
  const isolatedHtml = $.html();
  const strippedHtml = stripHtml(isolatedHtml);
  return strippedHtml;
      }