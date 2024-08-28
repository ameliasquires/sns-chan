//process mods redirection
const fs = require("fs");
var access = fs.createWriteStream('./log');
process.stdout.write = process.stderr.write  = (function(write) {
  return function(string, encoding, fd) {
      write.apply(process.stdout, arguments)
      access.write(string)
  }
})(process.stdout.write)
process.title = "sns\-chan"
const llog = require("./src/logg")
llog.log("["+process.pid+"] running under the name "+process.title)
/**
 * Module Imports
 */

async function main(){
  const { Client, Collection, EmbedBuilder, ActivityType, GatewayIntentBits, Partials, Events, SlashCommandBuilder, PermissionsBitField} = require("discord.js");
  const Discord = require('discord.js');
  const dotenv = require("dotenv").config();
  const TOKEN = process.env.TOKEN;
  const path = require("path");
  let db = require("./src/db");
  let util = require("./src/util")
  const { ModalBuilder, REST, Routes, ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildBans,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.DirectMessageReactions,
      GatewayIntentBits.DirectMessageTyping,
      //GatewayIntentBits.GuildPresences
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User]
  });

  client.login(TOKEN);

  function update_options(scom,options){
    for(let opt of options){
      let autocomplete = opt.autocomplete!=null&&opt.autocomplete!=false;
      switch(opt.type){
        case 'string':
          scom.addStringOption(option => {
            option.setName(opt.name)
              .setDescription(opt.desc)
              .setRequired(opt.required)
              .setAutocomplete(autocomplete)
              if(!autocomplete&&opt.choices!=null&&opt.choices!=false){
                if(typeof opt.choices[0] === 'string'){
                  for(let i in opt.choices) opt.choices[i] = {name:opt.choices[i],value:opt.choices[i]}
                }
                option.setChoices(...opt.choices)
              } 
              return option;
            })
          break;
        case 'bool': case 'boolean':
          scom.addBooleanOption(option =>
            option.setName(opt.name)
              .setDescription(opt.desc)
              .setRequired(opt.required))
          break;
        case 'channel':
          scom.addChannelOption(option =>
          option.setName(opt.name)
            .setDescription(opt.desc)
            .setRequired(opt.required))
          break;
        case 'user':
          scom.addUserOption(option =>
          option.setName(opt.name)
            .setDescription(opt.desc)
            .setRequired(opt.required))
          break;
        case 'role':
          scom.addRoleOption(option =>
          option.setName(opt.name)
            .setDescription(opt.desc)
            .setRequired(opt.required))
          break;
        case 'attachment':
          scom.addAttachmentOption(option =>
          option.setName(opt.name)
            .setDescription(opt.desc)
            .setRequired(opt.required))
          break;
        case 'sub':
          scom.addSubcommand(subcommand => {
              subcommand
                .setName(opt.name)
                .setDescription("test")
              return update_options(subcommand, opt.options)
          })
          break;
      }
      
    }
    scom.opt = options
    return scom;
  }

  let commands = []
  let s_commands = []
  fs.readdirSync("./commands/").forEach(folder => {
    fs.readdirSync("./commands/"+folder).forEach(file => {
      if(path.extname(file)==".js"){
        try{
          let com = require("./commands/"+folder+"/"+file)
          com.last_command = {};
          commands.push(com)
          if(com.s_main!=null){
            let scom = new SlashCommandBuilder()
              .setName(com.name.replace(/ /g,'-'))
              .setDescription(com.config.desc)
            if(com.mod_only)
              scom.setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers)
            if(com.s_options!=null){
              update_options(scom,com.s_options);
            }
            scom = scom.toJSON()
            scom.command = com
            s_commands.push(scom)
          }
          if(com.c_main!=null){
            let ccom = new ContextMenuCommandBuilder()
              .setName(com.name.replace(/ /g,'-'))
              .setType(ApplicationCommandType.User)
            if(com.mod_only)
              ccom.setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers)
            ccom = ccom.toJSON()
            ccom.command = com
            s_commands.push(ccom)
          }
        } catch (e) {
          if(e.code=="ENOENT"){
            llog.error("[ENOENT] missing some config files:( run 'sh buildconfig.sh' to get them\nexiting~")
            process.exit(e.errno)
          }
          llog.error("["+e.code+"]"+" unexpected error:( something is wrong with the ./commands/*/* files\n****\n")
          llog.error(e)
          
          process.exit(e.errno)
        }
      }
    })
  })

  global.rest = new REST().setToken(TOKEN)
  global.c_commands = [new ContextMenuCommandBuilder()
    .setName('test')
    .setType(ApplicationCommandType.User)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)
]

  client.env = process.env
  global.commands = commands;
  global.s_commands = s_commands;
  global.recent_messages = [];

  fs.readdirSync("./events/").forEach(file => {
    if(path.extname(file)==".js")
      require("./events/"+file).main(client,Discord)
  })

  try{
    require("./src/webui")
  } catch(e) {
    llog.error("failed loading webui:c")
  }
}
main()
