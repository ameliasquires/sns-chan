const fs = require('fs')
const path = require("path");
let config_loc = __filename+".json"
const { PermissionsBitField } = require('discord.js');
let config = JSON.parse(fs.readFileSync(config_loc))
const { EmbedBuilder, ActionRowBuilder,ButtonBuilder,ButtonStyle } = require("discord.js");
const settings = require("../../src/settings")
const {upload_limit} = require("../../src/util")

module.exports = {
    name : "blacklist",
    command: ["blacklist"],
    mod_only: true,
    config:config,
    config_loc:config_loc,
    async main (client,Discord,message,args){

        let del = false
        switch(args[0]){
            case "del":
                del = true;
                args.shift()
                break;
            case "dump":
                let flist = ""
                for(let l of await global.preserve.blacklist.values())
                    flist+=l + " "
                let filename = "/tmp/blacklist.txt"
                fs.writeFileSync(filename,flist)

                let stats = fs.statSync(filename)
                if(stats.size / (1024*1024) > upload_limit(message.guild))
                    return message.reply("file too large:( file is "+stats.size / (1024*1024)+"mb")
                message.reply({files:[filename]})
                return
                break;
            case "test":
                return message.reply(await global.preserve.blacklist.getItem(args[1]) != null ? "found" : "not found")
                break;
        }

        let len = await global.preserve.blacklist.length()
        for(let id of args){
            console.log(id)
            if(del){
                await global.preserve.blacklist.removeItem(id);
            } else {
                await global.preserve.blacklist.setItem(id,id);
            }
        }

        return message.reply("wrote " + (await global.preserve.blacklist.length() - len) + " entrie(s)")


    },
}