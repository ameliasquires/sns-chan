module.exports = {
    levels : {
        nothing : 0,
        error : 1,
        log : 2,
        debug : 3
    },

    get_time(){
        let date = new Date();
        return `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    },
    get_level(){
        return global._logg_level ?? this.set_level(this.levels.debug);
    },
    set_level(level){
        return global._logg_level = level;
    },
    color(str, code){
        return "\x1b[" + code + "m" + str + "\x1b[0m";
    },

    error(str) {
        if(this.get_level() >= this.levels.error)
            console.log(this.color("["+this.get_time()+"]: ", 31) + this.color(str, 90));
    },
    log(str) {
        if(this.get_level() >= this.levels.log)
            console.log(this.color("["+this.get_time()+"]: ", 90) + str);
    },
    debug(str) {
        if(this.get_level() >= this.levels.debug)
            console.log(this.color("["+this.get_time()+"]: " + str, 90));
    }
}