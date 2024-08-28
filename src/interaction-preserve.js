const { stringify } = require('querystring');

module.exports = {
    register: async (id, fn, data) => {
        await global.preserve.interactions.setItem(id, {
            data:data,
            fn:fn
        })
    },
}