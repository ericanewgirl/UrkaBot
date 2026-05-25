
    const { Client, GatewayIntentBits } = require('discord.js');
    const axios = require('axios');

    // Discord bot token and channel ID
    const DISCORD_TOKEN = '1508331611001852028';
    const CHANNEL_ID = '678145140262436864';

    // Twitch credentials
    const TWITCH_CLIENT_ID = 'd99st1jyzz28oztfcx9sacajc9xhs0';
    const TWITCH_CLIENT_SECRET = 'hohh3f9eafur8w6ppr09h3oyq3fg4y';
    const TWITCH_USER_NAME = 'EricaPlz';

    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });

    let twitchAccessToken = '';

    // Function to get Twitch access token
    async function getTwitchAccessToken() {
      const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
          client_id: TWITCH_CLIENT_ID,
          client_secret: TWITCH_CLIENT_SECRET,
          grant_type: 'client_credentials'
        }
      });
      twitchAccessToken = response.data.access_token;
    }

    // Function to check if the Twitch user is live
    async function isTwitchUserLive() {
      const response = await axios.get(`https://api.twitch.tv/helix/streams`, {
        headers: {
          'Client-ID': TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${twitchAccessToken}`
        },
        params: {
          user_login: TWITCH_USER_NAME
        }
      });

      return response.data.data.length > 0;
    }

    client.once('ready', () => {
      console.log(`Logged in as ${client.user.tag}!`);

      // Check Twitch status every 60 seconds
      setInterval(async () => {
        try {
          const live = await isTwitchUserLive();
          if (live) {
            const channel = await client.channels.fetch(CHANNEL_ID);
            channel.send(`$@LiveNow {TWITCH_USER_NAME} is now live on Twitch! Check it out at https://www.twitch.tv/${TWITCH_USER_NAME}`);
          }
        } catch (error) {
          console.error('Error checking Twitch status:', error);
        }
      }, 60000); // Check every 60 seconds
    });

    client.login(1508331611001852028);

    // Get Twitch access token at the start
    getTwitchAccessToken().catch(console.error);
