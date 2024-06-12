const Discord = require("discord.js")
let { EmbedBuilder, ActionRowBuilder,ButtonBuilder,ButtonStyle,ChannelType } = require("discord.js");
const { PermissionsBitField } = require('discord.js');
const settings = require("../../src/settings")
const fs = require('fs');
const message = require("../../events/message");
let config_loc = __filename+".json"
let config = JSON.parse(fs.readFileSync(config_loc))
let { Events, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const preserve = require("../../src/interaction-preserve")
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
        {type:"boolean",name:"open-thread",desc:"open a thread for discussion (default : false) (unused)", required:false,autocomplete:false},
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
        send_loc: interaction.channel,
        message : interaction,
        user : interaction.guild.members.cache.get(interaction.options.getUser("user").id),
        reason : interaction.options.getString("ban-reason"),
        details : interaction.options.getString("staff-note"),
        appeal : interaction.options.getBoolean("send-appeal"),
        thread : interaction.options.getBoolean("open-thread"),
        //del_messages : interaction.options.getBoolean("delete-messages") ?? true,
    })
  },
  async c_main(client,Discord,interaction){
    const modal = new ModalBuilder()
        .setCustomId("ban")
        .setTitle("Ban")
    
    const ban_reason = new TextInputBuilder()
        .setCustomId("ban_reason")
        .setLabel("Ban reason to be sent to the user")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);
    
    const staff_note = new TextInputBuilder()
        .setCustomId("staff_note")
        .setLabel("Note only visible only to staff")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)

    const f = new ActionRowBuilder().addComponents(ban_reason)
    const s = new ActionRowBuilder().addComponents(staff_note)

    modal.addComponents(f, s);

    await interaction.showModal(modal)

    let sub;
    try{
        sub = await interaction.awaitModalSubmit({
        filter: i => i.user.id == interaction.user.id,
        time: 6000000
    })
    } catch(e){
        return;
    }

    if(sub){
        this.exec(client, {
            send_loc: global.channels["staff-actions"],
            message: sub,
            user: interaction.guild.members.cache.get(interaction.targetId),
            reason: sub.fields.getTextInputValue("ban_reason"),
            details: sub.fields.getTextInputValue("staff_note"),
            appeal: false,
            thread: false,
            modal:true
        })
    }
  },
  async exec(client,param){
    if(!param.user){
        return param.message.reply({content:"user not found",ephemeral: true })
    }
    let embed = new EmbedBuilder()
        .setTitle("Waiting for Confirmation")
        .setThumbnail(param.user.displayAvatarURL())
        .setFooter({text:"0 confirmations"+(param.modal==true?" (sent via usercommand)":"")})
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

    let row = new ActionRowBuilder()
            .addComponents(confirm_button, cancel_button);
    
    let confirms = [param.message.author.id]
    //let nid;
    //row, nid = preserve.register(row, this.ban_btn_handle, {confirms:confirms, param:param, embed:embed})
    //await param.message.deferReply();
    //param.message.deferUpdate()
    let tm = await param.message.reply({content:"building message",ephemeral:true})
    tm.delete()
    let mess = await param.send_loc.send({embeds:[embed],components:[row]})

    //global.preserve.interactions[nid].data.mess = mess;
    await preserve.register(mess.id, this.ban_btn_handle, {user_id:param.user.id, settings:settings, author:param.message.author.id, mess:mess, confirms:confirms, param:param, embed:embed})
    //await param.message.editReply({embeds:[embed],components:[row]})
    //if(mess.partial) mess = mess.fetch()
    
    /*
    if(param.thread){
        let th = await client.channels.cache.get(param.send_loc.channelId).threads.create({
            name: param.user.user.username,
            reason: 'Ban request discussion',
            autoArchiveDuration: 60,
            type: ChannelType.PublicThread,
        })
    }*/

    async function rec_read(){
        const collectorFilter = i => i.user.id != param.message.author.id && !confirms.includes(i.user.id);
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
    //await rec_read();
  },
  ban_btn_handle: async function ban_btn_handle(data, interaction){
    EmbedBuilder = require("discord.js").EmbedBuilder
    data.mess = await interaction.channel.messages.fetch(data.mess.id)
    data.embed = new EmbedBuilder(data.embed)
    let client = interaction.client

    return new Promise(async (res, rej) => {
        interaction.deferUpdate();
        switch(interaction.customId){
            case "confirm":
                //if(data.confirms.includes(interaction.author.id))
                   // break
                data.confirms.push(interaction.author.id)
                let comb_mod = ""
                for(let mod of data.confirms){
                    comb_mod += "<@" + mod + ">"
                    if(mod != data.confirms[data.confirms.length-1]) comb_mod += ","
                }
                data.embed.setFooter({text:data.confirms.length - 1 + "/1 confirmations"})
                data.embed.data.fields[0].value = comb_mod

                if(data.confirms.length >= 2){
                    let ban_embed = new EmbedBuilder()
                        .setTitle("Banned from Supernoobs")
                        .setFooter({text:"You have been banned from this server. Maybe in another life, we could have been friends. But not in this one. 💔"})
                        .setColor(data.settings.defaultColor)
                        .setFields({name : "Reason", value : data.param.reason})
                    if(data.param.appeal) ban_embed.addFields({name : "Appeal id", value : "" + data.param.message.author.id})
                    let user = await client.users.cache.get(data.user_id);
                    let could_send = true
                    let could_ban = true
                    let could_del = true
                    data.embed.setTitle("Ban Confirmed, Awaiting User Cleanup");
                    data.mess.edit({embeds:[data.embed],components:[]})
                    try {
                        await user.send({embeds:[ban_embed]})
                    } catch (e) {
                        console.log(e)
                        could_send = false;
                    }
                    try{
                        user = interaction.guild.members.cache.get(user.id)
                        await user.ban({deleteMessageSeconds: 60 * 60 * 24 * 7, reason: data.param.reason})
                    } catch (e) {
                        console.log(e)
                        could_ban = false;
                    }
                    
                    data.embed.setTitle("Ban Confirmed" + (!could_send?" | Unable to Message":"") + (!could_ban?" | Unable to Ban":"") + (!could_del?" | Unable to Delete Msgs":""));
                    data.mess.edit({embeds:[data.embed],components:[]})
                } else {
                    data.mess.edit({embeds:[data.embed]})
                }
                break
            case "cancel":
                data.embed.setFooter({text:"canceled"})
                data.embed.setTitle("Ban Request Rejected")
                data.embed.addFields({name:"Removed By Staff:",value:"<@!"+data.author+">", inline : true})
                data.mess.edit({embeds:[data.embed],components:[]})
                break
        }
        res(data)
    })

  }
};
