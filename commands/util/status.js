const fs = require('fs')
const path = require("path");
let settings = require("../../src/settings")
let {limit_exp} = require("../../src/util")
const { EmbedBuilder,ActionRowBuilder,ButtonBuilder,ButtonStyle } = require("discord.js");
const {getLastCommit} = require("git-last-commit")
var os = require('os');
let config_loc = __filename+".json"
let config = JSON.parse(fs.readFileSync(config_loc))
module.exports = {
    name : "status",
    command: ["status","server","uptime","vote","twitter","𝕏"],
    mod_only: false,
    config:config,
    config_loc:config_loc,
    async main (client,Discord,message,args){
        this.exec(client,message)
    },
    async s_main (client,Discord,interaction){
        this.exec(client,interaction)
    },
    async exec(client,message){
        getLastCommit((err,commit)=>{
            let seconds = Math.floor(message.client.uptime / 1000);
            let minutes = Math.floor(seconds / 60);
            let hours = Math.floor(minutes / 60);
            let days = Math.floor(hours / 24);
            let uptime = "online for: ";
            if(days>0)uptime+=days+" days"
            else if(hours>0)uptime+=hours+"h"
            else if(minutes>0)uptime+=minutes+"m"
            else uptime+=seconds+"s"
            uptime+=" | "+limit_exp((message.client.uptime*1000).toExponential(),2)+"μs"
            const vote = new ButtonBuilder()
                .setLabel('Vote')
                .setStyle(ButtonStyle.Link)
                .setURL('https://top.gg/servers/486957006628847626/vote')
            /*const twitter = new ButtonBuilder() //0% chance i will call this 𝕏
                .setLabel('Twitter')
                .setStyle(ButtonStyle.Link)
                .setURL('https://twitter.com/sns_chan')*/
            const discord = new ButtonBuilder()
                .setLabel('Discord')
                .setStyle(ButtonStyle.Link)
                .setURL('https://discord.gg/supernoobs')
            const github = new ButtonBuilder()
                .setLabel('Github')
                .setStyle(ButtonStyle.Link)
                .setURL('https://github.com/iamAGFX/snschan-bot')
            const row = new ActionRowBuilder()
                .addComponents(vote,discord,github);
            let conv = 1024 * 1024 * 1024
            let sys = "system: cpus: "+os.cpus().length+", ram (free): "+Math.floor(os.freemem()/conv)+"/"+Math.floor(os.totalmem()/conv)+"gb\nkernel: "+os.release()
            let emoteembed = new EmbedBuilder()
                .setThumbnail(client.user.displayAvatarURL())
                .setTitle("Server info")
                .setDescription(uptime+"\n"+sys)
                .setColor(settings.defaultColor)
                .setFooter({text:"running "+commit.shortHash+" ("+commit.branch+")"})
            message.reply({embeds:[emoteembed],components:[row]})
        })
    }
}