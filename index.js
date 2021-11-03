//const Discord = require('discord.js');
//const client = new Discord.Client();

const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, "GUILDS", "GUILD_MESSAGES", "GUILD_PRESENCES", "GUILD_MEMBERS", "DIRECT_MESSAGES"] });
// const { token } = require('./auth.json');
require("dotenv").config();

client.once('ready', () => console.log('Ready!'));

// role voyageurs: 274990592856162305
// channel voyageurs: 245171854891810816

//membre rcc: 652144621023002637
// ami rcc: 652143998252744724

const wait = require('util').promisify(setTimeout);
client.on('messageCreate', async message => {
    //if (message.author.bot) return;
    const prefix = "!";
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === 'presence') {
        const guild = await client.guilds.cache.get('238725589379317761');
        const chan = await guild.channels.fetch('245171854891810816');
        // const chan = message.channel;
        const chanMessages = await chan.messages.fetch();
        const chanMembers = await chan.members.map(oMembre=>oMembre);
        const roleCondition = ["274990592856162305", "652144621023002637", "652143998252744724"];
        const memberRoleAllowed = [];
        const alreadyRepliedMemberId = [];
        const notRepliedMembersID = [];
        var stringAlreadySent = '';
        var stringNotSent = '';

        chanMembers.forEach((oMembre) => {
            if (roleCondition.some(el => oMembre._roles.includes(el))) {
                // console.log(`${oMembre.user.id} ${oMembre.user.username} possède un role adéquat pour la mission`);
                if (memberRoleAllowed.indexOf(oMembre.user.id) === -1) {
                    memberRoleAllowed.push(oMembre.user.id);
                }
            } //else {
                // console.log(`${oMembre.user.id} ${oMembre.user.username} n'a pas de role adéquat pour la mission`);
            //}
        });

        // check messages a first time
        // listes des utilisateurs (ID) ayant posté au moins un message (no duplicate ID)
        chanMessages.forEach((message) => {
            if ((alreadyRepliedMemberId.indexOf(message.author.id) === -1) && (memberRoleAllowed.includes(message.author.id))) {
                alreadyRepliedMemberId.push(message.author.id);
                stringAlreadySent = stringAlreadySent + `${message.author.username} `;
            }
        });

        // check messages a second time after collecting user ID on messages
        // listes des utilisateurs (ID) n'ayant posté aucun messages (no duplicate ID)
        chanMessages.forEach((oneMessage) => {
            if ((alreadyRepliedMemberId.indexOf(oneMessage.author.id) === -1) && (notRepliedMembersID.indexOf(oneMessage.author.id) === -1)) {
                notRepliedMembersID.push(oneMessage.author.id);
                stringNotSent = `<@${oneMessage.author.id}> ` + stringNotSent;
            }
        });
        message.channel.send(`Merci d'indiquer votre présence/absence et de choisir un slot ${stringNotSent} ! \nMerci à ${stringAlreadySent} pour l'avoir déjà fait :ok_hand:`);
        await wait(2000);
        message.delete();

    } else if (command === 'clear-for-presence') {
        let [nMsgToRm] = args; //  let nMsgToRm = args[0];
        if ((args.length !== 0) && (args[0] < 101)) {
            await message.channel.bulkDelete(`${nMsgToRm}`)
                .then(messages => console.log(`Bulk deleted ${messages.size} messages`))
                .catch(console.error);
            await wait(2000);
            message.delete();
        } else {
            console.log("La commande !clear-for-presence doit avoir un nombre (max 100) en paramètre.")
            await message.channel.send({ content: 'La commande !clear-for-presence doit avoir un nombre inférieur ou égal à 100 en paramètre. Ex: "!clear-for-presence 100', ephemeral: false });
            await wait(2000);
            message.delete();
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const { commandName } = interaction;

    if (commandName === 'test') {
        await interaction.reply({ content: 'Commandes de test envoyée... ', ephemeral: true });
        interaction.channel.send('Hello there... ');
        //It only shows cached members
        //You have to fetch all members beforehand (or at least one if you have the guild members intent)
    }
});

// Login to Discord with your client's token
// client.login(token);
client.login(process.env.BOT_TOKEN);
