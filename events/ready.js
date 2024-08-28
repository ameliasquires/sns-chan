const { ActivityType } = require("discord.js");
const fs = require('fs')
const path = require("path");
const { EmbedBuilder } = require("discord.js");
let db = require("../src/db")
let settings = require('../src/settings')
let config_loc = __filename+".json"
const llog = require('../src/logg')

module.exports = {
    name : "ready",
    config_loc : config_loc,
    async main (client,Discord){
        await db._raw.sync()
        let config = JSON.parse(fs.readFileSync(config_loc))
        client.once("ready", async () => {

            //preload
            global.channels = {}
            for(let guild of Object.keys(settings.preloads)){
                let mem = Object.fromEntries(await client.guilds.cache.get(guild).members.fetch())
                //console.log(Object.keys(mem))

                for(let chan of Object.keys(settings.preloads[guild])){
                    let t_add = client.guilds.cache.get(guild).channels.cache.get(chan)
                    if(t_add==null)
                        llog.error("failed to load "+chan+" from "+guild+", skipping");
                    else
                        global.channels[settings.preloads[guild][chan].name] = t_add;

                    
                }
            }
            //end

            //register slash/user commands
            let passed = 0;
            let failed = 0;
            client.guilds.cache.forEach((g)=>{
                if(settings["allowed-servers"].includes(g.id)){
                    g.commands.set(global.s_commands).catch((e)=>{
                        llog.error("unable to load commands for " + g.id + "\n\n****\n")
                        llog.error(e)
                    })
                    passed++;
                } else {
                    failed++;
                }
            })
            llog.log("loaded "+global.s_commands.length+" slash commands for "+passed+" guilds, and denied "+failed+" guilds")
            //done w/ slash commands
            
            llog.log("online!")
            function set_pres() {
                client.user.setPresence({
                    activities: [{ name: config.status.value, type: ActivityType[config.type.value] }]
                });
            }
            set_pres()
            setInterval(set_pres,36000)
            setInterval(async()=>{
                //timed messages
                let timed = await db.Timed_Message.findAll();
                let cur = new Date()
                for(let t of timed){
                    let delay = parseInt(t.delay)
                    if(t.last_message_time!='null')
                        t.last_message_time = parseInt(t.last_message_time)
                    //console.log(new Date(parseInt(t.last_message_time)),(new Date(t.last_message_time)).getTime(),delay)
                    if(t.last_message_time=='null'||cur.getTime()-(new Date(t.last_message_time)).getTime()>delay){
                        
                        let gu = await client.guilds.fetch(t.guild)
                        let channel = await gu.channels.fetch(t.channel)
                        if(t.embed){
                            let embed = new EmbedBuilder()
                                .setDescription(t.message)
                                .setColor(t.embed_color)
                            channel.send({embeds:[embed]})
                        } else {
                            channel.send(t.message)
                        }
                        //console.log(new Date(t.last_message_time).getTime(),(new Date(t.last_message_time)).getTime()+delay)
                        if(t.last_message_time=='null')
                            db.Timed_Message.update({last_message_time : cur.getTime().toString()},{ where: {id: t.id}})
                        else
                            db.Timed_Message.update({last_message_time : (new Date((new Date(t.last_message_time)).getTime()+delay)).getTime().toString()},{ where: {id: t.id}})
                    }
                }
                //done w/ timed messages
            },config.timed_interval.value)
        })

    },
}