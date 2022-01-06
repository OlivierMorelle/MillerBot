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

    /*test values*/
    // const guild = await client.guilds.cache.get('238725589379317761'); // guild test
    // const roleConditionNotif = ["274990592856162305", "238728154380763136"]; // test voyageur 274990592856162305 / couillon 238728154380763136
    // const chan = await guild.channels.fetch('904052206435700806'); // to test a specify channel

    /*prod values*/
    const guild = await client.guilds.cache.get('631191166934581249'); // guild RCC
    const roleConditionNotif = ["652144621023002637", "652143998252744724"];

    let chan = await message.channel;
    const chanMessages = await chan.messages.fetch();
    const chanMembers = await chan.members.map(oMembre => oMembre);
    const roleAdmin = ["631235492763009054", "652145728910524436"];
    const memberRoleAllowedFromChannel = [];
    const memberToMentionWithNotif = []; // effectif Membre RCC selon [0]
    const memberToMentionWithoutNotif = []; // effectif Amis RCC selon [1] but to notified from now (staff request)
    const rejectedMemberRoles = []; // not having adequate roles
    const manifestedMemberId = [];
    const unmanifestedMemberId = [];
    let strManifestedAlready = '';
    let strUnmanifestedNotif = '';
    let strUnmanifestedAmi = '';
    let strUnmanifestedRecap = '';
    let strUnmanifestedAmiRecap = '';
    let strManifestedMembreAlready = '';
    let strManifestedAmiAlready = '';
    let countAllChannelPeople = 0;
    let countMembreAndAmi = 0;
    let countMembreRCCPresent = 0;
    let countMembreAmiPresent = 0;
    let countRejected = 0;
    let recap = false;
    const mapMembersManifested = new Map();


    function checkAdminOrModo(argMembers) {
        const cmdLaunchedById = message.author.id;
        const cmdMember = argMembers.find(element => element.user.id === cmdLaunchedById);
        if ((cmdLaunchedById === "134729717550022656") || (roleAdmin.some(elRole => cmdMember._roles.includes(elRole)))) {
            console.log(cmdMember.user.username + " est dev, modo ou admin a exécuté une commande.")
            return true;
        } else {
            console.log(cmdMember.user.username + "n'a pas les droits pour cette commande, exit.\n=======================================================================================================\n")
            return false;
        }
    }

    /**
     * Check if there is a specific RCC nickname
     * @param memberToCheck
     * @returns {string}
     */
    function checkNickname(memberToCheck) {
        let tmpName;
        let tmpNick = memberToCheck.nickname;
        ((tmpNick === null) || (tmpNick === undefined)) ? tmpName = memberToCheck.user.username : tmpName = tmpNick;
        console.log(`Fonction checkNickname return: ${tmpName}`);
        return tmpName;
    }

    /*
    * Sort Membres by Roles
    * values:: ?.??
     */
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
                    strManifestedAlready = strManifestedAlready + `${countList}. **${tName}**: "_${oMessage.content}_"\n`;
                }
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



    /** Sort players by Roles **
     *
     * @param argChanMembers
     * countAllChannelPeople        // number
     * countMembreAndAmi            // number
     * memberRoleAllowedFromChannel // Array IDs Membre + Ami
     * memberToMentionWithNotif     // Array IDs Membre only
     * memberToMentionWithoutNotif  // Array IDs Amis only
     * rejectedMemberRoles          // Array usernames (bot mostly)
     */
    function tSortingMembersByRole(argChanMembers){
        for (let i = 0; i < argChanMembers.length; i++) {
            countAllChannelPeople++;
            if (roleConditionNotif.some(el => argChanMembers[i]._roles.includes(el))) {
                countMembreAndAmi++; // console.log(`${argChanMembers[i].user.id} ${argChanMembers[i].user.username} possède un role adéquat pour la mission`);
                memberRoleAllowedFromChannel.push(argChanMembers[i].user.id);
                if (argChanMembers[i]._roles.find(oRole => oRole === roleConditionNotif[0])) {
                    memberToMentionWithNotif.push(argChanMembers[i].user.id); // membres RCC
                } else if (argChanMembers[i]._roles.find(oRole => oRole === roleConditionNotif[1])) {
                    memberToMentionWithoutNotif.push(argChanMembers[i].user.id); // amis RCC
                }
            } else {
                rejectedMemberRoles.push(argChanMembers[i].user.username);
                countRejected++; //console.log(`${argChanMembers[i].user.id} ${argChanMembers[i].user.username} n'a pas de role adéquat pour la mission, mostly bot`);
            }
        }
        console.log(`${countAllChannelPeople} Discord user in the channel.\n${countMembreAndAmi} Membre or Ami (Membre: ${memberToMentionWithNotif.length} - Ami: ${memberToMentionWithoutNotif.length})\n${countRejected} rejected: ${rejectedMemberRoles} `);
        return memberRoleAllowedFromChannel;
    }

    /** List manifested players **
     *
     * @param argChanMessages // message for code processing
     * @param recap // recap mode if
     * manifestedMemberId // array manifestedMemberId (Membre + Ami)
     */
    function tlistManifestedMembers(argChanMessages, recap) {
        let tmpMemberId; // index : channel messages author looped
        let countList = 0;

        argChanMessages.forEach((oMessage) => {
            if ((memberRoleAllowedFromChannel.includes(oMessage.author.id)) && (manifestedMemberId.indexOf(oMessage.author.id) === -1)) {
                manifestedMemberId.push(oMessage.author.id);
                //console.log(manifestedMemberId);

                tmpMemberId = oMessage.author.id;
                checkNick = oMessage.member.nickname;
                tName = checkNickname(oMessage.member);
                // mapMembersManifested.set(tmpNick, oMessage.content);

                // count members only
                if (memberToMentionWithNotif.includes(tmpMemberId)) {
                    countMembreRCCPresent++;
                    if (recap === true) {
                        strManifestedMembreAlready = strManifestedMembreAlready + `${countMembreRCCPresent}. **${tName}**: "_${oMessage.content}_"\n`;
                    }
                } else if (memberToMentionWithoutNotif.includes(tmpMemberId)) {
                    countMembreAmiPresent++;
                    if (recap === true) {
                        strManifestedAmiAlready = strManifestedAmiAlready + `${countMembreAmiPresent}. **${tName}**: "_${oMessage.content}_"\n`;
                    }
                }

                // string building
                if (recap !== true) {
                    strManifestedAlready = strManifestedAlready + `${tName} - `;
                } else /*if (message.author.id !== oMessage.author.id)*/ {
                    // Nicknames for recap (not any notifications so no ID interpretation by Discord)
                    countList++;
                    strManifestedAlready = strManifestedAlready + `${countList}. **${tName}**: "_${oMessage.content}_"\n`;
                }
            }
        });
        return manifestedMemberId;
    }

    /** List Unmanifested players **
     *
     * @param aMemberAllowed
     * @param manifestedPlayersId
     * @param unmanifestedMemberId
     * @param recap
     * @returns {Promise<void>}
     */
    async function tlistUnmanifestedChannelPlayers(aMemberAllowed, manifestedPlayersId, unmanifestedMemberId, recap) {
        let countList = 0;
        let countListAmi = 0;

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
                }
                if (memberToMentionWithoutNotif.includes(oMemberId)) {
                    if (recap !== true) {
                        strUnmanifestedAmi = `<@${oMemberId}> ` + strUnmanifestedAmi;
                        // strUnmanifestedAmi = `${oMemberId} ` + strUnmanifestedAmi;
                    } else {
                        countListAmi++;
                        toCheck = await guild.members.fetch(oMemberId);
                        strUnmanifestedAmiRecap = strUnmanifestedAmiRecap + `${countListAmi}. **${(checkNickname(toCheck))}**\n`;
                    }
                }
            }
        }
    }

    if ((command === 'presence') && (checkAdminOrModo(chanMembers))) {
        // sort members by roles
        returnedRoles = tSortingMembersByRole(chanMembers);

        // process each message in channel, get manifestedMemberId (Membre + ami)
        returnedManifestedPlayersID = tlistManifestedMembers(chanMessages);

        // list result
        await tlistUnmanifestedChannelPlayers(returnedRoles, returnedManifestedPlayersID, unmanifestedMemberId, recap)

        // send message result
        message.channel.send(`Merci d'indiquer votre **présence/absence** et de choisir un **slot** ${strUnmanifestedNotif} ${strUnmanifestedAmi}`);
        message.channel.send(`(${countMembreRCCPresent}/${memberToMentionWithNotif.length}) membres RCC et (${countMembreAmiPresent}/${memberToMentionWithoutNotif.length}) amis RCC ${strManifestedAlready} l'ont déjà fait :ok_hand:`);

        await wait(2000);
        message.delete();
    } else if ((command === 'recap') && (checkAdminOrModo(chanMembers))) {
        console.log("=======================================================================================================\nCommande de récap lancé par: " + message.author.tag);
        recap = true;
        // sort members by roles
        returnedRoles = tSortingMembersByRole(chanMembers);

        // process each message in channel, get manifestedMemberId (Membre + ami)
        returnedManifestedPlayersID = tlistManifestedMembers(chanMessages, recap);

        // list result
        await tlistUnmanifestedChannelPlayers(returnedRoles, returnedManifestedPlayersID, unmanifestedMemberId, recap)

        message.channel.send(`__(${countMembreRCCPresent}/${memberToMentionWithNotif.length}) membres qui se sont manifestés:__ \n ${strManifestedMembreAlready}\n __(${countMembreAmiPresent}/${memberToMentionWithoutNotif.length}) Amis:__ \n ${strManifestedAmiAlready} \n ▬▬▬▬▬▬▬▬▬▬▬`);
        message.channel.send(`__Ne se sont pas manifestés:__ \n ${strUnmanifestedRecap} \n ${strUnmanifestedAmiRecap}`);

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
