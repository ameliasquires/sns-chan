const { ActivityType, ButtonBuilder, ButtonStyle, ActionRowBuilder} = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const fs = require('fs')
const path = require("path");
let db = require("../src/db")
let settings = require("../src/settings")
let config_loc = __filename+".json"
module.exports = {
    name : "dm",
    config_loc : config_loc,
    async main (client,Discord,message){
        if(message==null||message.author.bot)return;
        let config = JSON.parse(fs.readFileSync(config_loc))
        //start tickets
        let date = new Date().toLocaleString()
        let tickets = await db.Tickets.findAll({where:{status:'open',author:message.author.id}})
        let matt = Array.from(message.attachments, ([name, value]) => ({ name, value }))
        let smatt = []
        for(let att of matt){
            smatt.push({attachment:att.value.url})
        }
        if(tickets.length==0){
            let nticket = this.generate_id()
            const embed = new EmbedBuilder()
                .setTitle("New Ticket | "+nticket)
                .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL()})
                .setColor(settings.defaultColor)
                .setDescription("Message: "+message.content)
                .setFooter({text:"Created by: "+message.author.id+" | Created: "+date})
            
            const confirm = new ButtonBuilder()
                .setCustomId('confirm')
                .setLabel('Confirm')
                .setStyle(ButtonStyle.Primary);
            const row = new ActionRowBuilder()
                .addComponents(confirm);
            
            let mess = await message.channel.send({embeds:[embed],components:[row],files:smatt});
            
            const collectorFilter = i => true;

            try {
	            const confirmation = await mess.awaitMessageComponent({ filter: collectorFilter, time: 60000000 });
                if(confirmation.customId == "confirm"){

                    let nt = await db.Tickets.create({
                        ticket:nticket,
                        message: message.content,
                        attachments: JSON.stringify(matt),
                        status: "open",
                        author: message.author.id,
                        name: message.author.tag,
                        created: date,
                        messages: JSON.stringify([]),
                        pfp: message.author.displayAvatarURL()
                    })

                    const aembed = new EmbedBuilder()
                        .setTitle("New Ticket | "+nticket)
                        .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL()})
                        .setColor(settings.defaultColor)
                        .setDescription("Message: '"+message.content+"'\n\nUse `/ticket` or `sns ticket reply "+nticket+" {message}`")
                        .setFooter({text:"Created by: "+message.author.id+" | Created: "+date})

                    global.channels["admin-chan"].send({embeds:[aembed],files:smatt})
                    confirmation.deferUpdate()
                }
            } catch (e) {
                const confirm_timeout = new ButtonBuilder()
                    .setCustomId('confirm')
                    .setLabel('Confirm')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true);
                const row_timeout = new ActionRowBuilder()
                    .addComponents(confirm_timeout);
	            await mess.edit({ components: [row_timeout] });
            }
        } else {
            let ticket = tickets[0]
            let messages = JSON.parse(ticket.messages)
            messages.push({message:message.content,attachments:matt})
            db.Tickets.update({'messages':JSON.stringify(messages)},{where:{id:ticket.id}})
            const aembed = new EmbedBuilder()
                .setTitle("Updated Ticket | "+ticket.ticket)
                .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL()})
                .setColor(settings.defaultColor)
                .setDescription("Message: '"+message.content+"'\n\nReply with `sns ticket reply "+ticket.ticket+" {message}`")
                .setFooter({text:"Created by: "+message.author.id+" | Created: "+date})

            global.channels["admin-chan"].send({embeds:[aembed],files:smatt})
        }
        //done w/ tickets
    },
    generate_id(){
        let config = JSON.parse(fs.readFileSync(config_loc))
        var ticket = "";
        var characters = config["ticket-id-chars"].value;
        for (var i = 0; i < config["ticket-id-length"].value; i++) {
            ticket += characters.charAt(Math.floor(Math.random() * characters.length));
            if (i == config["ticket-id-split"].value) ticket += "-";
        }
        return ticket
    }
}