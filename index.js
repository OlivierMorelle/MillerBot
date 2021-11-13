const {Client, Intents} = require('discord.js');
const client = new Client({intents: [Intents.FLAGS.GUILDS, "GUILDS", "GUILD_MESSAGES", "GUILD_PRESENCES", "GUILD_MEMBERS", "DIRECT_MESSAGES"]});
require("dotenv").config(); // const { token } = require('./auth.json');

// var winston = require('./config/winston');
/*
const winston = require('winston');
const logConfiguration = {
    'transports': [
        new winston.transports.File({
            filename: 'logs/example.log'
        })
    ]
};
const logger = winston.createLogger(logConfiguration);
logger.log({
    message: 'Hello, Winston!',
    level: 'info'
});
logger.info('Hello, Winston!');
*/

client.once('ready', () => console.log('Ready!'));

const wait = require('util').promisify(setTimeout);

client.on('messageCreate', async message => {
    const prefix = "!";
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const argText = message.content.slice(5);

    // const guild = await client.guilds.cache.get('631191166934581249'); // guild RCC
    const guild = await client.guilds.cache.get('238725589379317761'); // guild test
    // const chan = await guild.channels.fetch('904052206435700806'); // to test a specify channel
    let chan = await message.channel;
    const chanMessages = await chan.messages.fetch();
    const chanMembers = await chan.members.map(oMembre => oMembre);
    // const roleConditionNotif = ["652144621023002637", "652143998252744724"];
    const roleConditionNotif = ["274990592856162305", "238728154380763136"]; // test voyageur 274990592856162305 / couillon 238728154380763136
    const roleAdmin = ["631235492763009054", "652145728910524436"];
    const memberRoleAllowedFromChannel = [];
    const memberToMentionWithNotif = []; // effectif Membre RCC selon [0]
    const memberToMentionWithoutNotif = []; // effectif Amis RCC selon [1]
    const manifestedMemberId = [];
    const unmanifestedMemberId = [];
    let strManifestedAlready = '';
    let strUnmanifestedNotif = '';
    let strUnmanifestedRecap = '';
    let countAllChannelPeople = 0;
    let countMembreAndAmi = 0;
    let countMembreRCCPresent = 0;
    let countRejected = 0;
    let recap = false;
    const mapMembersManifested = new Map();


    function checkAdminOrModo(argMembers) {
        const cmdLaunchedById = message.author.id;
        const cmdMember = argMembers.find(element => element.user.id === cmdLaunchedById);
        if ((cmdLaunchedById === "134729717550022656") || (roleAdmin.some(elRole => cmdMember._roles.includes(elRole)))) {
            console.log(cmdMember.user.username + " est du staff, modo ou test cmd, a exécuté une commande.")
            return true;
        } else {
            console.log(cmdMember.user.username + "n'a pas les droits pour cette commande, exit.\n=======================================================================================================\n")
            return false;
        }
    }
    function checkNickname(memberToCheck) {
        let tmpName;
        let tmpNick = memberToCheck.nickname;
        ((tmpNick === null) || (tmpNick === undefined)) ? tmpName = memberToCheck.user.username : tmpName = tmpNick;
        console.log(`Fonction checkNickname return: ${tmpName}`);
        return tmpName;
    }

        function sortMembers(argChanMembers){
        for (let i = 0; i < argChanMembers.length; i++) {
            countAllChannelPeople++;
            if (roleConditionNotif.some(el => argChanMembers[i]._roles.includes(el))) {
                countMembreAndAmi++; // console.log(`${argChanMembers[i].user.id} ${argChanMembers[i].user.username} possède un role adéquat pour la mission`);
                memberRoleAllowedFromChannel.push(argChanMembers[i].user.id);
                if (argChanMembers[i]._roles.find(oRole => oRole === roleConditionNotif[0])) {
                    memberToMentionWithNotif.push(argChanMembers[i].user.id);
                } else if (argChanMembers[i]._roles.find(oRole => oRole === roleConditionNotif[1])) {
                    memberToMentionWithoutNotif.push(argChanMembers[i].user.id);
                }
            } else {
                countRejected++; //console.log(`${argChanMembers[i].user.id} ${argChanMembers[i].user.username} n'a pas de role adéquat pour la mission`);
            }
        }
        console.log(`All: ${countAllChannelPeople} - Membre or Ami: ${countMembreAndAmi} (Membre: ${memberToMentionWithNotif.length} - Ami: ${memberToMentionWithoutNotif.length}) - Rejected: ${countRejected}`);
    }

    function listMembersChannelMessagesOnce(argChanMessages, recap) {
        let tmpMemberId;
        let countList = 0;
        let strShortened;
        argChanMessages.forEach((oMessage) => {
            if ((memberRoleAllowedFromChannel.includes(oMessage.author.id)) && (manifestedMemberId.indexOf(oMessage.author.id) === -1)) {
                tmpMemberId = oMessage.author.id;
                checkNick = oMessage.member.nickname;
                manifestedMemberId.push(oMessage.author.id);
                tName = checkNickname(oMessage.member);
                // mapMembersManifested.set(tmpNick, oMessage.content);

                // string construction
                if (recap !== true) {
                    strManifestedAlready = strManifestedAlready + `${tName} - `;
                } else if (message.author.id !== oMessage.author.id) {
                    countList++;
                    if (oMessage.content.length > 18) {
                        strShortened = oMessage.content.slice(0, 18);
                        strManifestedAlready = strManifestedAlready + `${countList}. **${tName}**: "_${strShortened}_"\n`;
                    } else {
                        strManifestedAlready = strManifestedAlready + `${countList}. **${tName}**: "_${oMessage.content}_"\n`;
                    }
                }
                // else if (message.author.id === oMessage.author.id) {
                //     countList++;
                //     strManifestedAlready = strManifestedAlready + `${countList}. **${tName}**: "_Message de commande Miller_"\n`;
                // }
                if (memberToMentionWithNotif.includes(tmpMemberId)) {
                    countMembreRCCPresent++;
                }
            }
        });
    }

    async function listNotAlreadyListedMembersChannel(aMemberAllowed, unmanifestedMemberId, recap) {
        let tmpMember;
        let countList = 0;

        for (const oMemberId of aMemberAllowed) {
            if ((manifestedMemberId.indexOf(oMemberId) === -1) && (unmanifestedMemberId.indexOf(oMemberId) === -1)) {
                unmanifestedMemberId.push(oMemberId);
                console.log(`${oMemberId} non encore manifesté. `);
                if (memberToMentionWithNotif.includes(oMemberId)) {
                    if (recap !== true) {
                        strUnmanifestedNotif = `<@${oMemberId}> ` + strUnmanifestedNotif;
                        // strUnmanifestedNotif = `${oMemberId} ` + strUnmanifestedNotif;
                    } else {
                        countList++;
                        toCheck = await guild.members.fetch(oMemberId);
                        strUnmanifestedRecap = strUnmanifestedRecap + `${countList}. **${(checkNickname(toCheck))}**\n`;
                    }
                } //else if (memberToMentionWithoutNotif.includes(oMemberId)) {
                // strUnmanifested = `${oMemberId} ` + strUnmanifested;
                // find(element => element > 10);
                // }
            }
        }
    }


    if ((command === 'presence') && (checkAdminOrModo(chanMembers))) {
        console.log("=======================================================================================================\nCommande de présence lancé par: " + message.author.tag);
        // sort members by roles
        sortMembers(chanMembers);

        // check messages a first time and list users ID that sent a message in channel without duplicate ID
        listMembersChannelMessagesOnce(chanMessages)

        // check messages a second time after collecting user ID on messages and list users ID not in manifestedMemberId (no duplicate ID)
        await listNotAlreadyListedMembersChannel(memberRoleAllowedFromChannel, unmanifestedMemberId)

        console.log(`Effectif max potentiel: ${memberRoleAllowedFromChannel.length}`);
        message.channel.send(`Merci d'indiquer votre **présence/absence** et de choisir un **slot** ${strUnmanifestedNotif}`);
        message.channel.send(`(${countMembreRCCPresent}/${memberToMentionWithNotif.length}) ${strManifestedAlready} l'ont déjà fait :ok_hand:`);

        await wait(2000);
        message.delete();
    } else if ((command === 'recap') && (checkAdminOrModo(chanMembers))) {
        console.log("=======================================================================================================\nCommande de présence lancé par: " + message.author.tag);
        recap = true;
        sortMembers(chanMembers);

        // check messages a first time and list users ID that sent a message in channel without duplicate ID
        listMembersChannelMessagesOnce(chanMessages, recap)

        // check messages a second time after collecting user ID on messages and list users ID not in manifestedMemberId (no duplicate ID)
        await listNotAlreadyListedMembersChannel(memberRoleAllowedFromChannel, unmanifestedMemberId, recap)

        message.channel.send(`__(${countMembreRCCPresent}/${memberToMentionWithNotif.length}) Se sont manifestés:__ \n ${strManifestedAlready} \n ▬▬▬▬▬▬▬▬▬▬▬`);
        message.channel.send(`__Ne se sont pas manifestés:__ \n ${strUnmanifestedRecap}`);

        await wait(2000);
        message.delete();
    } else if ((command === 'new-mission') && (checkAdminOrModo(chanMembers))) {
        message.delete();
        message.channel.send(`
Journée JJ/MM/21 - 16H30 -> mission "__Nom__" par "[1er R.C.C] Nom" | Modset:** MODSET** | x/26 joueurs
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
Pensez à vous inscrire et à manifester votre présence / absence pour aider les GM merci.
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
_Absent: _\n`);

    } else if ((command === 'say') && (checkAdminOrModo(chanMembers))) {
        message.delete();
        message.channel.send(argText);
    } else if ((command === 'clear-for-presence') && (checkAdminOrModo(chanMembers))) {
        let [nMsgToRm] = args; // es5: let age = args[0]; es6: let [nMsgToRm, arg2, arg3] = args;
        if ((args.length !== 0) && (args[0] < 101)) {
            await wait(2000);
            await message.channel.bulkDelete(`${nMsgToRm}`)
                .then(messages => console.log(`Bulk deleted ${messages.size} messages`))
                .catch(console.error);
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
    if (commandName === 'test') {
        await interaction.reply({content: 'Commandes de test envoyée... ', ephemeral: true});
        interaction.channel.send('Hello there... :hello: ');
    } /*else if (commandName === 'count-presence') {
        console.log("=======================================================================================================\nCommande de présence lancé par: " + message.author.tag);
        sortMembers(chanMembers);

        // check messages a first time and list users ID that sent a message in channel without duplicate ID
        listMembersChannelMessagesOnce(chanMessages)

        // check messages a second time after collecting user ID on messages and list users ID not in manifestedMemberId (no duplicate ID)
        listNotAlreadyListedMembersChannel(memberRoleAllowedFromChannel, unmanifestedMemberId)

        console.log(`Effectif max potentiel: ${memberRoleAllowedFromChannel.length}`);
        // message.channel.send(` ${strUnmanifestedNotif} `);
        // message.channel.send(`(${countMembreRCCPresent}/${memberToMentionWithNotif.length}) ${strManifestedAlready} l'ont déjà fait :ok_hand:`);

        await interaction.reply({content: ` ${strUnmanifestedNotif} `, ephemeral: true});
    }*/
});

client.login(process.env.BOT_TOKEN); // client.login(token);
