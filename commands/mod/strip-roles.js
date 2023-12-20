const Discord = require("discord.js")
const { EmbedBuilder } = require("discord.js");
const { PermissionsBitField } = require('discord.js');
const settings = require("../../src/settings")
const fs = require('fs')
let config_loc = __filename+".json"
let config = JSON.parse(fs.readFileSync(config_loc))
module.exports = {
  name: "strip-roles",
  command: ["strip-roles"],
  mod_only:true,
  config:config,
  config_loc:config_loc,
  async main(client,Discord,message,args) {
      let mentioned = [];
      let failed = 0;
        message.mentions.users.map( o => {
            try{
                message.guild.members.cache.get(o.id).roles.remove(member.roles.cache)
            }catch(e){
                failed++
            }
      })
      if(failed!=0) message.reply("failed "+failed+" modifications (permission error)")
      //this.exec(client,{message:message,user:user})
  },
  exec(client,param){
    const motw = new EmbedBuilder()
        .setTitle("Member of the Week")
        .setColor(settings.defaultColor)
        .setDescription(param.name)
        .setImage(param.image);
      param.message.channel.send({ embeds: [motw] }); 
  }
};