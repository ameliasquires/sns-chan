const fs = require('fs')
const path = require("path");
let config_loc = __filename+".json"
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
let config = JSON.parse(fs.readFileSync(config_loc))
const numbers = ["1️⃣" ,"2️⃣", "3️⃣" ,"4️⃣" ,"5️⃣", "6️⃣", "7️⃣", "8️⃣" ,"9️⃣" ,"🔟"]
let settings = require("../../src/settings")
module.exports = {
    name : "poll",
    command: ["poll"],
    mod_only: true,
    config:config,
    config_loc:config_loc,
    async main (client,Discord,message,args){
        let title = args[0];
        args.shift();
        if(args.length>10)return message.reply("too many options")
        this.exec(client,{message:message,title:title,options:args})
    },
    s_options:[{type:"string",name:"title",desc:"title of poll",required:true,autocomplete:false},
            {type:"string",name:"option-1",desc:"poll option",required:true,autocomplete:false},
            {type:"string",name:"option-2",desc:"poll option",required:false,autocomplete:false},
            {type:"string",name:"option-3",desc:"poll option",required:false,autocomplete:false},
            {type:"string",name:"option-4",desc:"poll option",required:false,autocomplete:false},
            {type:"string",name:"option-5",desc:"poll option",required:false,autocomplete:false},
            {type:"string",name:"option-6",desc:"poll option",required:false,autocomplete:false},
            {type:"string",name:"option-7",desc:"poll option",required:false,autocomplete:false},
            {type:"string",name:"option-8",desc:"poll option",required:false,autocomplete:false},
            {type:"string",name:"option-9",desc:"poll option",required:false,autocomplete:false},
            {type:"string",name:"option-10",desc:"poll option",required:false,autocomplete:false},],
    async s_main (client,Discord,interaction){
        this.exec(client,
            {message:interaction,options:[
                interaction.options.getString("option-1"),
                interaction.options.getString("option-2") ,
                interaction.options.getString("option-3") ,
                interaction.options.getString("option-4") ,
                interaction.options.getString("option-5") ,
                interaction.options.getString("option-6") ,
                interaction.options.getString("option-7") ,
                interaction.options.getString("option-8") ,
                interaction.options.getString("option-9") ,
                interaction.options.getString("option-10") ,
            ].filter(n => n),title:interaction.options.getString("title")})
    },
    async exec(client,info){
        let embed = new EmbedBuilder()
            .setTitle(info.title)
        let desc = "";
        for(let a in info.options){
            desc+=numbers[a]+" "+info.options[a]+"\n";
        }
        embed.setDescription(desc)
             .setColor(settings.defaultColor)
             .setFooter({text: 'poll:'+info.options.length+' | '+info.message.author.username})
        let m = await info.message.reply({embeds:[embed],fetchReply: true })
        for(let a in info.options){
            m.react(numbers[a])
        }
    }
}