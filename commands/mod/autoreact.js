const fs = require('fs')
const path = require("path");
const db = require("../../src/db")
let config_loc = __filename+".json"
let config = JSON.parse(fs.readFileSync(config_loc))
const {upload_limit} = require("../../src/util")
module.exports = {
    name : "autoreact",
    command: ["react"],
    mod_only: true,
    config:config,
    config_loc:config_loc,
    async main (client,Discord,message,args){
        switch(args[0]){
            case 'add':
            case 'a':
                if(args.length<3){
                    message.reply("not enough parameters, try `sns help react`")
                    break;
                }
                db.Auto_React.create({channel:args[1],emote:args[2]});
                message.react("✅")
                break;
            case 'rem':
            case 'remove':
            case 'r':
                if(args.length<2){
                    message.reply("not enough parameters, try `sns help react`")
                    break;
                }
                let initial = await db.Auto_React.count()
                await db.Auto_React.destroy({
                    where: {
                        channel: args[1]
                    }
                });
                message.reply("removed "+(initial-(await db.Auto_React.count()))+" item(s)")
                break;
            case 'dump':
            case 'list':
                let list = await db.Auto_React.findAll()
                let flist = "channel : emote"
                for(let l of list)
                    flist+=l.channel+" : "+l.emote+"\n"
                let filename = "/tmp/autoreact.json"
                fs.writeFileSync(filename,flist)
                let stats = fs.statSync(filename)
                if(stats.size / (1024*1024) > upload_limit(message.guild))
                    return message.reply("file too large:( file is "+stats.size / (1024*1024)+"mb")
                message.reply({files:[filename]})
                break;
            default:
                message.reply("unknown action, try `sns help react`")
        }

    },
}