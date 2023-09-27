const fs = require('fs')
const path = require("path");
let config_loc = __filename+".json"
const { PermissionsBitField, EmbedBuilder, AttachmentBuilder,ActionRowBuilder,ButtonBuilder,ButtonStyle } = require('discord.js');
let config = JSON.parse(fs.readFileSync(config_loc))
const util = require("../../src/util.js")
const sharp = require("sharp");
const db = require("../../src/db.js")
module.exports = {
    name : "battleship",
    command: ["battleship"],
    mod_only: true,
    config:config,
    config_loc:config_loc,
    async main (client,Discord,message,args){
        let uid2 = args[1];
        if(uid2[0]=='<') uid2 = (args[1].substring(2,args[1].length-1))
        this.exec(client,{action:args[0],message:message,user2:uid2})
    },
    async board_prev(args){
        const move_y = 82
        const move_x = 66
        let pos = {x:0,rx:32,y:0,ry:14,rotated:false}
        let max = {x:8,y:7}
        let embed = new EmbedBuilder()
            .setTitle("battleship")
            .setImage("attachment://battleship-board.png")

        const left = new ButtonBuilder()
            .setCustomId('left')
            .setEmoji('⬅️')
            .setStyle(ButtonStyle.Primary);
        const up = new ButtonBuilder()
            .setCustomId('up')
            .setEmoji('⬆️')
            .setStyle(ButtonStyle.Primary);
        const down = new ButtonBuilder()
            .setCustomId('down')
            .setEmoji('⬇️')
            .setStyle(ButtonStyle.Primary);
        const right = new ButtonBuilder()
            .setCustomId('right')
            .setEmoji('➡️')
            .setStyle(ButtonStyle.Primary);
        const turn = new ButtonBuilder()
            .setCustomId('turn')
            .setEmoji('🔄')
            .setStyle(ButtonStyle.Primary);
        const row1 = new ActionRowBuilder()
            .addComponents(left,up,down,right,turn);

        const shoot = new ButtonBuilder()
            .setCustomId('shoot')
            .setEmoji('🎯')
            .setStyle(ButtonStyle.Primary);
        const row2 = new ActionRowBuilder()
            .addComponents(shoot);
        //! TODO: randomize file name
        let to_add = [{
            input: "./img/battleship-board-sel.png",
            top: pos.rx,
            left: pos.ry,
            },]
        if(args.len!=null){
            for(let i = 1; i<args.len; i++){
                to_add.push({
                    input: "./img/battleship-board-sel.png",
                    top: pos.rotated?pos.rx:pos.rx+(move_x*i),
                    left: !pos.rotated?pos.ry:pos.ry+(move_y*i),
                    })
            }
        }
        args.len ??= 0;
        await sharp("./img/battleship-board.png")
        .composite(to_add).toFile("/tmp/battleship-board.png");
        const file = new AttachmentBuilder('/tmp/battleship-board.png');
        let mess = args.mm;
        if(args.mm==null)
            mess = await args.message.reply({embeds:[embed],files:[file],components:[row1,row2]});
        else mess = await args.mm.edit({embeds:[embed],files:[file],components:[row1,row2]});
        args.mm = mess;
        async function rec_edit(mess){
            const collectorFilter = i => i.user.id === args.message.author.id;
            try {
                const confirmation = await mess.awaitMessageComponent({ filter: collectorFilter, time: 60000000 });
                let oldpos = util.deepCopy(pos);
                if(confirmation.customId == "down"){
                    pos.x--;
                    pos.rx+=move_x;
                } else if(confirmation.customId == "up"){
                    pos.x++;
                    pos.rx-=move_x;
                } else if(confirmation.customId == "right"){
                    pos.y++;
                    pos.ry+=move_y;
                } else if(confirmation.customId == "left"){
                    pos.y--;
                    pos.ry-=move_y;
                    
                } else if(confirmation.customId == "shoot"){
                    //await mess.delete()
                    pos.mm = mess;
                    await confirmation.deferUpdate()
                    return pos;
                } else if(confirmation.customId == "turn"){
                    pos.rotated = !pos.rotated
                }

                let outofbounds = false
                if(!pos.rotated||args.len==0){
                    outofbounds ||= (args.len!=0&&-pos.x+args.len>max.x);
                    outofbounds ||= (args.len==0&&-pos.x>=max.x);
                    outofbounds ||= (pos.y>=max.y);
                } else {
                    outofbounds ||= (args.len!=0&&pos.y+args.len>max.y);
                    //outofbounds ||= (args.len==0&&pos.y>max.y);
                    outofbounds ||= (-pos.x>=max.x);
                }
                outofbounds ||= (pos.x==1||pos.y==-1);
                
                if(outofbounds){
                    pos = oldpos;
                    await confirmation.deferUpdate()
                    return rec_edit(mess)
                }
                let to_add = [{
                    input: "./img/battleship-board-sel.png",
                    top: pos.rx,
                    left: pos.ry,
                    },
                ]
                if(args.len!=null&&args.len!=0){
                    for(let i = 1; i<args.len; i++){
                        to_add.push({
                            input: "./img/battleship-board-sel.png",
                            top: pos.rotated?pos.rx:pos.rx+(move_x*i),
                            left: !pos.rotated?pos.ry:pos.ry+(move_y*i),
                            })
                    }
                }
                await sharp("./img/battleship-board.png")
                .composite(to_add).toFile("/tmp/battleship-board.png");
                const file = new AttachmentBuilder('/tmp/battleship-board.png');
                await mess.edit({embeds:[embed],files:[file], components: [row1,row2]});
                await confirmation.deferUpdate()
                return rec_edit(mess)
                
            } catch (e) {
                console.log(e)
            }
        }
        return await rec_edit(mess)
    },
    async exec(client,args){
        switch(args.action){
            case 'aim':
                
                break;
            case 'create':
                let planned = [4,3,2,1]
                let placements = []
                let newboard = []
                for(let i = 0; i!=8; i++){
                    newboard.push([])
                    for(let z = 0; z!=7; z++)
                        newboard[i].push('.');
                }

                args.rotated = false;
                let temp;
                for(let l of planned){
                    args.len = l
                    temp = await this.board_prev(args)
                    //console.log(temp)
                    temp.len = l;
                    placements.push(temp)
                }
                await temp.mm.edit({embeds:[],files:[],components:[],content:"wowa"})
                for(let p of placements){
                    if(p.rotated){
                        for(let i = 0; i!=p.len; i++)
                            newboard[-p.x][p.y+i] = 'b'
                    } else {
                        for(let i = 0; i!=p.len; i++)
                            newboard[-p.x+i][p.y] = 'b'
                    }
                }

                db.BattleShip.create({
                    turn:0,
                    p1_id:args.message.author.id,
                    p2_id:args.user2,
                    p1_board:JSON.stringify(newboard),
                    p2_board:'null',
                })

                break;
        }
    }
}