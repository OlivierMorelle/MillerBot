//const Discord = require('discord.js');
//const client = new Discord.Client();

const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, "GUILDS", "GUILD_MESSAGES", "GUILD_PRESENCES", "GUILD_MEMBERS", "DIRECT_MESSAGES"] });
// const { token } = require('./auth.json');
require("dotenv").config();

client.once('ready', () => console.log('Ready!'));

//rcc guild: 631191166934581249
//rcc vendredi: 902659520214466560

//membre rcc: 652144621023002637
// ami rcc: 652143998252744724

const wait = require('util').promisify(setTimeout);
client.on('messageCreate', async message => {
    //if (message.author.bot) return;
    const prefix = "!";
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === 'presence') {
        const guild = await client.guilds.cache.get('631191166934581249');
        // const chan = await guild.channels.fetch('902659520214466560');
        const chan = await message.channel;
        const chanMessages = await chan.messages.fetch();
        const chanMembers = await chan.members.map(oMembre=>oMembre);
        const roleConditionNotif = ["652144621023002637", "652143998252744724"];
        const roleAdmin = ["631235492763009054", "652145728910524436"];
        const memberRoleAllowedFromChannel = [];
        const memberToMentionWithNotif = []; // effectif Membre RCC selon [0]
        const memberToMentionWithoutNotif = []; // effectif Amis RCC selon [1]
        const manifestedMemberId = [];
        const unmanifestedMemberId = [];
        let strManifestedAlready = '';
        let strUnmanifested = '';
        let strUnmanifestedNotif = '';
        let countAllDiscordPeople = 0;
        let countMembreAndAmi = 0;
        let countMembreRCCPresent = 0;
        let countRejected = 0;

        console.log("=======================================================================================================\nCommande de présence lancé par :" + message.author.tag);
        const cmdLaunchedBy = message.author.id;

        // for (let i = 0; i < chanMembers.length; i++) {
        //     console.log(chanMembers[i].user.id);
        //     console.log(chanMembers[i]._roles);
        // }
        chanMembers.forEach((oMember) => {
            if (roleAdmin.some(el => oMember._roles.includes(el))) {
                console.log("Vous n'avez pas les droits pour cette commandes.")
             }

            countAllDiscordPeople++;
            if (roleConditionNotif.some(el => oMember._roles.includes(el))) {
                countMembreAndAmi ++; // console.log(`${oMember.user.id} ${oMember.user.username} possède un role adéquat pour la mission`);
                memberRoleAllowedFromChannel.push(oMember.user.id);
                if (oMember._roles.find(oRole => oRole === roleConditionNotif[0])) {
                    memberToMentionWithNotif.push(oMember.user.id);
                } else if (oMember._roles.find(oRole => oRole === roleConditionNotif[1])) {
                    memberToMentionWithoutNotif.push(oMember.user.id);
                }
            } else {
                countRejected++; //console.log(`${oMember.user.id} ${oMember.user.username} n'a pas de role adéquat pour la mission`);
            }
        });
        // console.log(`All: ${countAllDiscordPeople} - Membre or Ami: ${countMembreAndAmi} (Membre: ${countMembreRCC} - Ami: ${memberToMentionWithoutNotif.lenght}) - Rejected: ${countRejected}`);

        // check messages a first time
        // listes des utilisateurs (ID) ayant posté au moins un message (no duplicate ID)
        chanMessages.forEach((message) => {
            if ((memberRoleAllowedFromChannel.includes(message.author.id)) && (manifestedMemberId.indexOf(message.author.id) === -1)) {
                manifestedMemberId.push(message.author.id);
                strManifestedAlready = strManifestedAlready + `${message.author.username} - `;
                console.log(`${message.author.username} Signalé `);
                if (memberToMentionWithNotif.includes(message.author.id)) {
                    countMembreRCCPresent++;
                }
            }
        });

        // check messages a second time after collecting user ID on messages
        // listes des utilisateurs (ID) n'ayant posté aucun messages (no duplicate ID)
        memberRoleAllowedFromChannel.forEach((oMemberId) => {
            if ((manifestedMemberId.indexOf(oMemberId) === -1) && (unmanifestedMemberId.indexOf(oMemberId) === -1)) {
                unmanifestedMemberId.push(oMemberId);
                console.log(`${oMemberId} non encore manifesté `);
                if (memberToMentionWithNotif.includes(oMemberId)) {
                    strUnmanifestedNotif = `<@${oMemberId}> ` + strUnmanifestedNotif;
                } /*else if (memberToMentionWithoutNotif.includes(oMemberId)) {
                    // strUnmanifested = `${oMemberId} ` + strUnmanifested;
                    // find(element => element > 10);
                }*/
            }
        });
        console.log(`Effectif max potentiel: x/${memberRoleAllowedFromChannel.length} manifestés`);
        message.channel.send(`Merci d'indiquer votre présence/absence et de choisir un slot ${strUnmanifestedNotif} !`);
        message.channel.send(`${strManifestedAlready} l'ont déjà fait :ok_hand: (${countMembreRCCPresent}/${memberToMentionWithNotif.length})`);

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
    } else if (commandName === 'count-members') {}
});

// Login to Discord with your client's token
// client.login(token);
client.login(process.env.BOT_TOKEN);
