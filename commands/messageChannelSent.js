
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