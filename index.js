const {Client, Intents} = require('discord.js');
const client = new Client({intents: [Intents.FLAGS.GUILDS, "GUILDS", "GUILD_MESSAGES", "GUILD_PRESENCES", "GUILD_MEMBERS", "DIRECT_MESSAGES"]});
require("dotenv").config(); // const { token } = require('./auth.json');

client.once('ready', () => console.log('Ready!'));

const wait = require('util').promisify(setTimeout);
client.on('messageCreate', async message => {
    const prefix = "!";
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const argText = message.content.slice(5);

    const guild = await client.guilds.cache.get('631191166934581249');
    // const chan = await guild.channels.fetch('904052206435700806'); // to test a specify channel
    const chan = await message.channel;
    const chanMessages = await chan.messages.fetch();
    const chanMembers = await chan.members.map(oMembre => oMembre);
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
    let countAllChannelPeople = 0;
    let countMembreAndAmi = 0;
    let countMembreRCCPresent = 0;
    let countRejected = 0;

    function checkAdminOrModo(atbMembers) {
        const cmdLaunchedById = message.author.id;
        const cmdMember = atbMembers.find(element => element.user.id === cmdLaunchedById);
        if ((cmdLaunchedById === "134729717550022656") || (roleAdmin.some(elRole => cmdMember._roles.includes(elRole)))) {
            console.log(cmdMember.user.username + " est du staff, modo ou test cmd, a exécuté une commande.")
            return true;
        } else {
            console.log(cmdMember.user.username + "n'a pas les droits pour cette commande, exit.\n=======================================================================================================\n")
            return false;
        }
    }

    if ((command === 'presence') && (checkAdminOrModo(chanMembers))) {
        console.log("=======================================================================================================\nCommande de présence lancé par :" + message.author.tag);
        for (let i = 0; i < chanMembers.length; i++) {
            countAllChannelPeople++;
            if (roleConditionNotif.some(el => chanMembers[i]._roles.includes(el))) {
                countMembreAndAmi++; // console.log(`${chanMembers[i].user.id} ${chanMembers[i].user.username} possède un role adéquat pour la mission`);
                memberRoleAllowedFromChannel.push(chanMembers[i].user.id);
                if (chanMembers[i]._roles.find(oRole => oRole === roleConditionNotif[0])) {
                    memberToMentionWithNotif.push(chanMembers[i].user.id);
                } else if (chanMembers[i]._roles.find(oRole => oRole === roleConditionNotif[1])) {
                    memberToMentionWithoutNotif.push(chanMembers[i].user.id);
                }
            } else {
                countRejected++; //console.log(`${chanMembers[i].user.id} ${chanMembers[i].user.username} n'a pas de role adéquat pour la mission`);
            }
        }
        // console.log(`All: ${countAllChannelPeople} - Membre or Ami: ${countMembreAndAmi} (Membre: ${countMembreRCC} - Ami: ${memberToMentionWithoutNotif.lenght}) - Rejected: ${countRejected}`);

        // check messages a first time and list users ID that sent a message in channel without duplicate ID
        chanMessages.forEach((message) => {
            if ((memberRoleAllowedFromChannel.includes(message.author.id)) && (manifestedMemberId.indexOf(message.author.id) === -1)) {
                manifestedMemberId.push(message.author.id);
                strManifestedAlready = strManifestedAlready + `${message.author.username} - `;
                console.log(`${message.author.username} signalé `);
                if (memberToMentionWithNotif.includes(message.author.id)) {
                    countMembreRCCPresent++;
                }
            }
        });

        // check messages a second time after collecting user ID on messages and list users ID not in manifestedMemberId (no duplicate ID)
        memberRoleAllowedFromChannel.forEach((oMemberId) => {
            if ((manifestedMemberId.indexOf(oMemberId) === -1) && (unmanifestedMemberId.indexOf(oMemberId) === -1)) {
                unmanifestedMemberId.push(oMemberId);
                console.log(`${oMemberId} non encore manifesté `);
                if (memberToMentionWithNotif.includes(oMemberId)) {
                    strUnmanifestedNotif = `<@${oMemberId}> ` + strUnmanifestedNotif;
                    // strUnmanifestedNotif = `${oMemberId} ` + strUnmanifestedNotif;
                } //else if (memberToMentionWithoutNotif.includes(oMemberId)) {
                // strUnmanifested = `${oMemberId} ` + strUnmanifested;
                // find(element => element > 10);
                // }
            }
        });
        console.log(`Effectif max potentiel: x/${memberRoleAllowedFromChannel.length} manifestés`);
        message.channel.send(`Merci d'indiquer votre présence/absence et de choisir un slot ${strUnmanifestedNotif}sinon: :gulag: `);
        message.channel.send(`(${countMembreRCCPresent}/${memberToMentionWithNotif.length}) ${strManifestedAlready} l'ont déjà fait :ok_hand:`);

        await wait(2000);
        message.delete();
    } else if ((command === 'new-mission') && (checkAdminOrModo(chanMembers))) {
        message.delete();
        message.channel.send(`
Journée JJ/MM/21 - 16H30 -> mission "__Nom__" par "[1er R.C.C] Nom" | Modset:**MODSET** | x/26 joueurs
Topic: lien topic a venir\n
__**Groupe de combat n°1**  (0/8)__
Slot temporaire: 
Slot temporaire: 
Slot temporaire: 
Slot temporaire: 
Slot temporaire: 
Slot temporaire: 
Slot temporaire: 
Slot temporaire: \n
<@&652144621023002637> et <@&652143998252744724>
Pensez à vous inscrire et à manifester votre présence / Absence pour aider les GM merci.
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
_Absent: _\n`);

    } else if ((command === 'say') && (checkAdminOrModo(chanMembers))) {
        message.delete();
        message.channel.send(argText);
    } else if ((command === 'count-unmanifested') && (checkAdminOrModo(chanMembers))) {
        message.delete();
        message.channel.send(argText);
    } else if ((command === 'clear-for-presence') && (checkAdminOrModo(chanMembers))) {
        let [nMsgToRm] = args; // es5: let age = args[0]; es6: let [nMsgToRm, arg2, arg3] = args;
        if ((args.length !== 0) && (args[0] < 101)) {
            await message.channel.bulkDelete(`${nMsgToRm}`)
                .then(messages => console.log(`Bulk deleted ${messages.size} messages`))
                .catch(console.error);
            await wait(2000);
            message.delete();
        } else {
            console.log("La commande !clear-for-presence doit avoir un nombre (max 100) en paramètre.")
            await message.channel.send({
                content: 'La commande !clear-for-presence doit avoir un nombre inférieur ou égal à 100 en paramètre. Ex: "!clear-for-presence 100',
                ephemeral: false
            });
            await wait(2000);
            message.delete();
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const {commandName} = interaction;
/*
    if (commandName === 'say') {
        // const string = interaction.options.getString('message');
        // const chan = interaction.options.getChannel('salon');
    } else if (commandName === 'presence') {
        const guild = await client.guilds.cache.get('631191166934581249');
        // const chan = await guild.channels.fetch('902659520214466560'); // to test a specify channel
        const chan = interaction.options.getChannel('salon-mission');
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
        let countAllChannelPeople = 0;
        let countMembreAndAmi = 0;
        let countMembreRCCPresent = 0;
        let countRejected = 0;

        // console.log(interaction);
        function checkAdminOrModo(pChanMembers) {
            const cmdLaunchedById = interaction.user.id;
            const cmdMember = pChanMembers.find(element => element.user.id === cmdLaunchedById);
            if ((cmdLaunchedById === "134729717550022656") || (roleAdmin.some(elRole => cmdMember._roles.includes(elRole)))) {
                console.log(cmdMember.user.username + " est du staff, modo ou test cmd.")
                return true;
            } else {
                console.log(cmdMember.user.username + "n'a pas les droits pour cette commande, exit.\n=======================================================================================================\n")
                return false;
            }
        }
        console.log("=======================================================================================================\nCommande de présence lancé par :" + interaction.user.username);
        if (checkAdminOrModo(chanMembers)) {
            for (let i = 0; i < chanMembers.length; i++) {
                countAllChannelPeople++;
                if (roleConditionNotif.some(el => chanMembers[i]._roles.includes(el))) {
                    countMembreAndAmi ++; // console.log(`${chanMembers[i].user.id} ${chanMembers[i].user.username} possède un role adéquat pour la mission`);
                    memberRoleAllowedFromChannel.push(chanMembers[i].user.id);
                    if (chanMembers[i]._roles.find(oRole => oRole === roleConditionNotif[0])) {
                        memberToMentionWithNotif.push(chanMembers[i].user.id);
                    } else if (chanMembers[i]._roles.find(oRole => oRole === roleConditionNotif[1])) {
                        memberToMentionWithoutNotif.push(chanMembers[i].user.id);
                    }
                } else {
                    countRejected++; //console.log(`${chanMembers[i].user.id} ${chanMembers[i].user.username} n'a pas de role adéquat pour la mission`);
                }
            }
            console.log(`All: ${countAllChannelPeople} - Membre or Ami: ${countMembreAndAmi} - Ami: ${memberToMentionWithoutNotif.lenght}) - Rejected: ${countRejected}`);

            // check messages a first time and list users ID that sent a message in channel without duplicate ID
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

            // check messages a second time after collecting user ID on messages and list users ID not in manifestedMemberId (no duplicate ID)
            memberRoleAllowedFromChannel.forEach((oMemberId) => {
                if ((manifestedMemberId.indexOf(oMemberId) === -1) && (unmanifestedMemberId.indexOf(oMemberId) === -1)) {
                    unmanifestedMemberId.push(oMemberId);
                    console.log(`${oMemberId} non encore manifesté `);
                    if (memberToMentionWithNotif.includes(oMemberId)) {
                        strUnmanifestedNotif = `<@${oMemberId}> ` + strUnmanifestedNotif;
                    } /*else if (memberToMentionWithoutNotif.includes(oMemberId)) {
                        // strUnmanifested = `${oMemberId} ` + strUnmanifested;
                        // find(element => element > 10);
                    }
                }
            });
            console.log(`Effectif max potentiel: x/${memberRoleAllowedFromChannel.length} manifestés`);
            // interaction.reply(`Merci d'indiquer votre présence/absence et de choisir un slot ${strUnmanifestedNotif} !`);
            // interaction.reply(`(${countMembreRCCPresent}/${memberToMentionWithNotif.length}) ${strManifestedAlready} l'ont déjà fait :ok_hand:`);

            await wait(2000);
            // message.delete();
        }
    // } else if (commandName === 'count-members') {
    } else*/ if (commandName === 'test') {
        await interaction.reply({content: 'Commandes de test envoyée... ', ephemeral: true});
        interaction.channel.send('Hello there... :hello: ');
    }
});

client.login(process.env.BOT_TOKEN); // client.login(token);
