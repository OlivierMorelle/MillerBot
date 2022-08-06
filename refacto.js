//import Guy from './Guy.js';

require("dotenv").config(); //to start process from .env file
const {Client, Intents}=require("discord.js");
const fs = require('fs');

const client = new Client({intents: [Intents.FLAGS.GUILDS, "GUILDS", "GUILD_MESSAGES", "GUILD_PRESENCES", "GUILD_MEMBERS", "DIRECT_MESSAGES"]});

client.once("ready", () => {
    console.log("BOT IS ONLINE");
})  



client.on('messageCreate', async message => {

    ///// PRE INITIALISATION \\\\\
    const prefix = "!";
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const argText = message.content.slice(5);

    const guild = await client.guilds.cache.get('238725589379317761'); // guild test
    const aRoleCondition = ["274990592856162305", "238728154380763136"]; // test voyageur 274990592856162305 / couillon 238728154380763136
    const aRoleException = ["666"]; // exception de ping sur ce role

    let chan = await message.channel; // default channel is current channel | get option selector TODO
    const allGuildMembers = await guild.members.fetch();
    const chanGuildUsers = await chan.members.map(oMembre => oMembre.user); // retourne User information independent of Guilds  (no _roles)
    const chanMessages = await chan.messages.fetch(); 

    const date = new Date();
    const timestamp = date.toGMTString();
    let myGuys = []; // collectedMembers Members from messages. //


    
    ///// METHODS | FUNCTIONS \\\\\

    /**
     * Guy classe and constructor
     */
    class Guy {
        constructor (id, nickname, roles, isRccMember, hasCredential, hasException) {
            this.id = id;
            this.nickname = nickname;
            this.roles = roles;
            this.isRccMember = isRccMember;
            this.hasCredential = hasCredential;
            this.hasException = hasException;
        }
    }

    /**
     * Dump json function
     * @param {*} jsonData 
     */
    function saveGuy(jsonData) {
        fs.writeFile("Data/Guys.json", jsonData, function(err, result) {
            if (err) {
                console.log('Error writeFile' . err);
            }
        });
    }

    /**
     * Fetch api
     * @param {*} argUserId 
     * @returns promise
     */
    async function getMember(argUserId) {
        return await guild.members.fetch(argUserId);
    }

    /**
     * Log txt function
     * @param {*} content 
     */
    function logAppendF(content) {
        fs.appendFile( `Logs/logfile.txt`, content, function (err, result) {
            if (err) throw err;
        });
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * check if an array of roles includes a string role
     * @param {*} aRoles
     * @param {*} sortingRole rcc member role by default
     * @returns boolean if a guy has defined role
     */
    function checkRole(aRoles, sortingRole = aRoleCondition[0]) {
        return aRoles.includes(sortingRole);
    }



    /**
     * Get Members from current GuildChannel
     * that are not bots
     * @param argChanGuildUsers GuildChannelManager GuildChannelMembers members of a channel
     * @returns {[]} array of members IDs from a channel
     */
    function membersChannelArray(argChanGuildUsers) {
        let aChannelMembersIds = [];
        
        for (let i = 0; i < argChanGuildUsers.length; i++) {
            if (true) { // TMP test
            // if (argChanGuildUsers[i].bot !== true) { 
                aChannelMembersIds.push(argChanGuildUsers[i].id);
            }
        }

        return aChannelMembersIds;
    }



    /**
     * Get all members from the Guild having conditionnalRole
     * @param allGuildMembers
     * @returns {[]}
     */
    function guildMembersWithAccredArray(argGuildMembers) {
        let aMembersAccredIds = [];
        console.log(argGuildMembers);
        for (var [keyMap, valueMap] of argGuildMembers) {
            if (aRoleCondition.some(el => valueMap._roles.includes(el))) { //&& (argGuildMembers[i].user.bot !== true)
                aMembersAccredIds.push(keyMap);
            }
        }

        return aMembersAccredIds;
    }


    /**
     * @param {*} userId 
     * @param {*} roleCondition 
     * @param {*} roleException 
     * @returns a new Guy
     */
    async function getGuildMember(userId, roleCondition, roleException) {
        let myGuy;
        myGuy = await getMember(userId).then(resolvedMember => {
            let knownName = (resolvedMember.nickname != null ? resolvedMember.nickname : resolvedMember.user.username);
            let isRccMember = checkRole(resolvedMember._roles);

            return new Guy(
                resolvedMember.user.id, // string
                knownName, // string
                resolvedMember._roles, // array
                isRccMember, // boolean
                roleCondition.some(el => resolvedMember._roles.includes(el)), // boolean // If at least one role condition in aRoleCondition is included in a member's roles.
                roleException.some(el => resolvedMember._roles.includes(el)) // boolean
            );
        });

        return myGuy;
    }



    /**
     * Members having posted a message in a specified channel
     * That is not a bot and that is not in array already
     * @param {*} argChanMessages a message
     * @returns array of members IDs from a message
     */
    function manifestedMembersArray(argChanMessages) {
        let aManifestedMembersIds = [];

        argChanMessages.forEach((oMessage) => {
            // if ((oMessage.author.bot !== true) && (aManifestedMembersIds.indexOf(oMessage.author.id) === -1)) {
            if ((true) && (aManifestedMembersIds.indexOf(oMessage.author.id) === -1)) { // TMP test
                aManifestedMembersIds.push(oMessage.author.id);
            }
        });

        return aManifestedMembersIds;
    }



    /**
     * Get members from array of IDs (with extra logs)
     * @param {*} arrIDs 
     * @returns array of objects 
     */
    async function collectGuys(arrIDs) {
        let countAccredited = 0;
        let countExempted = 0;
        let myGuy;
        let nStatus = 0;
        let strError = ' :: Erreur dans le lot des membres filtrés, arrêt du traitement. ';
        let strExcluded = ' :: Ce membre est exempté: ';
        let contentLog = '=======\n' + timestamp;
    
        for (let i = 0; i < arrIDs.length; i++) {

            myGuy = await getGuildMember(arrIDs[i], aRoleCondition, aRoleException).then(resMember => {

                if((resMember.hasCredential === true) && (resMember.hasException !== true)) {
                    countAccredited++;
                    nStatus = 0; // OK
                } else if (resMember.hasException === true) {
                    countExempted++; // unauthorized
                    logAppendF(contentLog += strExcluded + resMember.nickname + "\n");
                    nStatus = 1;
                } else {
                    logAppendF(contentLog = contentLog + strError + 'check this Guy\'s roles: ' + resMember.id + ':' + resMember.nickname);
                    nStatus = -1; // error
                }

                return resMember;
            });

            if(nStatus === -1) { console.log('break for loop'); break; }

            var fIndex = myGuys.findIndex(x => x.id === myGuy.id);
            fIndex === -1 ? myGuys.push(myGuy) : console.error(`object ${myGuy.nickname} already exists `);
        }

        if ((countAccredited + countExempted) !== arrIDs.length) {
            console.error(contentLog + "Décompte de message inégale.");
            return "Retourne un décompte de message inégale. ";
        } else {
            contentLog = `Accredités: ${countAccredited} - exemptés: ${countExempted} \nCumul accredités et exemptés = ${countAccredited + countExempted} <==> ${arrIDs.length} messages | Poursuite du traitement.\n-------\n`;
            logAppendF(contentLog);

            return myGuys;
        }
    }



    /**
     * Mother function using guild.members.fetch("ID") 
     * TODO: Evolution on the entry a, with option if is a recap and not presence command,      * 
     * @param {*} a array of strings with id from member in the channel
     * @param {*} b array of strings with id having posted a message in the channel
     * @returns array of Objects (a - b)
     */
    async function filterManifestedMembers(argA,argB) {
        
        myGuys = await collectGuys(argA);
        let JsonMembers = JSON.stringify(myGuys);
        saveGuy(JsonMembers);

        // isSameUser Get items that only occur in the left array,
        // using the compareFunction to determine equality.
        // A comparer used to determine if two entries are equal. 
        const isSameUser = (argA, argB) => argA === argB;
        const onlyInLeft = (left, right, compareFunction) => 
            left.filter(leftValue =>
                !right.some(rightValue => compareFunction(leftValue, rightValue)));

        const aOnlyInA = onlyInLeft(argA, argB, isSameUser);
        const aOnlyInB = onlyInLeft(argB, argA, isSameUser);

        if (aOnlyInB.length !== 0) {
            console.error(`Error data integrity on manifested IDs: ${aOnlyInB}`);
            return null;
        } else {
            let unmafistedGuys;
            unmafistedGuys = myGuys.filter(element => aOnlyInA.includes(element.id));
            return unmafistedGuys.sort((argA, argB) => { return argB.isRccMember - argA.isRccMember; });
        }
    }


    
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
    ///// POST INITIALISATION \\\\\
    const a = membersChannelArray(chanGuildUsers); // ou membersWithAccredArray(allGuildMembers) // si archive
    const b = manifestedMembersArray(chanMessages);

    ///// COMMANDS \\\\\
    if (command === 'presence') {

        message.delete(); //await wait(2000);
        const aPresenceC = await filterManifestedMembers(a,b);
        const displayUnmanifested = aPresenceC.map(_x => '<@' + _x.id + '>' );

        console.log("\n — Presence command used by TODO : \n");
        logAppendF('Unmanifested IDs: ' + [...displayUnmanifested].join(' - '));
        message.channel.send('Unmanifested IDs: ' + [...displayUnmanifested].join(' '));

    } else if (command === 'recap') {

        message.delete();
        const aAll = guildMembersWithAccredArray(allGuildMembers)
        const aRecapC = await filterManifestedMembers(aAll,b);
        console.log("\n — Recap command used by TODO: \n");
        logAppendF(aRecapC.map((_x, index) => `${index+1}. ${_x.nickname}\n`).join(''));
        message.channel.send(aRecapC.map((_x, index) => `${index+1}. **${_x.nickname}**\n`).join(''));

    } else if ((command === 'say') && (checkAdminOrModo(chanMembers))) {

        message.delete();
        message.channel.send(argText);

    }

});

client.login(process.env.BOT_TOKEN);

    ///// TMP \\\\\

    /* MEMO
    // Fetch a single role
    message.guild.roles.fetch('222078108977594368')
        .then(role => console.log(`The role color is: ${role.color}`))
        .catch(console.error);
    */

    /** DEBUG
    varToJson = JSON.stringify(chanMessages);
    fs.writeFile("chanMessages.json", varToJson, function(err, result) {
        if(err) console.log('error', err);
    /**/