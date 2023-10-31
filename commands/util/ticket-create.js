const fs = require('fs')
const path = require("path");
let config_loc = __filename+".json"
const { PermissionsBitField, ChannelType } = require('discord.js');
let config = JSON.parse(fs.readFileSync(config_loc))
module.exports = {
    name : "ticket-create",
    command: ["ticket-create"],
    mod_only: false,
    config:config,
    config_loc:config_loc,
    async main (client,Discord,message,args){
        this.exec(client,{message:message,thread_name:args[0] ?? 'created by '+message.author.username})
    },
    s_options:[{type:"string",name:"title",desc:"thread title",required:false,autocomplete:false}],
    async s_main (client,Discord,interaction){
        this.exec(client,{message:interaction,thread_name:interaction.options.getString("title")??'created by '+interaction.author.user.username})
    },
    async exec(client,info){
        let thread = await client.channels.cache.get(info.message.channelId).threads.create({
            name: info.thread_name,
            autoArchiveDuration: 60,
            reason: 'created by <@'+info.message.author.id+'>',
            type: ChannelType.PrivateThread,
        })
        await thread.members.add(info.message.author.id)
        await info.message.reply({content:"created <#"+thread.id+">"})
    }
}