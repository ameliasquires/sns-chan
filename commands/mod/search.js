const Discord = require("discord.js")
const { EmbedBuilder } = require("discord.js");
const { PermissionsBitField } = require('discord.js');
const settings = require("../../src/settings")
const {similarity} = require("../../src/util")
const fs = require('fs')
let config_loc = __filename+".json"
let config = JSON.parse(fs.readFileSync(config_loc))
module.exports = {
  name: "search",
  command: ["search"],
  mod_only:true,
  config:config,
  config_loc:config_loc,
  async main(client,Discord,message,args) {
    let per = 60;
    for(let a of args){
        if(a.length>=2&&a[a.length-1]=="%"&&a[a.length-2]!="%"){
            a[a.length-1]=""
            per = parseInt(a)
            args.splice(args.indexOf(a), 1);
        }
    }
    let dec = per/100
    let mem = Object.fromEntries(await message.guild.members.fetch())
    let found = []
    let count = 0
    for(let k of Object.keys(mem)){
        let s = similarity(mem[k].user.username.toLowerCase(),args[0].toLowerCase())
        if(mem[k].nickname!=null){
            s=Math.max(s,similarity(mem[k].nickname.toLowerCase(),args[0].toLowerCase()))
        }
        if(s>dec){
            found.push({sim:s,id:mem[k].id})
            count++;
        }
    }
    if(count==0)
        return message.reply("no usernames/nicknames found (within a "+per+"% similarity)")
    for(let i = 0; i<count-1; i++){
        if(i<0)i=0
        if(found[i+1].sim>found[i].sim){
            let t = found[i+1]
            found[i+1] = found[i]
            found[i] = t 
            i-=2;
        }
    }
    let p_found = ""
    for(let i = 0; i!=count; i++){
        let new_m = "(<@"+found[i].id+"> @ " + Math.floor(found[i].sim * 100) + "%) "
        if((p_found+new_m).length>1024-3){
            p_found+="..."
            break;
        }
        p_found+=new_m
    }
    message.channel.send("loading ids").then(async(m)=>{
        await m.edit(p_found)
        m.delete()
    })
    let embed = new EmbedBuilder()
        .setTitle("Usernames close to '"+args[0]+"' (≥"+per+"%)")
        .setDescription(p_found)
        .setColor(settings.defaultColor)
        .setFooter({text:count+' user(s) found • Up to '+Math.floor(found[0].sim * 100) + '% similarity'})
    message.channel.send({embeds:[embed]})
    
  }
};