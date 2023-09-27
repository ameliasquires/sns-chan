const fs = require('fs')
const path = require("path");
let db = require("../src/db");
const { parse_inp } = require("../src/util")
const { channel } = require('diagnostics_channel');
const { PermissionsBitField } = require('discord.js');
const { EmbedBuilder } = require("discord.js");
let settings = require('../src/settings')
let config_loc = __filename+".json"
module.exports = {
    name : "messageCreate",
    config_loc : config_loc,
    async main (client,Discord){
        let config = JSON.parse(fs.readFileSync(config_loc))
        client.on("messageCreate", async (message) => {
            if(message.guild==null)
                return require("./dm").main(client,Discord,message)
            if(!settings["allowed-servers"].includes(message.guild.id)||message.author.bot||message.member==null)
                return;
            //handle sticky messages
            let stickies = await db.Sticky.findAll();
            for(let s of stickies){
                if(message.channel.id==s.channel && message.author.id!="762561860150362142"){
                    let m;
                    if(s.embed){
                        let embed = new EmbedBuilder()
                            .setDescription(s.message)
                            .setColor(s.embed_color)
                        m = await message.channel.send({embeds:[embed]})
                    } else {
                        m = await message.channel.send(s.message)
                    }
                    if(s.last_message!='null'){
                        try{
                            let msg = await message.channel.messages.fetch(s.last_message)
                            msg.delete()
                            
                        } catch(e){}
                    }
                    db.Sticky.update({last_message: m.id},{ where: {id: s.id}})
                }
                
            }
            //done w/ sticky

            //handle auto reactions
            let a_react = await db.Auto_React.findAll();
            for(let a of a_react){
                if(message.channel.id==a.channel && message.author.id!="762561860150362142"){
                    try{
                        let m = await message.react(a.emote)
                    } catch(e){}
                }
                
            }
            //done w/ auto reactions

            //deal with commands
            let remove = function(msg) {setTimeout(async()=>{try{await msg.delete()}catch(e){}},config["error-timeout"].value)}
            let date = new Date()
            let uid = message.member.id;
            let mod = message.member.permissions!=null&&message.member.permissions?.has(PermissionsBitField.Flags.KickMembers)
            if(message.content.startsWith("sns ")&&(!config["restrict-channels"].value.includes(message.channel.id)||(mod))){
                let com_string = message.content.split(" ")
                com_string.shift()
                let found = false;
                let com_call = com_string[0].trim()
                //keep this as a for loop incase we want to do sequential commands
                for(let com of global.commands){
                    if(com.command.includes(com_call)){
                        found = true;
                        if(com.mod_only&&!mod){
                            message.reply(config["error-message-auth"].value).then((msg)=>{remove(msg)})
                            break;
                        }
                        com_string.shift()
                        com_string = parse_inp(com_string.join(" "))
                        try{
                            if(((!com.config.restrict||com.config.restrict.includes(message.channel))&&
                                (!com.config.restricted||!com.config.restricted.includes(message.channel)))||mod)
                                if(mod||com.config.cooldown==null||com.last_command[uid]==null||(date.getTime()-com.last_command[uid].getTime())/1000>com.config.cooldown){
                                    await com.main(client,Discord,message,com_string,com_call)
                                    com.last_command[uid] = new Date()
                                } else message.reply("this command is on cooldown for "+((date.getTime()-com.last_command[uid].getTime())/1000).toFixed(2)+"/"+com.config.cooldown+"s").then((msg)=>{remove(msg)})
                            else
                                message.reply(config["error-message-not-here"].value).then((msg)=>{remove(msg)})
                        } catch(e) {
                            message.reply(config["error-message"].value + "\n```"+e.stack+"```").then((msg)=>{remove(msg)})
                            console.log(e.stack)
                        }
                        break;
                    }
                }
                if(!found)
                    message.reply(config["error-message-not-found"].value).then((msg)=>{remove(msg)})
            }
            //done w/ commands
        })
    },
}