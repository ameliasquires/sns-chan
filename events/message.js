const fs = require('fs')
const path = require("path");
let db = require("../src/db");
const { parse_inp } = require("../src/util")
const { channel } = require('diagnostics_channel');
const { PermissionsBitField } = require('discord.js');
const { EmbedBuilder } = require("discord.js");
const util = require("../src/util")
let settings = require('../src/settings')
const llog = require("../src/logg")
let config_loc = __filename+".json"
module.exports = {
    name : "messageCreate",
    config_loc : config_loc,
    async main (client,Discord){
        let config = JSON.parse(fs.readFileSync(config_loc))
        client.on("messageCreate", async (message) => {
            llog.debug("message " + message.author.id)
            if(message.guild==null)
                return require("./dm").main(client,Discord,message)
            if(!settings["allowed-servers"].includes(message.guild.id)||message.author.bot||message.member==null)
                return;

            
            //spam messages
            /*for(let i = 0; i < global.recent_messages.length; i++){
                let diff = util.diff((new Date(message.createdTimestamp)).getUTCSeconds(),(new Date(global.recent_messages[i].createdTimestamp)).getUTCSeconds());

                if(diff>2){
                    global.recent_messages.splice(i,1);
                    i = -1;
                }
            }

            let matching_ids = [];
            for(let i = 0; i < global.recent_messages.length; i++){
                let m = global.recent_messages[i];
                if((m.content==message.content||util.similarity(m.content,message.content))&&m.author==message.author){
                    matching_ids.push(m);
                }
            }
            global.recent_messages.push(message)
            if(false && matching_ids.length > 3){
                //let temp_msg = global.recent_messages;
                global.recent_messages = global.recent_messages.filter(x => x.author != message.author)
                let could_timeout = true
                try{
                    await message.member.timeout(60000)
                } catch (e) {
                    could_timeout = false;
                }
                for(let mm of matching_ids){
                    //mm.delete();
                    mm.delete().then().catch();
                }
                
                let embed = new EmbedBuilder()
                    .setColor(settings.defaultColor)
                    .setTitle("Spam:(")
                    .setDescription("<@"+message.author.id+"> sent "+matching_ids.length+" messages, similar to or matching \n`"+message.content+"`")

                global.channels["admin-chan"].send({ embeds: [embed]})
            }*/
            //done w/ spam

            //track message
            let utrack = await db.Track.findAll({where:{user:message.author.id,track:true}})
            if(utrack.length!=0){
                utrack = utrack[0];
                let words = JSON.parse(utrack.words);
                for(let w of words){
                    if(message.content.toLowerCase().includes(w.word)) w.count+=message.content.split(w.word).length-1;
                }
                db.Track.update({words:JSON.stringify(words)},{where:{user:message.author.id,track:true}})
            }
            //done w/ track

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
            let mod = util.is_mod(message.member);//message.member.permissions!=null&&message.member.permissions?.has(PermissionsBitField.Flags.KickMembers)
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
                            if(((!com.config.restrict||com.config.restrict.length==0||com.config.restrict.includes(message.channel))&&
                                (!com.config.restricted||com.config.restricted.length==0||!com.config.restricted.includes(message.channel)))||mod)
                                if(mod||com.config.cooldown==null||com.last_command[uid]==null||(date.getTime()-com.last_command[uid].getTime())/1000>com.config.cooldown){
                                    await com.main(client,Discord,message,com_string,com_call)
                                    com.last_command[uid] = new Date()
                                } else message.reply("this command is on cooldown for "+((date.getTime()-com.last_command[uid].getTime())/1000).toFixed(2)+"/"+com.config.cooldown+"s").then((msg)=>{remove(msg)})
                            else
                                message.reply(config["error-message-not-here"].value).then((msg)=>{remove(msg)})
                        } catch(e) {
                            message.reply(config["error-message"].value + "\n```"+e.stack+"```").then((msg)=>{remove(msg)})
                            llog.error(e.stack)
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
