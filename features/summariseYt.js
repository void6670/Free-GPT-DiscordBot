const fetch = require('phin');
const { Innertube } = require('youtubei.js');
const { XMLParser } = require('fast-xml-parser');

const replyWithChunks = require('./splitter');

/* // Some custom shit i tried... didnt work ~shrihan
/** 
 * Google's shit in base.js

function generateNonce() {
  const rnd = Math.random().toString();
  const alphabet =
    'ABCDEFGHIJKLMOPQRSTUVWXYZabcdefghjijklmnopqrstuvwxyz0123456789';
  const jda = [
    alphabet + '+/=',
    alphabet + '+/',
    alphabet + '-_=',
    alphabet + '-_.',
    alphabet + '-_',
  ];
  const b = jda[3];
  const a = [];
  for (let i = 0; i < rnd.length - 1; i++) {
    a.push(rnd[i].charCodeAt(i));
  }
  let c = '';
  let d = 0;
  let m, n, q, r, f, g;
  while (d < a.length) {
    f = a[d];
    g = d + 1 < a.length;

    if (g) {
      m = a[d + 1];
    } else {
      m = 0;
    }
    n = d + 2 < a.length;
    if (n) {
      q = a[d + 2];
    } else {
      q = 0;
    }
    r = f >> 2;
    f = ((f & 3) << 4) | (m >> 4);
    m = ((m & 15) << 2) | (q >> 6);
    q &= 63;
    if (!n) {
      q = 64;
      if (!q) {
        m = 64;
      }
    }
    c += b[r] + b[f] + b[m] + b[q];
    d += 3;
  }
    return c;
}

/** 
 * Tracking params to simulate a real request
 * @param {string} page The html content of the page

function requestParams(page) {
    const params = page.split('"serializedShareEntity":"')[1]?.split('"')[0];
    const visitorData = page.split('"VISITOR_DATA":"')[1]?.split('"')[0];
    const sessionId = page.split('"sessionId":"')[1]?.split('"')[0];
    const clickTrackingParams = page
      ?.split('"clickTrackingParams":"')[1]
      ?.split('"')[0];
    return {
      context: {
        aclient: {
          hl: 'fr',
          gl: 'FR',
          visitorData,
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)',
          clientName: 'WEB',
          clientVersion: '2.20200925.01.00',
          osName: 'Macintosh',
          osVersion: '10_15_4',
          browserName: 'Chrome',
          browserVersion: '85.0f.4183.83',
          screenWidthPoints: 1440,
          screenHeightPoints: 770,
          screenPixelDensity: 2,
          utcOffsetMinutes: 120,
          userInterfaceTheme: 'USER_INTERFACE_THEME_LIGHT',
          connectionType: 'CONN_CELLULAR_3G',
        },
        request: {
          sessionId,
          internalExperimentFlags: [],
          consistencyTokenJars: [],
        },
        user: {},
        clientScreenNonce: generateNonce(),
        clickTracking: {
          clickTrackingParams,
        },
      },
      params,
    };
}
*/

/**
 * Parses a given string to get a video ID
 * @param {string} content The string to be parsed
 * @returns The video ID or `null` if invalid parameters
*/
function parseVideoId(content) {
  if (content.length === 11) // an actual ID
    return content;
  const match = content.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (match && match.length)
    return match[1]; // parsed from URL
  return null; // invalid params
}

/** 
 * Fetches a transcript from the given video ID or URL.
 * @param {string} urlOrId A valid YouTube URL or ID
 * @returns The joined version of the entire transcript or `null` if unable to fetch
*/
async function getTranscript(urlOrId) {
  const vId = parseVideoId(urlOrId);
  console.log(vId);
  try {
    const yt = await Innertube.create();
    const info = await yt.getInfo(vId);
    const captionsUrl = info.captions.caption_tracks[0].base_url;
    const { body: captionsXml } = await fetch(captionsUrl);
    const parsedCaptionsXml = new XMLParser().parse(captionsXml.toString());
    const transcript = parsedCaptionsXml.transcript.text.join(';');
    return transcript;
  } catch(e) {
    console.error(e);
    return null;
  }
}

/** 
 * Summarize a given transcript through ChatGPT.
 * @param {string} transcript The transcript text
 * @returns The summary, as returned through GPT (or `null` if unable to process request)
*/
async function summariseTranscript(transcript) {
  let prompt = `The following text is a direct transcription of a YouTube video. I want you to study the same and give me a short but sufficient summarisation of what the video talks about with no more than 175 words. The transcription may have discrepancies due to speech detection issues, so please make sure to condone to that. The random semicolons are actually different parts of the transcription that YouTube auto-generated according to the timing in the video, so the semicolons are separators of those timed chunks. Here goes:\n${transcript}`;
  try {
    return await makeRequest(prompt);
  } catch (e) {
    console.error(e);
    return null;
  }
}

/** 
 * Parses the commands to summarise the transcription of the given video.
 * @param {string} content The message content
 * @param {import('discord.js').Message} message The Discord message to reply to
 * @returns The replied message
*/
async function parseSummariseYTCmd(content, message) {
  const cleansedContent = content.split(' ')[0].toLowerCase().replace('summarize', 'summarise') + content.split(' ')[1]
  const param = cleansedContent.substring('summariseyt'.length + 1);
  if (!param)
    return await message.reply("[TrollGPT] A valid YouTube URL or Video ID is required.");
  else if (param.split(' ').length != 1)
    return await message.reply("[TrollGPT] Only one argument, i.e., a valid YouTube URL or Video ID is required.");
  else if (!parseVideoId(param))
    return await message.reply("[TrollGPT] Invalid URL or video ID.");
  try {
    const transcript = await getTranscript(param);
    if (!transcript)
      throw new Error("Unable to fetch the transcript for the given video ID.");
    const summary = await summariseTranscript(transcript);
    if (!summary)
      throw new Error("Unable to fetch the summary of the transcription for the video.");
    return await replyWithChunks(summary, message);
  } catch(e) {
    return await message.reply("[TrollGPT] Error while processing the command. Error:\n```js\n" + e.message + "\n```")
  }
}

module.exports = parseSummariseYTCmd;