const fs = require('fs')
const path = require("path");
let config_loc = __filename+".json"
const { EmbedBuilder } = require("discord.js");
let settings = require("../../src/settings")

//get config located at ./ping.js.json (edit in ./defaults/ping.js.json, then run sh buildconfig.sh)
let config = JSON.parse(fs.readFileSync(config_loc))
module.exports = {
    //name used in /help command, or command when used in slash commands
    name : "ping",
    //aliases a command can be called by (only used in non-slash commands)
    command: ["ping"],
    mod_only: false,
    //link config
    config:config,
    config_loc:config_loc,

    //main function called when using old commands
    async main (client,Discord,message,args){
        return await this.exec(client,{message:message})
    },

    //slash command w/ options, a slash command wont appear unless a s_main exists
    s_options:[{type:"string",name:"test",desc:"example",required:false,autocomplete:false}],
    async s_main (client,Discord,interaction){
        return await this.exec(client,{message:interaction})
    },

    //common function to be called by both main and s_main (just my preference)
    async exec(client,info){
        let time = Date.now() - info.message.createdTimestamp
        let embed = new EmbedBuilder()
            .setTitle("Pong!")
            .setDescription(time + "ms")
            .setColor(settings.defaultColor)
        return info.message.reply({embeds : [embed], ephemeral: true })
    }
}