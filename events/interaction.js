const { ActivityType , PermissionsBitField} = require("discord.js");
const fs = require('fs')
const path = require("path");
const { EmbedBuilder } = require("discord.js");
let db = require("../src/db")
let settings = require('../src/settings')
let util = require("../src/util")
const llog = require("../src/logg")

let config_loc = __filename+".json"
module.exports = {
    name : "interactionCreate",
    config_loc : config_loc,
    async main (client,Discord){
        await db._raw.sync()
        let config = JSON.parse(fs.readFileSync(config_loc))
        client.on("interactionCreate", async(interaction) => {
            llog.debug("interaction " + interaction.user.id);
            
            if(interaction.guild==null)return
            if(!settings["allowed-servers"].includes(interaction.guild.id))
                return llog.error("denied interaction from (guild)"+interaction.guild.id)
            let date = new Date()
            interaction.author = interaction.user
            if(interaction.isChatInputCommand() || interaction.isUserContextMenuCommand()){
                
                await interaction.guild.members.fetch()
                interaction.user = interaction.guild.members.cache.get(interaction.user.id)
                let mod = util.is_mod(interaction.member)
                let command = global.s_commands.find(o => o.name === interaction.commandName)
                if(command.command.config.mod_respect_restrict) mod = false
                
                if(!((!command.command.config.restrict||command.command.config.restrict.length==0||command.command.config.restrict.includes(interaction.channel.id))&&
                    (!command.command.config.restricted||command.command.config.restricted.length==0||!command.command.config.restricted.includes(interaction.channel.id)))
                    &&!(!command.command.config.mod_respect_restrict&&mod)&&!interaction.isUserContextMenuCommand())
                    return interaction.reply({content:"you cannot send this here! try `sns help` for more info",ephemeral:true})
                if(command==null)
                    return;
                
                let uid = interaction.user.id;

                if(!mod&&command.command.last_command[uid]!=null&&(date.getTime()-command.command.last_command[uid].getTime())/1000<command.command.config.cooldown)
                    return interaction.reply({content:"this command is on cooldown for "+
                        ((date.getTime()-command.command.last_command[uid].getTime())/1000).toFixed(2)+"/"+command.command.config.cooldown+"s",ephemeral:true})
                
                command.command.last_command[uid] = new Date();
                await command.command[interaction.isChatInputCommand()?"s_main":"c_main"](client,Discord,interaction);

            } else if (interaction.isAutocomplete()){
                llog.log(interaction.user.id + " : autocomplete")
                const focused = interaction.options.getFocused(true);
                let command = global.s_commands.find(o => o.name === interaction.commandName)
                if(interaction.options._subcommand!=null){
                    //command = command.options.find(o => o.name === interaction.options._subcommand).options.find(o => o.name === focused.name)
                    command = (command.command.s_options.find(o => o.name === interaction.options._subcommand))
                    command.opt = command.options;
                }
                let subcommand = command.opt.find(o => o.name === focused.name)

                let autocomplete = (typeof subcommand.autocomplete === 'function' ? await  subcommand.autocomplete(interaction) :  subcommand.autocomplete);
                const filtered = autocomplete.filter(choice => choice.startsWith(focused.value));
                if(filtered.length>25)
                    filtered.length=25
                try{
                await interaction.respond(
                    filtered.map(choice => ({ name: choice, value: choice })),
                );
                } catch(e) {
                    llog.error(e)
                    llog.error("failed to send autocomplete")
                }

            } else if (interaction.isButton()){
                llog.log(global.preserve.interactions.length())
                let sel = await global.preserve.interactions.getItem(interaction.message.id)
                if(sel != null){
                    sel.data = await sel.fn(sel.data, interaction);
                    global.preserve.interactions.setItem(interaction.message.id, sel)
                }
                    //console.log(interaction)
                    /*
                let cid = interaction.customId.split(":")
                if(cid.length > 1){
                    interaction.customId = cid[1];
                    let sel = global.preserve.interactions[parseInt(cid[0])]
                    global.preserve.interactions[parseInt(cid[0])].data = await sel.fn(sel.data, interaction)
                }
                */
            }
        })

    },
}