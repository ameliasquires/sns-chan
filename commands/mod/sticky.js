const fs = require('fs')
const path = require("path");
const db = require("../../src/db")
let config_loc = __filename+".json"
let config = JSON.parse(fs.readFileSync(config_loc))
const {upload_limit} = require("../../src/util")
const options = ["add","remove","dump"]
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
                this.p_add(client,Discord,message,args[1],args[2],args.includes("embed"))
                break;
            case 'rem':
            case 'remove':
            case 'r':
                this.p_rem(client,Discord,message,args[1]);
                break;
            case 'dump':
            case 'list':
                this.p_dump(client,Discord,message);
                break;
            default:
                message.reply("unknown action, try `sns help sticky`")
        }

    },
    //s_options:[{type:"string",name:"action",desc:"what to do",required:true,autocomplete:false,choices:["add","remove","dump"]},
    //        {type:"string",name:"message",desc:"(required for add) message to be sent",required:false,autocomplete:false},
    //        {type:"channel",name:"chan",desc:"(required for remove and add) channel to clear",required:false,autocomplete:false},
    //        {type:"bool",name:"embed",desc:"whether or not to use a embed",required:false,autocomplete:false}],
    s_options:[{type:"sub",name:"add",options:[{type:"string",name:"message",desc:"message to be sent",required:true,autocomplete:false},{type:"channel",name:"chan",desc:"channel to use",required:true,autocomplete:false}]},
            {type:"sub",name:"remove",options:[{type:"channel",name:"chan",desc:"channel to clear",required:true,autocomplete:false}]},
            {type:"sub",name:"dump",options:[]}
            ],
    async s_main(client,Discord,interaction){
        let action = interaction.options.getSubcommand()
        let mess = interaction.options.getString("message")
        let chan = interaction.options.getChannel("chan")
        let embed = interaction.options.getBoolean("embed")
        //if(!options.includes(action))
        //    return interaction.reply({content:"please use the autocomplete, (valid values are add, remove, and dump)",ephemeral: true})
        if(action=="add") return this.p_add(client,Discord,interaction,chan.id,mess,embed)
        if(action=="remove") return this.p_rem(client,Discord,interaction,chan.id)
        if(action=="dump") return this.p_dump(client,Discord,interaction)
    },
    async p_dump(client,Discord,message){
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
    },
    async p_rem(client,Discord,message,chan){
        if(chan==null){
            message.reply("no channel provided")
            return;
        }
        let initial = await db.Sticky.count()
        await db.Sticky.destroy({
            where: {
                channel: chan
            }
        });
        message.reply("removed "+(initial-(await db.Sticky.count()))+" item(s)")
    },
    async p_add(client,Discord,message,chan,mess,embed){
        if(chan==null){
            message.reply("no channel provided")
            return;
        }
        if(mess==null){
            message.reply("no message provided")
            return;
        }
        db.Sticky.create({channel:chan,message:mess,last_message:'null',embed:embed ?? false,embed_color:config.embed_color});
        //message.react("✅")
        message.reply("added")
    }
}