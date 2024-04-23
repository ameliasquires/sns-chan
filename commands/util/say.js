const fs = require('fs')
const path = require("path");
let config_loc = __filename+".json"
const { PermissionsBitField } = require('discord.js');
let config = JSON.parse(fs.readFileSync(config_loc))
const { EmbedBuilder, ActionRowBuilder,ButtonBuilder,ButtonStyle } = require("discord.js");
const settings = require("../../src/settings")

/*let presets = {
    "ticket-create": function(client, info){
        let embed = new EmbedBuilder()
            .setColor(settings.defaultColor)
            .setTitle("create a ticket")
            .setDescription("test")

        const create = new ButtonBuilder()
                .setCustomId('new-private-thread')
                .setLabel('Create Ticket')
                .setStyle(ButtonStyle.Primary)

        const row = new ActionRowBuilder()
                .addComponents(create);

        info.id.send({embeds:[embed],components:[row]})
    }
}*/
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
    s_options:[{type:"sub",name:"text",options:[{type:"string",name:"echo",desc:"message to be said",required:true,autocomplete:false},
            {type:"channel",name:"channel",desc:"channel to be sent to",required:false,autocomplete:false}]},
            //{type:"sub",name:"preset",options:[{type:"string",name:"pre",desc:"preset message",required:true,autocomplete:Object.keys(presets)}]},
            {type:"sub", name:"embed",options:[
                {type:"string",name:"hex-color",desc:"hex color on left side of embed",required:false,autocomplete:false},
                {type:"string",name:"title",desc:"embed title",required:false,autocomplete:false},
                {type:"string",name:"url",desc:"embed url",required:false,autocomplete:false},
                {type:"string",name:"description",desc:"embed body",required:false,autocomplete:false},
                {type:"string",name:"thumbnail",desc:"embed thumbnail",required:false,autocomplete:false},
                {type:"string",name:"image",desc:"embed image",required:false,autocomplete:false},
                {type:"string",name:"footer",desc:"footer text",required:false,autocomplete:false},
            ]}],
    async s_main (client,Discord,interaction){
        let action = interaction.options.getSubcommand()
        if(action == "text"){
            this.exec(client,
                {echo:interaction.options.getString("echo"),
                id:interaction.options.getChannel("channel") ?? interaction.channel})
            await interaction.reply({ content:'sent', ephemeral: true })
            interaction.deleteReply()
        } else if(action == "embed"){
            this.embed_exec(client, {msg:interaction,id:interaction.channel})
        }
        
        
    },

    async exec(client,info){
        return info.id.send(info.echo)
    },

    async embed_exec(client, info){
        let interaction = info.msg
        let opt;
        try{
            let embed = new EmbedBuilder()
                .setColor(interaction.options.getString("hex-color") ?? settings.defaultColor)
            if((opt = interaction.options.getString("title")) != null)
                embed.setTitle(opt)
            if((opt = interaction.options.getString("url")) != null)
                embed.setURL(opt)
            if((opt = interaction.options.getString("description")) != null)
                embed.setDescription(opt)
            if((opt = interaction.options.getString("thumbnail")) != null)
                embed.setThumbnail(opt)
            if((opt = interaction.options.getString("image")) != null)
                embed.setImage(opt)
            if((opt = interaction.options.getString("image")) != null)
                embed.setImage(opt)
            if((opt = interaction.options.getString("footer")))
                embed.setFooter({text:opt})
            info.id.send({embeds:[embed]})
            await interaction.reply({ content:'sent', ephemeral: true })
            interaction.deleteReply()
        } catch(e){
            await interaction.reply({ content:'invalid configuration', ephemeral: true })
        }
        
    }
}