// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { token } = require('../auth.json');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const wait = require('util').promisify(setTimeout);

client.once('ready', () => console.log('Ready!'));

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'presence') {
        //await interaction.reply({ content: 'Commande test envoyée.', ephemeral: true });
    } else if (commandName === 'clearmessages') {
        // Bulk delete messages

        await interaction.channel.bulkDelete()
            .then(messages => console.log(`Bulk deleted ${messages.size} messages`))
            .catch(console.error);

    } else if (commandName === 'annonce-mission') {}
});


// Login to Discord with your client's token
client.login(token);