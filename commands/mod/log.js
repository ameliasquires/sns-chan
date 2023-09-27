const Discord = require("discord.js")
const settings = require("../../src/settings")
const fs = require('fs')
const {upload_limit} = require("../../src/util")
const path = require('path')
let config_loc = __filename+".json"
let config = JSON.parse(fs.readFileSync(config_loc))
module.exports = {
  name: "log",
  command: ["log"],
  mod_only:true,
  config:config,
  config_loc:config_loc,
  main(client,Discord,message,args) {
    this.exec(message)
  },
  s_main(client,Discord,interaction){
    this.exec(interaction)
  },
  exec(message){
    let filename = path.join(__dirname+"../../../log")
    let stats = fs.statSync(filename)
    if(stats.size / (1024*1024) > upload_limit(message.guild))
        return message.reply("file too large:( file is "+stats.size / (1024*1024)+"mb")
    message.reply({files:[filename]})
  }
};