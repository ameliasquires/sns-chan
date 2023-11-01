const fs = require('fs')
const path = require("path");
const WeebyAPI = require("weeby-js");
let settings = require("../../src/settings")
const { EmbedBuilder } = require("discord.js");
let config_loc = __filename+".json"
let config = JSON.parse(fs.readFileSync(config_loc))
let subs = [...Object.keys(config.avaliable_solo.value),...Object.keys(config.avaliable_multi.value)]
module.exports = {
    name : "emote",
    command: subs,
    mod_only: false,
    config:config,
    config_loc:config_loc,
    async main (client,Discord,message,args,call){
        let mentioned = message.mentions.users.first();
        this.exec(client,{message:message,emote:call,mentioned:mentioned})
    },
    s_options:[{type:"string",name:"emote",desc:"emote to send",required:true,autocomplete:subs},
            {type:"user",name:"user",desc:"user to emote to (may be optional)",required:false,autocomplete:false}],
    async s_main (client,Discord,interaction){
        let emote = interaction.options.getString("emote");
        if(Object.keys(config.avaliable_multi.value).includes(emote)||Object.keys(config.avaliable_solo.value).includes(emote))
            this.exec(client,{message:interaction,emote:emote,mentioned:interaction.options.getUser("user")})
        else 
            interaction.reply({content:"invalid emote!", ephemeral: true})
    },
    async exec(client,param){
        let msg = "";
        if(Object.keys(config.avaliable_multi.value).includes(param.emote)){
            //let user = await client.users.fetch(userc.id).catch(() => null);
            if(!param.mentioned)
                return param.message.reply({content:"please mention someone", ephemeral: true})
            if(param.mentioned.id==param.message.author.id)
                msg="<@"+param.message.author.id+"> "+config.avaliable_multi.value[param.emote]+" themselves"
            else if(param.mentioned.id=="762561860150362142")
                msg="<@"+param.message.author.id+"> "+config.avaliable_multi.value[param.emote]+" me!"
            else 
                msg="<@"+param.message.author.id+"> "+config.avaliable_multi.value[param.emote]+" <@"+param.mentioned+">"
        } else {
            msg="<@"+param.message.author.id+"> "+config.avaliable_solo.value[param.emote]
        }
        const weeby = new WeebyAPI(client.env.WEEBY_TOKEN);
        let gif = await weeby.gif.fetch(param.emote);
        let emoteembed = new EmbedBuilder()
            .setDescription(msg)
            .setImage(gif)
            .setColor(settings.defaultColor)
        param.message.reply({embeds:[emoteembed]})
    }
}