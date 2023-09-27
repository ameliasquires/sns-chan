const { ActivityType , PermissionsBitField} = require("discord.js");
const fs = require('fs')
const path = require("path");
const { EmbedBuilder } = require("discord.js");
let db = require("../src/db")
let settings = require("../src/settings")
let config_loc = __filename+".json"
module.exports = {
    name : "messageReactionRemove",
    config_loc : config_loc,
    async main (client,Discord){
        client.on("messageReactionRemoveEmoji",(m)=>{
            global.channels.logging.send({embeds:[new EmbedBuilder().setTitle("Emoji removed").setDescription((m.count??1)+" "+m.emoji.name+"(s) have been removed from "+m.message.url).setTimestamp(Date.now()).setColor(settings.defaultColor)]})
       })
       client.on("messageReactionRemoveAll",(m)=>{
            global.channels.logging.send({embeds:[new EmbedBuilder().setTitle("Bulk emoji remove").setDescription("All emojis have been removed from "+m.url).setTimestamp(Date.now()).setColor(settings.defaultColor)]})
   })

    },
}