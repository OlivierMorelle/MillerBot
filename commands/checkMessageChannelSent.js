const guild = await client.guilds.cache.get('631191166934581249');
const chan = await guild.channels.fetch('902659520214466560');
const chanMessages = await chan.messages.fetch();
const chanMembers = await chan.members.map(oMembre=>oMembre);
const roleCondition = ["652144621023002637", "652143998252744724"];
const memberRoleAllowedFromChannel = [];
const manifestedMemberId = [];
const unmanifestedMemberId = [];
let strManifestedAlready = '';
let strUnmanifested = '';
let countAllDiscordPeople = 0;
let countMembreAndAmi = 0;
let countMembreRCC = 0;
let countAmiRCC = 0;
let countRejected = 0;

chanMembers.forEach((oMember) => {
    countAllDiscordPeople++;
    if (roleCondition.some(el => oMember._roles.includes(el))) {
        countMembreAndAmi ++; // console.log(`${oMember.user.id} ${oMember.user.username} possède un role adéquat pour la mission`);
        memberRoleAllowedFromChannel.push(oMember.user.id);
        if (oMember._roles.find(oRole => oRole === roleCondition[0])) {
            countMembreRCC++;
        } else if (oMember._roles.find(oRole => oRole === roleCondition[1])) {
            countAmiRCC++;
        }
    } else {
        countRejected++; //console.log(`${oMember.user.id} ${oMember.user.username} n'a pas de role adéquat pour la mission`);
    }
});
// console.log(`All: ${countAllDiscordPeople} - Membre or Ami: ${countMembreAndAmi} (Membre: ${countMembreRCC} - Ami: ${countAmiRCC}) - Rejected: ${countRejected}`);

// check messages a first time
// listes des utilisateurs (ID) ayant posté au moins un message (no duplicate ID)
chanMessages.forEach((message) => {
    if ((memberRoleAllowedFromChannel.includes(message.author.id)) && (manifestedMemberId.indexOf(message.author.id) === -1)) {
        manifestedMemberId.push(message.author.id);
        strManifestedAlready = strManifestedAlready + `${message.author.username} `;
        console.log(`${message.author.username} Signalé `);
    }
});

// check messages a second time after collecting user ID on messages
// listes des utilisateurs (ID) n'ayant posté aucun messages (no duplicate ID)
memberRoleAllowedFromChannel.forEach((oMemberId) => {
    if ((manifestedMemberId.indexOf(oMemberId) === -1) && (unmanifestedMemberId.indexOf(oMemberId) === -1)) {
        unmanifestedMemberId.push(oMemberId);
        console.log(`${oMemberId} non encore manifesté `);
        strUnmanifested = `<@${oMemberId}> ` + strUnmanifested;
    }
});
console.log(`$ effectif max potentiel \n ${manifestedMemberId.length}/${memberRoleAllowedFromChannel.length} manifestés`);
message.channel.send(`Merci d'indiquer votre présence/absence et de choisir un slot ${strUnmanifested} ! \nMerci à ${strManifestedAlready} pour l'avoir déjà fait (${manifestedMemberId.length}/${memberRoleAllowedFromChannel.length}) :ok_hand:`);
await wait(2000);
message.delete();