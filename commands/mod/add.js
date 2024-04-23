const fs = require('fs')
const path = require("path");
let config_loc = __filename+".json"
const { PermissionsBitField } = require('discord.js');
let config = JSON.parse(fs.readFileSync(config_loc))
const { EmbedBuilder, ActionRowBuilder,ButtonBuilder,ButtonStyle } = require("discord.js");
const settings = require("../../src/settings")

module.exports = {
    name : "add",
    command: ["add"],
    mod_only: true,
    config:config,
    config_loc:config_loc,
    async main (client,Discord,message,args){

    },
    s_options:[{type:"sub",name:"button",options:[
        {type:"string",name:"message",desc:"message id to edit",required:true,autocomplete:false},
        {type:"string",name:"label",desc:"text on the button",required:true,autocomplete:false},
        {type:"string",name:"custom-id",desc:"custom id to do custom things",required:true,autocomplete:false},
        {type:"string",name:"style",desc:"button type",required:true,autocomplete:["Primary","Secondary","Success","Danger","Link"]}
    ]}],
    async s_main (client,Discord,interaction){
        let action = interaction.options.getSubcommand()
        if(action == "button"){
            this.exec_button(client, interaction)
            //await interaction.reply({ content:'sent', ephemeral: true })
            //interaction.deleteReply()
        }
        
        
    },

    async exec_button(client,interaction){
        interaction.channel.messages.fetch(interaction.options.getString("message"))
            .then(msg => {
                if(msg.author.id != "762561860150362142")
                    return interaction.reply({ content:'message must be owned by me', ephemeral: true })
                const button = new ButtonBuilder()
                    .setCustomId(interaction.options.getString("custom-id"))
                    .setLabel(interaction.options.getString("label"))
                    .setStyle(ButtonStyle[interaction.options.getString("style")])
        
                const row = new ActionRowBuilder()
                    .addComponents(button);

                msg.edit({components:[row]})
                interaction.reply({ content:'success', ephemeral: true })
            }) .catch(e => {
                interaction.reply({ content:'unable to add anything, are you in the same channel?', ephemeral: true })
            })
    },
}