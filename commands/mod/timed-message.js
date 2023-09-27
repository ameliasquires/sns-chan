const fs = require('fs')
const path = require("path");
const db = require("../../src/db")
let config_loc = __filename+".json"
let config = JSON.parse(fs.readFileSync(config_loc))
const {upload_limit} = require("../../src/util")
let valid_times = {"s":1000,"m":60000,"h":3.6e+6,"d":8.64e+7}
module.exports = {
    name : "timed message",
    command: ["timed"],
    mod_only: true,
    config:config,
    config_loc:config_loc,
    async main (client,Discord,message,args){
        switch(args[0]){
            case 'add':
            case 'a':
                if(args.length<3){
                    message.reply("not enough parameters, try `sns help timed`")
                    break;
                }
                let del_ind = args.indexOf("delay")
                if(del_ind==-1||del_ind==args.length-1){
                    message.reply("invalid usage! i need a delay")
                    break;
                }
                if(!Object.keys(valid_times).includes(args[del_ind+1][args[del_ind+1].length-1])){
                    message.reply("please end your delay with either s,m,h, or d")
                    break;
                }
                let time = args[del_ind+1]
                let ind = time[time.length-1]
                time[time.length-1] = '';
                time = valid_times[ind] * parseInt(time)
                if(time==NaN){
                    message.reply("invalid delay")
                    break;
                }
                db.Timed_Message.create({channel:args[1],message:args[2],last_message:'null',last_message_time:'null',embed:args.includes("embed"),embed_color:config.embed_color,delay:time,guild:message.guild.id})
                //db.Sticky.create({channel:args[1],message:args[2],last_message:'null',embed:args.includes("embed"),embed_color:config.embed_color});
                message.react("✅")
                break;
            case 'rem':
            case 'remove':
            case 'r':
                if(args.length<2){
                    message.reply("not enough parameters, try `sns help timed`")
                    break;
                }
                let initial = await db.Timed_Message.count()
                await db.Timed_Message.destroy({
                    where: {
                        channel: args[1]
                    }
                });
                message.reply("removed "+(initial-(await db.Timed_Message.count()))+" item(s)")
                break;
            case 'dump':
            case 'list':
                let list = await db.Timed_Message.findAll()
                let flist = "channelid : message : last message : last message time : delay : color\n"
                for(let l of list)
                    flist+=l.channel+" : "+l.message+" : "+l.last_message+" : "+l.last_message_time+" : " + l.delay + " : " + l.embed_color + "\n"
                let filename = "/tmp/timed.json"
                fs.writeFileSync(filename,flist)
                let stats = fs.statSync(filename)
                if(stats.size / (1024*1024) > upload_limit(message.guild))
                   return message.reply("file too large:( file is "+stats.size / (1024*1024)+"mb")
                message.reply({files:[filename]})
                break;
            default:
                message.reply("unknown action, try `sns help timed`")
        }

    },
}