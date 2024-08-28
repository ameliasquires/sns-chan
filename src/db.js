const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const llog = require("../src/logg")

const _db_raw = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../db/db.sqlite'),
    logging:false
});
let db = {_raw:_db_raw}

db.Tickets = _db_raw.define('Tickets', {
      ticket: DataTypes.TEXT,
      message: DataTypes.TEXT,
      status: DataTypes.TEXT,
      author: DataTypes.TEXT,
      name: DataTypes.TEXT,
      created: DataTypes.TEXT,
      messages: DataTypes.STRING,
      attachments: DataTypes.STRING,
      pfp: DataTypes.STRING,
}, {
});

db.Sticky = _db_raw.define('Sticky', {
    embed: DataTypes.BOOLEAN,
    embed_color: DataTypes.TEXT,
    channel: DataTypes.TEXT,
    message: DataTypes.TEXT,
    last_message: DataTypes.TEXT,
}, {
});

db.Auto_React = _db_raw.define('Auto_React', {
    channel: DataTypes.TEXT,
    emote: DataTypes.TEXT,
}, {
});

db.Timed_Message = _db_raw.define('Timed_Message', {
    embed: DataTypes.BOOLEAN,
    embed_color: DataTypes.TEXT,
    guild: DataTypes.TEXT,
    channel: DataTypes.TEXT,
    message: DataTypes.TEXT,
    last_message: DataTypes.TEXT,
    last_message_time: DataTypes.TEXT,
    delay: DataTypes.TEXT,
}, {
});

db.BattleShip = _db_raw.define('BattleShip', {
    status: DataTypes.TEXT,
    _id: DataTypes.TEXT,
    turn: DataTypes.INTEGER,
    p1_id: DataTypes.TEXT,
    p2_id: DataTypes.TEXT,
    p1_board: DataTypes.TEXT,
    p2_board: DataTypes.TEXT,
}, {
});

db.Track = _db_raw.define('Track', {
    user: DataTypes.TEXT,
    words: DataTypes.TEXT,
    track: DataTypes.BOOLEAN,
}, {
});

try {
    db.BattleShip.sync({force:true})
    db._raw.authenticate();
    llog.log('db connected');
} catch (error) {
    llog.error('Unable to connect to the database:', error);
}

_db_raw.sync()

const persist = require("node-persist")
let serialize = require('serialize-javascript');
function deserialize(i){
    return eval('(' + i + ')');
}

global.preserve = {}

global.preserve.interactions = persist.create({dir:"./.node-persist/interaction", parse:deserialize, stringify:serialize})
global.preserve.interactions.init()

global.preserve.blacklist = persist.create({dir:"./.node-persist/blacklist", parse:deserialize, stringify:serialize})
global.preserve.blacklist.init()

module.exports = db