const { ActivityType , PermissionsBitField} = require("discord.js");
const fs = require('fs')
const path = require("path");
const { EmbedBuilder } = require("discord.js");
let db = require("../src/db")
let settings = require("../src/settings")
let message_update = require("./member-update")
let config_loc = __filename+".json"
module.exports = {
    name : "guildMemberAdd",
    config_loc : config_loc,
    async main (client,Discord){
        client.on("guildMemberAdd",(m)=>{
            //global.channels.general.send("Welcome to the server <@"+m.id+">!")
            if(global.notif == null)
                global.notif = {}
            if(global.notif.voted == null)
            global.notif.joined = global.notif.voted = []

            global.notif.joined.push(m.id)

            message_update.build_message(m.id, "joined")
       })

    },
}