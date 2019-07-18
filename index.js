const Discord = require("./node_modules/discord.js"),
    backup = require("discord-backup"),
    client = new Discord.Client(),
    settings = {
        prefix: "b!",
        token: "token"
    };

client.on("ready", () => {
    console.log(`Eu Startei com o nome: ${client.user.tag}!`);
});

client.on("message", async message => {

    // This reads the first part of your message behind your prefix to see which command you want to use.
    let command = message.content.toLowerCase().slice(settings.prefix.length).split(" ")[0];

    // These are the arguments behind the commands.
    let args = message.content.split(' ').slice(1);

    // If the message does not start with your prefix return.
    // If the user that types a message is a bot account return.
    // If the command comes from DM return.
    if (!message.content.startsWith(settings.prefix) || message.author.bot || !message.guild) return;

    if (command === "create") {
        // Check member permissions
        if (!message.member.hasPermission("ADMINISTRATOR")) {
            return message.channel.send(":x: | You must be an administrator of this server to request a backup!");
        }
        // Create the backup
        let msg = await message.channel.send('Criando backup, aguarde ...')
        backup.create(message.guild).then((backupID) => {
            msg.edit(`backup criado, Use: ${settings.prefix}load ${backupID}`);
        });
    }

    if (command === "load") {
        // Check member permissions
        if (!message.member.hasPermission("ADMINISTRATOR")) {
            return message.channel.send(":x: | You must be an administrator of this server to load a backup!");
        }
        let backupID = args[0];
        if (!backupID) {
            return message.channel.send(":x: | You must specify a valid backup ID!");
        }
        // Fetching the backup to know if it exists
        backup.fetch(backupID).then(async () => {
            // If the backup exists, request for confirmation
            message.channel.send(`:warning: | Para começar a carregar o backup escreva \`\`confirmar\`\`!`);
            await message.channel.awaitMessages(m => (m.author.id === message.author.id) && (m.content === "confirmar"), {
                max: 1,
                time: 20000,
                errors: ["time"]
            }).then(() => {
                message.author.send(`:white_check_mark: | \`\`Começando a carregar o backup!\`\``);
                backup.load(backupID, message.guild).then(() => {
                    message.author.send(`\`\`Backup finalizado\`\``)
                }).catch((err) => {
                    return message.author.send(":x: | Desculpe, um erro ocorreu... por favor check se eu tenho permissões de administrador!");
                });
            }).catch((err) => {
                return message.channel.send(":x: | Tempo acabou, cancelando carregamento do backup!");
            });
        }).catch((err) => {
            return message.channel.send(":x: | Nenhum backup encontrado `" + backupID + "`!");
        });
    }

    if (command === "infos") {
        let backupID = args[0];
        if (!backupID) {
            return message.channel.send(":x: | Você precisa especificar um backup válido!");
        }
        backup.fetch(backupID).then((backupInfos) => {
            let embed = new Discord.Rich()
                .setAuthor("Backup Informations")
                .addField("ID", backupInfos.ID, true)
                // Displays the server from which this backup comes
                .addField("Servidor nome", backupInfos.name, true)
                .addField("Servidor ID", backupInfos.guildID, true)
                // Display the size (in mb) of the backup
                .addField("Tamanho", backupInfos.size, true)
                // Display when the backup was created
                .addField("Criado", timeConverter(backupInfos.createdTimestamp), true)
                .setColor("#FF0000");
            message.channel.send(embed);
        }).catch((err) => {
            // if the backup wasn't found
            return message.channel.send(`:x: | Nenhum backup encontrado para \`\`${backupID}!\`\``);
        });
    }

});

//Your secret token to log the bot in. (never share this to anyone!)
client.login(settings.token);

function timeConverter(t) {
    var a = new Date(t);
    var today = new Date();
    var yesterday = new Date(Date.now() - 86400000);
    var months = ["janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    if (a.setHours(0, 0, 0, 0) == today.setHours(0, 0, 0, 0))
        return "hoje, " + hour + ":" + min;
    else if (a.setHours(0, 0, 0, 0) == yesterday.setHours(0, 0, 0, 0))
        return "ontem, " + hour + ":" + min;
    else if (year == today.getFullYear())
        return date + " " + month + ", " + hour + ":" + min;
    else
        return date + " " + month + " " + year + ", " + hour + ":" + min;
}
