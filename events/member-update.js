const { ActivityType , PermissionsBitField, ActionRowBuilder,ButtonBuilder,ButtonStyle  } = require("discord.js");
const fs = require('fs')
const path = require("path");
const { EmbedBuilder } = require("discord.js");
let db = require("../src/db")
let settings = require("../src/settings")
let llog = require("../src/logg")
let config_loc = __filename+".json"
module.exports = {
    name : "guildMemberUpdate",
    config_loc : config_loc,
    _build_message(p, t){
        global.channels["general"].messages.fetch({limit : 1}).then(async messages => {
            let message = messages.first();
            if(message.id == global.notif.id){
                //edit
                let mess = "";
                //TODO: this can be a single loop
                if(global.notif.voted.length != 0){
                    for(let i = 0; i != global.notif.voted.length - 1; i++){
                        mess += "<@"+global.notif.voted[i]+">, ";
                    }
                    if(global.notif.voted.length > 1) mess += "and "
                    mess += "<@"+global.notif.voted[global.notif.voted.length - 1]+"> just voted! You can too by clicking [here](https://discords.com/servers/486957006628847626/upvote)"
                }

                if(global.notif.joined.length != 0){
                    if(global.notif.voted.length != 0) mess += " and\n"
                    mess += "Welcome to the server "
                    for(let i = 0; i != global.notif.joined.length - 1; i++){
                        mess += "<@"+global.notif.joined[i]+">, ";
                    }
                    if(global.notif.joined.length > 1) mess += "and "
                    mess += "<@"+global.notif.joined[global.notif.joined.length - 1]+">!"
                }
                message.edit({content: mess, flags:[4096]})
            } else {
                global.notif.voted = []
                global.notif.joined = []
                global.notif[t] = [p]

                if(t == "voted"){
                    global.notif.id = await global.channels["general"].send({content:`<@${p}> just voted! You can too by clicking [here](https://discords.com/servers/486957006628847626/upvote).`,
                    flags: [ 4096 ]})
                } else if(t == "joined"){
                    global.notif.id = await global.channels["general"].send({content:`Welcome to the server <@${p}>!`,
                    flags: [ 4096 ]})
                }
            }
        })
    },
    build_message(p, t){
        let lim = 1;
        let types = {
            voted: {start: "", end: " just voted! You can too by clicking [here](https://discords.com/servers/486957006628847626/upvote)"},
            joined: {start: "Welcome to the server ", end: "!"},
        }
        global.channels["general"].messages.fetch({limit : lim}).then(async messages => {
            //console.log(messages)
            let found = false
            let message = null
            for(let m of messages){
                if(m[0] == global.notif[t+"_id"]){
                    if(lim == 1) message = m[1];
                        else {
                        try{
                            await m[1].delete()
                        } catch(e) {
                            llog.error("failed to delete message")
                        }
                    }
                    found = true
                    break
                }
            }
            if(!found) global.notif[t] = [p]
            let con = types[t].start
            for(let i = 0; i != global.notif[t].length - 1; i++){
                con += "<@"+global.notif[t][i]+">, "
            }
            if(global.notif[t].length > 1) con += "and "
            con += "<@"+global.notif[t][global.notif[t].length - 1]+">"+types[t].end

            if(lim == 1 && !found || lim != 1){
                global.notif[t+"_id"] = await global.channels["general"].send({content:con, flags:[4096]})
            } else {
                message.edit({content:con, flags:[4096]})
            }
            

        })
    },
    async main (client,Discord){
        client.on("guildMemberUpdate",(oldMember, newMember)=>{
            if(!oldMember.roles.cache.has("761225110060662854") && 
                    newMember.roles.cache.has("761225110060662854")){
                
                if(global.notif == null)
                    global.notif = {}
                if(global.notif.voted == null)
                    global.notif.joined = global.notif.voted = []

                global.notif.voted.push(newMember.id)

                this.build_message(newMember.id, "voted")
                
                
            }
       })
    },
}