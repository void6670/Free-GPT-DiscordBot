// this is not part of the bot yet i will implement this soon


// Importing required libraries
const { Client, Intents } = require('discord.js');
const axios = require('axios');

// Creating a new Discord client with specified intents
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Define your API key and URL
const apiKey = "YOUR_API_KEY";
const apiUrl = 'YOUR_API_URL';

// Specify user IDs allowed to trigger the command
const allowedUserIDs = ['821328725643100172', 'USER_ID_2'];

// Event listener for incoming messages
client.on('messageCreate', async message => {
  // Ignore messages from bots
  if (message.author.bot) return;

  // Check if the message author is allowed and contains the trigger word 'prefix'
  if (allowedUserIDs.includes(message.author.id) && message.content.includes('prefix')) {
    // Extract the user's question and optional attached image URL
    const question = message.content.replace('prefix', '').trim();
    let imageUrl = '';

    // Check if there are attachments and extract the first one's URL
    if (message.attachments.size > 0) {
      const attachment = message.attachments.first();
      imageUrl = attachment.url;
    }

    // Set up headers for the API request
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };

    // Prepare data for the API request
    const data = {
      "settings": {
        "model": "npro-vision"
      },
      "conversation": {
        "history": [
          {
            "sender": "instruct",
            "content": "You are a helpful assistant."
          },
          {
            "sender": "user",
            "image_url": imageUrl,
            "content": question
          }
        ]
      }
    };

    try {
      // Make a POST request to the API with the prepared data
      const response = await axios.post(apiUrl, JSON.stringify(data), { headers });
      
      // Extract the response output and send it as a reply
      const output = response.data.choices[0].text;
      message.reply(output);
    } catch (error) {
      // Handle errors by logging and replying with an error message
      console.error(error);
      message.reply('An error occurred while processing your request.');
    }
  }
});

// Log in to Discord with the bot token
client.login('YOUR_BOT_TOKEN');
