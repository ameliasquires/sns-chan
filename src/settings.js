let debug = 0;
let server = debug?"545076257369358336":"486957006628847626";
let admin_c  = debug?"545076257369358338":"753145819820982282";
module.exports = {
    "defaultColor": [43,45,49],
    "allowed-servers":["486957006628847626","545076257369358336"],
    "preloads": {
        [server]: {
            [admin_c]:{
                name: "admin-chan",
            },
            "748790869938929737":{
                name: "logging",
            },
            "825023574221783102":{
                name: "general"
            },
            "1200889277786116121":{
                name: "staff-actions"
            }
        }
    }
}