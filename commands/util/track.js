const fs = require('fs')
const path = require("path");
let config_loc = __filename+".json"
const { PermissionsBitField } = require('discord.js');
let config = JSON.parse(fs.readFileSync(config_loc))
let db = require("../../src/db")
const {upload_limit} = require("../../src/util")
module.exports = {
    name : "track",
    command: ["track"],
    mod_only: false,
    config:config,
    config_loc:config_loc,
    async main (client,Discord,message,args){
        if((args[0]=="reg"||args[0]=="unreg")&&args.length < 1){
            return message.reply("please enter a word to (un)register")
        }
        let action = args[0];
        args.shift();
        this.exec(client,message,{action:action,other:args})
    },
    s_options:[{type:"sub",name:"opt-in",options:[]},
            {type:"sub",name:"opt-out",options:[]},
            {type:"sub",name:"del",options:[]},
            {type:"sub",name:"list",options:[]},
            {type:"sub",name:"reg",options:[{type:"string",name:"word",desc:"word to add",required:true,autocomplete:false}]},
            {type:"sub",name:"unreg",options:[{type:"string",name:"word",desc:"word to remove",required:true,autocomplete:
                async (message)=>{
                    let list = []
                    let d = (await db.Track.findAll({where:{user:message.author.id}}))[0]
                    if(d==null) return [];
                    for(let u of JSON.parse(d.words)) list.push(u.word);
                    return list;
                }
            }]},
            ],
    async s_main (client,Discord,interaction){
        let action = interaction.options.getSubcommand()
        let mess = interaction.options.getString("word")
        await this.exec(client,interaction,{action:action,other:[mess]})
        //await interaction.reply({ content:'sent', ephemeral: true })
        //interaction.deleteReply()
    },
    async exec(client,message,info){
        let words;
        let qu = {where:{user:message.author.id}}
        let entry = (await db.Track.findAll(qu))
        switch(info.action){
            case "opt-in":
                if(entry.length==0){
                    await db.Track.create({
                        user:message.author.id,
                        words:"[]",
                        track:true,
                    })
                    return message.reply("registered!")
                }
                
                await db.Track.update({track:true},qu);
                return message.reply("tracking enabled!")
                break;
            case "opt-out":
                if(entry.length==0){
                    return message.reply("you are not opted in")
                }
                
                await db.Track.update({track:false},qu);
                return message.reply("tracking disabled!")
                break;
            case "del":
                if(entry.length==0){
                    return message.reply("you are not opted in")
                }
                
                await db.Track.destroy(qu);
                return message.reply("entry deleted")
                break;
            case "reg":
                if(entry.length==0){
                    return message.reply("you are not opted in")
                }
                
                for(let o in info.other){
                    info.other[o] = {word:info.other[o].toLowerCase(),count:0}
                }

                words = JSON.parse(entry[0].words)
                await db.Track.update({words:JSON.stringify([...words,...info.other])},qu);
                return message.reply("added "+info.other.length+" words")
                break;
            case "unreg":
                if(entry.length==0){
                    return message.reply("you are not opted in")
                }
                
                words = JSON.parse(entry[0].words)
                let newwords = []
                let removed = 0;
                for(let w of words){
                    if(!info.other.includes(w.word.toLowerCase())) newwords.push(w);
                    else removed++;
                        
                }
                await db.Track.update({words:JSON.stringify(newwords)},qu);
                return message.reply("removed "+removed+" words"+(info.other.length>removed?", "+(info.other.length-removed)+" not found":""))
                break;
            case "list":
                if(entry.length==0){
                    return message.reply("you are not opted in")
                }
                let mmsg = "word  |  count\n-------------\n";
                for(let o of JSON.parse(entry[0].words)){
                    mmsg += o.word + " | " + o.count + "\n";
                }
                let filename = "/tmp/"+entry[0].user+".json"
                fs.writeFileSync(filename,mmsg)
                let stats = fs.statSync(filename)
                if(stats.size / (1024*1024) > upload_limit(message.guild))
                    return message.reply("file too large:( file is "+stats.size / (1024*1024)+"mb")
                return message.reply({files:[filename]})
                break;
        }
        //return info.id.send(info.echo)
    }
}