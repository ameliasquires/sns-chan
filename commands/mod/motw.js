const Discord = require("discord.js")
const { EmbedBuilder } = require("discord.js");
const { PermissionsBitField } = require('discord.js');
const settings = require("../../src/settings")
const fs = require('fs')
let config_loc = __filename+".json"
let config = JSON.parse(fs.readFileSync(config_loc))
module.exports = {
  name: "motw",
  command: ["motw"],
  mod_only:true,
  config:config,
  config_loc:config_loc,
  main(client,Discord,message,args) {
      var cmd = message.content.slice(9).split(/ +/g);
      var name = cmd.shift();
      var image = cmd.join(" ");
      this.exec(client,{message:message,name:name,image:image})
  },
  s_options:[{type:"user",name:"user",desc:"member of the week!",required:true,autocomplete:false},
            {type:"string",name:"image",desc:"your fancy motw image:3",required:true,autocomplete:false}],
  s_main(client,Discord,interaction){
    this.exec(client,{name:"<@!"+interaction.options.getUser("user").id+">",image:interaction.options.getString("image"),message:interaction})
    interaction.reply({content:"all done:3",ephemeral: true})
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