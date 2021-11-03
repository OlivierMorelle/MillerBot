// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { token } = require('../auth.json');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const wait = require('util').promisify(setTimeout);

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log('Ready!');
});

// message.guild.roles.get('903611155833045002').members.map(m=>m.user.tag);

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'signalez') {
        await interaction.reply('Merci d\'indiquez votre présence @membres !');
    } else if (commandName === 'presence') {
        await interaction.reply({ content: 'Liste des presences: "LALAL", "LOLOLO"...', ephemeral: true });
    } else if (commandName === 'absence') {
        await interaction.reply({ content: 'Liste des absences: "NANANA", "NONONO"...', ephemeral: true });
    } else if (commandName === 'annonce-mission') {
        const channelDestination = interaction.options.getChannel('destination');
        const role = interaction.options.getRole('muted');
        console.log(channelDestination.members);

        /*
        if (channelDestination != null) {
            channelDestination.send("La nouvelle annonce !");
            await interaction.reply({ content: 'Nouvelle annonce envoyée.', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Il faut renseigner un channel !', ephemeral: true });
        }*/
    } else if (commandName === 'server') {
        await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
    } else if (commandName === 'user') {
        await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
    } else if (commandName === 'test') {
    }
});


// Login to Discord with your client's token
client.login(token);