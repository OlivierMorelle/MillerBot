// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { token } = require('../auth.json');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log('Ready!');
});

// message.guild.roles.get('903611155833045002').members.map(m=>m.user.tag);

client.on('message', function(message) {

});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const { commandName } = interaction;

    if (commandName === 'test') {

    }
});


// Login to Discord with your client's token
client.login(token);