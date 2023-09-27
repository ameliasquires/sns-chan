const fs = require('fs')
const path = require("path");
const db = require("../../src/db")
let config_loc = __filename+".json"
let config = JSON.parse(fs.readFileSync(config_loc))
const {upload_limit} = require("../../src/util")
module.exports = {
    name : "sticky",
    command: ["sticky"],
    mod_only: true,
    config:config,
    config_loc:config_loc,
    async main (client,Discord,message,args){
        switch(args[0]){
            case 'add':
            case 'a':
                if(args.length<3){
                    message.reply("not enough parameters, try `sns help sticky`")
                    break;
                }
                db.Sticky.create({channel:args[1],message:args[2],last_message:'null',embed:args.includes("embed"),embed_color:config.embed_color});
                message.react("✅")
                break;
            case 'rem':
            case 'remove':
            case 'r':
                if(args.length<2){
                    message.reply("not enough parameters, try `sns help sticky`")
                    break;
                }
                let initial = await db.Sticky.count()
                await db.Sticky.destroy({
                    where: {
                        channel: args[1]
                    }
                });
                message.reply("removed "+(initial-(await db.Sticky.count()))+" item(s)")
                break;
            case 'dump':
            case 'list':
                let list = await db.Sticky.findAll()
                let flist = "channelid : message : last message\n"
                for(let l of list)
                    flist+=l.channel+" : "+l.message+" : "+l.last_message+"\n"
                let filename = "/tmp/sticky.json"
                fs.writeFileSync(filename,flist)
                let stats = fs.statSync(filename)
                if(stats.size / (1024*1024) > upload_limit(message.guild))
                   return message.reply("file too large:( file is "+stats.size / (1024*1024)+"mb")
                message.reply({files:[filename]})
                break;
            default:
                message.reply("unknown action, try `sns help sticky`")
        }

    },
}