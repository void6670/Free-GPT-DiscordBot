const fs = require('fs');
const fetch = require('phin');
const { append, retrieve } = require('./history');

const bannedUsers = ["", ""];
async function makeRequest(prompt, userID) {
  const url = process.env.ENDPOINT;
  const data = {
    frequency_penalty: 0,
    max_tokens: 2000,
    model: 'gpt-3.5-turbo',
    presence_penalty: 0,
    stream: false,
    temperature: 0.7,
    top_p: 1,
    messages: userID ? retrieve(userID) : [
      { // this needs to be fixed since it doesn't work
        role: 'system',
        content: 'You are a chatbot on Discord called FreeGPT. Your responses will be short, simple and straight-to-the-point unless asked for long ones. Make sure to use Discord-ian formatting in your messages, and avoid using LaTeX if you\'re writing equations for example (using Unicode as much as possible is better).'
      },
      {
        role: 'user',
        content: prompt
      }
    ]
  };

  const userAgents = [
    "Mozilla/5.0 (Macintosh; PPC Mac OS X 10.4; FPR30; rv:45.0) Gecko/20100101 Firefox/45.0 TenFourFox/7450",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/78.0.3904.108 Chrome/78.0.3904.108 Safari/537.36"
  ];

  const headers = {
    'Content-Type': 'application/json',
    'User-Agent':
      userAgents[Math.floor(Math.random() * userAgents.length)],
    'Authorization': 'Bearer ${process.env.KEY}'
  };

  try {
    const completionResponse = await fetch({
      url,
      method: 'POST',
      headers,
      data
    });

    if (process.env?.LOG_API_CALL)
      console.log({ buffer: completionResponse.body, str: completionResponse.body.toString() });

    const responseBody = JSON.parse(completionResponse.body.toString());

    if (responseBody.choices && responseBody.choices.length > 0) {
      return responseBody.choices[0].message.content || null;
    } else {
      console.error('Unexpected response format:', responseBody);
      return null; // Handle the case when the response format is unexpected
    }
  } catch (error) {
    console.error('Error in completion API:', error);
    return 'Oops! Looks like there was an issue with the bot in completion api. We are working to fix it while you wait. Please report the issue at our server.';
  }
}

async function callApi(message, userID, isBot) {
  append(message, userID, isBot);

  // Save the received message and user ID to a text file
  saveToUserMessageLogs(userID, message);

  // Check if the user is banned
  if (bannedUsers.includes(userID)) {
    return 'You have been banned from using our bot.';
  }

  if (isBot) return;

  try {
    return await makeRequest(message, userID);
  } catch (error) {
    console.error('Error in callApi:', error);
    return 'Oops! Looks like there was an issue with the bot. We are working to fix it while you wait. Please report the issue at our server.';
  }
}

// Function to save the received message and user ID to a text file this is used to check if people are abusing the bot
function saveToUserMessageLogs(userID, message) {
  const logEntry = `${new Date().toISOString()} - User ID: ${userID}, Message: ${message}\n`;
  fs.appendFile('usermessagelogs.txt', logEntry, (err) => {
    if (err) {
      console.error('Error writing to usermessagelogs.txt:', err);
    }
  });
}

module.exports = { callApi, makeRequest };
