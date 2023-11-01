const fs = require('fs')
const path = require("path");
const { EmbedBuilder,ActionRowBuilder,ButtonBuilder,ButtonStyle  } = require("discord.js");
let config_loc = __filename+".json"
let settings = require("../../src/settings")
let config = JSON.parse(fs.readFileSync(config_loc))

//get command names
let command_names = ["help"]
fs.readdirSync(path.join(__dirname+"/..")).forEach(folder => {
    fs.readdirSync(path.join(__dirname+"/../"+folder)).forEach(file => {
        if(path.extname(file)==".js"){
            if(path.join(__dirname+"/../"+folder+"/"+file)!=__filename){
                let info = require("../"+folder+"/"+file)
                //let commands = info.command.length>3?info.command.slice(0,3).join(",")+"...":info.command.join(",")
                command_names.push(info.name)
            }
        
        }
    })
})
//

module.exports = {
    name : "help",
    command: ["help"],
    mod_only: false,
    config:config,
    config_loc:config_loc,
    async main (client,Discord,message,args){
        this.exec(client,{message:message,specify:args[0]})
    },
    s_options:[{type:"string",name:"command",desc:"command to be specified",required:false,autocomplete:false,choices:command_names}],
    async s_main(client,Discord,interaction){
        this.exec(client,{message:interaction,specify:interaction.options.getString("command")})
    },
    async exec(client,param){
        if(param.specify!=null){
            let info = null
            fs.readdirSync(path.join(__dirname+"/..")).forEach(folder => {
                fs.readdirSync(path.join(__dirname+"/../"+folder)).forEach(file => {
                    if(path.extname(file)==".js"){
                        let tinfo = require("../"+folder+"/"+file)
                        if(tinfo.name==param.specify||tinfo.command.includes(param.specify))
                            info=tinfo
                    }
                })
            })
            if(info==null)
                return param.message.reply({content:"command not found:c",ephemeral: true})
            let restricted = info.config.restricted.length==0?"undefined":info.config.restricted.join(",")
            let restrict = info.config.restrict.length==0?"undefined":info.config.restrict.join(",")
            const embed = new EmbedBuilder()
                .setTitle(info.name)
                .setColor(settings.defaultColor)
                .addFields([{
                    name:"commands/subcommands",
                    value:info.command.join(",")
                },{
                    name:"description",
                    value:  info.config.desc == undefined ? "undefined" : info.config.desc
                },{
                    name:"usage",
                    value:  info.config.usage == undefined ? "undefined" : info.config.usage
                },{
                    name:"misc",
                    value:"cooldown: "+info.config.cooldown+", restricted channels: ["+restricted+"], restrict to channels: ["+restrict+"], "+(info.s_main!=null?"supports slash commands":"does not support slash commands")
                }])
                param.message.reply({embeds:[embed]})
            return
        }
        //message.reply("not done yet:( give ans-chan some hugs and headpats for faster development")
        let pages = []
        let page = 0
        fs.readdirSync(path.join(__dirname+"/..")).forEach(folder => {
            const embed = new EmbedBuilder()
                .setTitle(folder)
                .setColor(settings.defaultColor)
            let count = 0;
            fs.readdirSync(path.join(__dirname+"/../"+folder)).forEach(file => {
                if(path.extname(file)==".js"){
                    count++;
                    let info = require("../"+folder+"/"+file)
                    let commands = info.command.length>3?info.command.slice(0,3).join(",")+"...":info.command.join(",")
                    embed.addFields([{
                        name:info.name + " [" + commands + "]",
                        value:info.config.desc
                    }])
                    /*page.push({
                        name:info.name,
                        subcommands:info.command,
                        desc:info.desc,
                        cooldown:cooldown
                    })*/

                }
            })
            embed.setFooter({text:"use `sns help {command}` to get more info • "+count+" items"})
            pages.push(embed)
        })
        const last = new ButtonBuilder()
            .setCustomId('last')
            .setEmoji('⬅️')
            .setStyle(ButtonStyle.Primary)
        const next = new ButtonBuilder()
            .setCustomId('next')
            .setEmoji('➡️')
            .setStyle(ButtonStyle.Primary)
        const row = new ActionRowBuilder()
            .addComponents(last,next);
        let mess = await param.message.reply({embeds:[pages[page]],components:[row]})
        async function rec_edit(mess,page){
            const collectorFilter = i => i.user.id === param.message.author.id;
            try {
                const confirmation = await mess.awaitMessageComponent({ filter: collectorFilter, time: 60000000 });
                if(confirmation.customId == "next"){
                    if(page+1<pages.length)
                        page++;
                    else
                        page=0;
                    mess.edit({embeds:[pages[page]]})
                    rec_edit(mess,page)
                    confirmation.deferUpdate()
                }
                if(confirmation.customId == "last"){
                    if(page-1>=0)
                        page--;
                    else
                        page=pages.length-1;
                    mess.edit({embeds:[pages[page]]})
                    rec_edit(mess,page)
                    confirmation.deferUpdate()
                }
            } catch (e) {
                
            }
        }
        await rec_edit(mess,page)
    }
}