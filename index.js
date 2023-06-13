const axios = require('axios');
const { Client, Events, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates] });

client.login('DISCORD_BOT_TOKEN');
// Initialize bot
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  // Custom status
  client.user.setActivity(`with spells`);
});

let previousStates = {}

let dealsArray = '';

// Generate 7 random numbers (from 1 to 50)
function rndNumbers() {
  let rndNumbersArray = [];
  for (let i = 1; i < 8; i++) {
        let rndNumber = Math.floor(Math.random() * 50) + 1
        rndNumbersArray.push(rndNumber)
    } return rndNumbersArray.join(', ')
}
// Deals loop
function buildArray(filteredDeals) {
  for (let i = 0; i < filteredDeals.length; i++) {
    dealsArray += `→ ${filteredDeals[i].title} – ${filteredDeals[i].metacriticScore} Meta, ${filteredDeals[i].steamRatingPercent}% Steam (${filteredDeals[i].steamRatingText}) – ${filteredDeals[i].salePrice}$ ~~${filteredDeals[i].normalPrice}$~~\n`
  }
  return dealsArray;
}
// Message
client.on('messageCreate', async (message) => {
  if (message.content.toLowerCase().includes('lottery') && message.content.toLowerCase().includes('<BOT_ID>')) {
    let rndNum = rndNumbers();
    await message.reply({ content: `🎲  Your lucky numbers are: ${rndNum}\nGodspeed!` });
  }
});
// Message when someone starts streaming
client.on('voiceStateUpdate', async (oldState, newState) => {
  const member = newState.member
  const guild = newState.guild
  let streaming = newState.streaming
  let wasStreaming = previousStates[member.id] || false
  if (newState.streaming && !wasStreaming) {
  const channel = client.channels.cache.get('CHANNEL_ID');
  let uselessAPI = await axios.get('https://uselessfacts.jsph.pl/api/v2/facts/random')
  let dealsAPI = await axios.get('https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=50&sortBy=reviews&onSale=1')
  let uselessFact = uselessAPI.data.text
  let deals = dealsAPI.data
  let filteredDeals = []
    for (let i = 0; i < deals.length; i++) {
        if (deals[i].metacriticScore >= 85 && deals[i].steamRatingPercent >= 90 && deals[i].steamRatingCount > 10000) {
            filteredDeals.push(deals[i])
        }
    }

  buildArray(filteredDeals);

  await channel.send(`<USER_ID> boop! 💜   ${newState.member.displayName} is live!\n📜   ${uselessFact}\n🕹️   ${filteredDeals.length} deals on Steam w/ highest deal ratings:\n${dealsArray}`)

  previousStates[member.id] = streaming
}});
