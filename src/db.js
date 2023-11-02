const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

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
    //db.BattleShip.sync({force:true})
    db._raw.authenticate();
    console.log('db connected');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

_db_raw.sync()

module.exports = db