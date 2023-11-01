const Discord = require("discord.js")
const { EmbedBuilder } = require("discord.js");
const { PermissionsBitField, MessageAttachment } = require('discord.js');
const {upload_limit} = require("../../src/util")
const settings = require("../../src/settings")
const fs = require('fs');
let db = require("../../src/db")
let config_loc = __filename+".json"
let config = JSON.parse(fs.readFileSync(config_loc))
module.exports = {
  name: "ticket",
  command: ["ticket"],
  mod_only:true,
  config:config,
  config_loc:config_loc,
  async main(client,Discord,message,args) {
    let matt = Array.from(message.attachments, ([name, value]) => ({ name, value }))
    
    let action = args[0];
    let ticket_id = args[1];
    args.shift();args.shift();
    let r_message = args.join(' ')
    
    this.exec(client,{att:matt,action:action,ticket_id:ticket_id,r_message:r_message,message:message})
  },
  s_options:[{type:"string",name:"ticket",desc:"ticket id",required:true,autocomplete: async function(){ let tik = await db.Tickets.findAll({attributes:['ticket'],where:{status:'open'}}); let out = []; for(let t of tik) out.push(t.ticket); return out; }},
            {type:"string",name:"action",desc:"operation to perform",required:true,autocomplete:false,choices:["reply","close","dump"]},
            {type:"string",name:"message",desc:"message to reply with",required:false,autocomplete:false},
            {type:"attachment",name:"attachment",desc:"attachment to reply with",required:false,autocomplete:false}],
  async s_main(client,Discord,interaction){
    this.exec(client,{message:interaction,att:[interaction.options.getAttachment("attachment")] ?? [],action:interaction.options.getString("action"),
                    ticket_id:interaction.options.getString("ticket"),r_message:interaction.options.getString("message")})
  },
  async exec(client,param){
    let tickets;
    let date = new Date().toLocaleString()
    switch(param.action){
        case 'reply':
        case 'respond':
        case 'r':
            if(param.r_message==null&&param.att==null)
                return param.message.reply("you must provide a message or attachment")
            tickets = await db.Tickets.findAll({where:{status:'open',ticket:param.ticket_id}})
            if(tickets.length==0){
                tickets = await db.Tickets.findAll({where:{ticket:param.ticket_id}})
                if(tickets.length==0)
                    return param.message.reply("ticket not found:c")
                return param.message.reply("ticket is not open")
            }
            let ticket = tickets[0]
            let messages = JSON.parse(ticket.messages)
            messages.push({message:param.r_message,attachments:param.att,mod:true})
            db.Tickets.update({'messages':JSON.stringify(messages)},{where:{id:ticket.id}})
            
            const embed = new EmbedBuilder()
                .setTitle("Updated Ticket | "+ticket.ticket)
                .setColor(settings.defaultColor)
                .setDescription("Message: '"+param.r_message+"'")
                .setFooter({text:"Created: "+date})
            let smatt = []
            for(let att of param.att){
                if(att!=null)
                    smatt.push({attachment:att?.value?.url ?? att?.url})
            }
            param.message.client.users.cache.get(ticket.author).send({embeds:[embed],files:smatt})
            param.message.reply("updated ticket "+ticket.ticket);
            break;
        case 'close':
            tickets = await db.Tickets.findAll({where:{status:'open',ticket:param.ticket_id}})
            if(tickets.length==0){
                tickets = await db.Tickets.findAll({where:{ticket:param.ticket_id}})
                if(ticket.length==0)
                    return param.message.reply("ticket not found:c")
                return param.message.reply("ticket is already closed")
            }
            db.Tickets.update({'status':'closed'},{where:{id:tickets[0].id}})
            param.message.reply("closed ticket "+tickets[0].ticket);
            break;
        case 'dump':
        case 'list':
            if(param.ticket_id==null) return param.message.reply("you must provide a ticket id")
            tickets = await db.Tickets.findAll({where:{ticket:param.ticket_id}})
            if(tickets.length==0){
                return param.message.reply("ticket not found:c")
            }
            let filename = "/tmp/"+tickets[0].ticket+".json"
            fs.writeFileSync(filename,tickets[0].messages)
            let stats = fs.statSync(filename)
            if(stats.size / (1024*1024) > upload_limit(param.message.guild))
                return param.message.reply("file too large:( file is "+stats.size / (1024*1024)+"mb")
            param.message.reply({files:[filename]})
            break;
        default:
            param.message.reply("unknown action, try `sns help ticket`")
    }
  }
};