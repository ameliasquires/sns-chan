const Discord = require("discord.js")
const settings = require("../../src/settings")
const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require('fs')
const {upload_limit} = require("../../src/util")
const path = require('path')
let config_loc = __filename+".json"
let config = JSON.parse(fs.readFileSync(config_loc))
module.exports = {
  name: "whois",
  command: ["whois","getuser","getrole"],
  mod_only:true,
  config:config,
  config_loc:config_loc,
  async main(client,Discord,message,args) {
    if(args.length==0)
        return message.reply("bad usage, try `sns help whois`")
    await message.guild.members.fetch()
    
    let error = ""
    let users_m = Object.fromEntries(message.mentions.users)
    for(let k of Object.keys(users_m)){
        let user = message.guild.members.cache.get(users_m[k].id)
        if(user==null)
            error+=("user "+users_m[k].id+" not found\n")
        else 
            this.p_user(client,Discord,message,user)
    }
    let roles_m = Object.fromEntries(message.mentions.roles)
    for(let k of Object.keys(roles_m)){
        let role = message.guild.roles.cache.get(roles_m[k].id)
        if(role==null)
            error+=("role "+roles_m[k].id+" not found\n")
        else 
            this.p_role(client,Discord,message,role)
    }
    for(let a of args){
        if(a[0]!='<'){
            let role = message.guild.roles.cache.get(a)
            let user = message.guild.members.cache.get(a)
            if(role!=null)
                this.p_role(client,Discord,message,role)
            else if(user!=null)
                this.p_user(client,Discord,message,user)
            else 
                error+=("user or role "+a+" not found\n")
        }
    }
    if(error!="")
        message.reply(error)
    //this.p_user(client,Discord,message,user)
  },
  s_options:[{type:"role",name:"role",desc:"roles to get info on",required:false,autocomplete:false},
            {type:"user",name:"user",desc:"users to get info on",required:false,autocomplete:false}],
  async s_main(client,Discord,interaction){
    let role = interaction.options.getRole("role")
    let user = interaction.options.getUser("user")
    if(role==null&&user==null)
        return interaction.reply({content:"select atleast one option",ephemeral: true})
    if(role!=null)
        this.p_role(client,Discord,interaction,role)
    if(user!=null){
        await interaction.guild.members.fetch()
        user = interaction.guild.members.cache.get(user.id)
        this.p_user(client,Discord,interaction,user)
    }
  },
  p_user(client,Discord,message,user){
    let join = new Date(parseInt(user.joinedTimestamp / 1000, 10)*1000).toLocaleDateString(undefined,{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    let created = new Date(parseInt(user.user.createdAt / 1000, 10)*1000).toLocaleDateString(undefined,{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    let mod = user.permissions!=null&&user.permissions?.has(PermissionsBitField.Flags.KickMembers)
    let roles = ""
    //console.log(message.mentions.users)
    message.channel.send("loading ids").then(async(m)=>{
        await m.edit("<@!"+user.id+">")
        m.delete()
    })
    for(let r of user._roles)
        roles+="<@&"+r+"> "
    const embed = new EmbedBuilder()
        .setAuthor({name:user.user.username,iconURL:user.displayAvatarURL()})
        .setThumbnail(user.displayAvatarURL())
        .setDescription("<@!"+user.id+">"+(mod?" +able to use mod commands":""))
        .addFields([{ name: 'Joined', value:join , inline: true },
                    { name: 'Created', value:created , inline: true },
                    { name: 'Roles ['+user._roles.length+']', value:roles }])
        .setFooter({text:"id:"+user.id})
        .setColor(settings.defaultColor)
    message.reply({embeds:[embed]})
  },
  async p_role(client,Discord,message,role){
    let members = " "
    //console.log(message.guild.members)
    let members_m = Object.fromEntries(message.guild.roles.cache.get(role.id).members)
    let members_a = []
    for(let k of Object.keys(members_m)){
        let new_m = "<@"+members_m[k].id+"> "
        if((members+new_m).length>1024-3){
            members+="..."
            break;
        }
        members+=new_m
    }
    if(members!=" "){
        message.channel.send("loading ids").then(async(m)=>{
            await m.edit(members)
            m.delete()
        })
    }
    let mod = role.permissions!=null&&role.permissions?.has(PermissionsBitField.Flags.KickMembers)
    const embed = new EmbedBuilder()
        .setTitle(role.name)
        .setDescription("<@&"+role.id+">"+(mod?" +able to use mod commands":""))
        .addFields([{ name: 'Mentionable', value:(role.mentionable?"true":"false"), inline: true },
                    {name: 'Users ['+role.members.size+"]",value:members}])
        .setFooter({text:"id:"+role.id})
        .setColor(settings.defaultColor)
    message.reply({embeds:[embed]})
  }
};
