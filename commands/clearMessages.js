if (command === 'clear-for-presence') {
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