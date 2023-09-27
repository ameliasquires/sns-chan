const fs = require('fs')
const path = require("path");
let config_loc = __filename+".json"
const { PermissionsBitField } = require('discord.js');
let config = JSON.parse(fs.readFileSync(config_loc))
module.exports = {
    name : "say",
    command: ["say"],
    mod_only: true,
    config:config,
    config_loc:config_loc,
    async main (client,Discord,message,args){
        let id = message.mentions.channels.first()
        let echo = message.content.slice(8)
        if(id){
            echo = echo.split(/ +/g);
            echo.shift();
            echo = echo.join(' ')
        } else {
            id = message.channel
        }
        this.exec(client,{id:id,echo:echo})
    },
    s_options:[{type:"string",name:"echo",desc:"message to be said",required:true,autocomplete:false},
            {type:"channel",name:"channel",desc:"channel to be sent to",required:false,autocomplete:false}],
    async s_main (client,Discord,interaction){
        this.exec(client,
            {echo:interaction.options.getString("echo"),
            id:interaction.options.getChannel("channel") ?? interaction.channel})
        await interaction.reply({ content:'sent', ephemeral: true })
        interaction.deleteReply()
    },
    async exec(client,info){
        return info.id.send(info.echo)
    }
}