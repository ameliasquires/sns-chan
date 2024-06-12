const { stringify } = require('querystring');
let serialize = require('serialize-javascript');
function deserialize(i){
    return eval('(' + i + ')');
  }
global.preserve = {}
global.preserve.interactions = require('node-persist')
global.preserve.interactions.initSync({dir:"./.node-persist/interaction",parse:deserialize,
     stringify:serialize})

module.exports = {
    register: async (id, fn, data) => {
        await global.preserve.interactions.setItem(id, {
            data:data,
            fn:fn
        })
    },
}