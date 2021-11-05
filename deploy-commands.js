const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./auth.json');

const commands = [
    new SlashCommandBuilder().setName('say').setDescription('Miller a quelque chose à dire.')
        .addStringOption(option => option.setName('message').setDescription('Message à envoyer')),
        // .addChannelOption(option => option.setName('salon').setDescription('Select a mission channel')),
    new SlashCommandBuilder().setName('presence').setDescription('Notifier les personnes non manifestés dans un channel de mission')
        .addChannelOption(option => option.setName('salon-mission').setDescription('Select a mission channel')),
    // new SlashCommandBuilder().setName('count-members').setDescription('Compte les membres RCC.'),
    // new SlashCommandBuilder().setName('signalez').setDescription('Merci d\'indiquez votre présence !'),
    // new SlashCommandBuilder().setName('absence').setDescription('Liste des absences.'),
    // new SlashCommandBuilder().setName('annonce-mission').setDescription('Fait une annonce !')
    //     .addChannelOption(option => option.setName('destination').setDescription('Select a channel'))
    //     .addRoleOption(option => option.setName('muted').setDescription('Select a role')),
    new SlashCommandBuilder().setName('server').setDescription('Replies with server info !'),
    new SlashCommandBuilder().setName('user').setDescription('Replies with user info !'),
    // new SlashCommandBuilder().setName('clear-messages').setDescription('Clear messages !'),
    new SlashCommandBuilder().setName('test').setDescription('test fonctionnel'),
]
    .map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);