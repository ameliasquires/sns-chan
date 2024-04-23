const Discord = require("discord.js")
const { EmbedBuilder, ActionRowBuilder,ButtonBuilder,ButtonStyle,ChannelType } = require("discord.js");
const { PermissionsBitField } = require('discord.js');
const settings = require("../../src/settings")
const fs = require('fs');
const message = require("../../events/message");
let config_loc = __filename+".json"
let config = JSON.parse(fs.readFileSync(config_loc))
module.exports = {
  name: "ban",
  command: ["ban"],
  mod_only:true,
  config:config,
  config_loc:config_loc,
  main(client,Discord,message,args) {
      
  },
  s_options:[
        {type:"user",name:"user",desc:"message to be sent",required:true,autocomplete:false},
        {type:"string",name:"ban-reason",desc:"ban reason to be sent to the user",required:true,autocomplete:false},
        {type:"string",name:"staff-note",desc:"viewable only to staff",required:false,autocomplete:false},
        {type:"boolean",name:"send-appeal",desc:"whether to send your user id for appealing (default : false)", required:false,autocomplete:false},
        {type:"boolean",name:"open-thread",desc:"open a thread for discussion (default : false)", required:false,autocomplete:false},
        //{type:"boolean",name:"delete-messages",desc:"delete recent messages from user (default : true)", required:false,autocomplete:false},
    ],
  async s_main(client,Discord,interaction){
    
    await interaction.guild.members.fetch()
    await interaction.guild.channels.fetch()

    
    /*
    interaction.channel.messages.fetch({limit:100}).then(m => {
        m.forEach(message => console.log(message.id))
    })*/
    
    
    this.exec(client, {
        message : interaction,
        user : interaction.guild.members.cache.get(interaction.options.getUser("user").id),
        reason : interaction.options.getString("ban-reason"),
        details : interaction.options.getString("staff-note"),
        appeal : interaction.options.getBoolean("send-appeal"),
        thread : interaction.options.getBoolean("open-thread"),
        //del_messages : interaction.options.getBoolean("delete-messages") ?? true,
    })
  },
  async exec(client,param){
    if(!param.user){
        return param.message.reply({content:"user not found",ephemeral: true })
    }
    let embed = new EmbedBuilder()
        .setTitle("Waiting for Confirmation")
        .setThumbnail(param.user.displayAvatarURL())
        .setFooter({text:"0 confirmations"})
        .setColor(settings.defaultColor)
    
        embed.addFields(
            {name : "Confirmed by Staff:", value: "<@!"+param.message.author.id+">", inline : true},
            {name : "User:", value: "<@!"+param.user.id+">", inline : true},
            {name : "Ban Reason:", value : param.reason},
    )
    if(param.details) embed.addFields({name : "Staff Note:", value : param.details})

    const confirm_button = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Primary)

    const cancel_button = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger)

    const row = new ActionRowBuilder()
            .addComponents(confirm_button, cancel_button);
    
    let confirms = [param.message.author.id]
    //await param.message.deferReply();
    //param.message.deferUpdate()
    let mess = await param.message.deferReply({ fetchReply: true })
    param.message.editReply({embeds:[embed],components:[row]})
    //await param.message.editReply({embeds:[embed],components:[row]})
    //if(mess.partial) mess = mess.fetch()

    if(param.thread){
        let th = await client.channels.cache.get(param.message.channelId).threads.create({
            name: param.user.user.username,
            reason: 'Ban request discussion',
            autoArchiveDuration: 60,
            type: ChannelType.PublicThread,
        })
    }

    async function rec_read(){
        const collectorFilter = i => true;//i.user.id != param.message.author.id && !confirms.includes(i.user.id);
        try {
            const confirmation = await mess.awaitMessageComponent({ filter: collectorFilter, time: 60000000 });
            //confirmation.deferReply();
            confirmation.deferUpdate()
            if(confirmation.customId == "confirm"){
                confirms.push(confirmation.author.id)
                let comb_mod = ""
                for(let mod of confirms){
                    comb_mod += "<@" + mod + ">"
                    if(mod != confirms[confirms.length-1]) comb_mod += ","
                }
                embed.setFooter({text:confirms.length - 1 + "/1 confirmations"})
                embed.data.fields[0].value = comb_mod

                if(confirms.length >= 2){
                    let ban_embed = new EmbedBuilder()
                        .setTitle("Banned from Supernoobs")
                        .setFooter({text:"You have been banned from this server. Maybe in another life, we could have been friends. But not in this one. 💔"})
                        .setColor(settings.defaultColor)
                        .setFields({name : "Reason", value : param.reason})
                    if(param.appeal) ban_embed.addFields({name : "Appeal id", value : "" + param.message.author.id})
                    let user = await param.message.client.users.cache.get(param.user.id);
                    let could_send = true
                    let could_ban = true
                    let could_del = true
                    embed.setTitle("Ban Confirmed, Awaiting User Cleanup");
                    mess.edit({embeds:[embed],components:[]})
                    try {
                        await user.send({embeds:[ban_embed]})
                    } catch (e) {
                        console.log(e)
                        could_send = false;
                    }
                    try{
                        user = param.message.guild.members.cache.get(user.id)
                        await user.ban({deleteMessageSeconds: 60 * 60 * 24 * 7, reason: param.reason})
                    } catch (e) {
                        console.log(e)
                        could_ban = false;
                    }
                    
                    embed.setTitle("Ban Confirmed" + (!could_send?" | Unable to Message":"") + (!could_ban?" | Unable to Ban":"") + (!could_del?" | Unable to Delete Msgs":""));
                    mess.edit({embeds:[embed],components:[]})
                } else {
                    mess.edit({embeds:[embed]})
                    rec_read()
                    //confirmation.deferUpdate()
                }
            } else if(confirmation.customId == "cancel") {
                embed.setFooter({text:"canceled"})
                embed.setTitle("Ban Request Rejected")
                embed.addFields({name:"Removed By Staff:",value:"<@!"+param.message.author.id+">", inline : true})
                mess.edit({embeds:[embed],components:[]})
            }
        } catch (e) {
            console.log(e)
        }
    }
    await rec_read();
  }
};
