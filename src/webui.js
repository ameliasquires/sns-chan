
const key = "0d68ac83-4214-4eb3-8b3e-fe4463f43d9d"
const bodyParser = require("body-parser");
const express = require('express');
const fs = require('fs');
let db = require("../src/db");
const path = require("path")
const Tickets = db.Tickets

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const port = 7003;

app.get('/tickets', async (req, res) => {
  res.sendFile(path.join(__dirname+'/../html/tickets.html'))
})
app.post('/tickets/data', async (req, res) => {
  if(req.body.key == key)
    res.send(await Tickets.findAll())
  else
    res.send('failed')
})
app.post('/tickets/edit', async (req, res) => {
  if(req.body.key == key){
    console.log('pass')
		res.send('pass')
  }
  else
    res.send('failed')
})




let root_path = path.join(__dirname+"/../")
let settings_dirs = [
  path.join(__dirname+"/../events"),
]

fs.readdirSync(path.join(__dirname+"/../commands/")).forEach(async file => {
  let full_path = path.join(__dirname+"/../commands/"+file)
  let stat = fs.statSync(full_path);
  if(stat.isDirectory()){
    settings_dirs.push(full_path)
  }
})

let clean_settings_dirs = [];
for(let i = 0; i != settings_dirs.length; i++){
  clean_settings_dirs[i] = settings_dirs[i].slice(root_path.length)
}

//console.log(settings_dirs)
let settings_full = {};

for(let dir of settings_dirs){
  let fdir = dir.slice(root_path.length);

  fs.readdirSync(dir).forEach(async file => {
    let full_path = path.join(dir+"/"+file)
    let stat = fs.statSync(full_path);
    if(!stat.isDirectory() && file.endsWith(".js.json")){
      if(settings_full[fdir] == null){
        settings_full[fdir] = []
      }

      settings_full[fdir].push(file.slice(0,-8))
    }

  })
}

console.log(settings_full)
app.get('/settings/', async (req, res) => {
  res.sendFile(path.join(__dirname+'/../html/settings.html'))
})

app.post('/settings/data/', async (req, res) => {
  if(req.body.key != key)
    return res.send('failed')
  let data = {data:settings_full,sel:"null"}
  res.send(JSON.stringify(data))
})


for(let ddir in settings_full){
  for(let dir of settings_full[ddir]){
    let at = ddir + "/" + dir
    app.post('/settings/'+at+'/data', async (req, res) => {
      if(req.body.key != key)
        return res.send('failed')
      let c = fs.readFileSync(path.join(__dirname+"/../"+at+".js.json"))
      let data = {data:settings_full,sel:c.toString()}
      res.send(JSON.stringify(data))
    })
    console.log('/settings/'+at)
    app.get('/settings/'+at, async (req, res) => {
      res.sendFile(path.join(__dirname+'/../html/settings.html'))
    })
  }
}
app.listen(port, () => console.log(`listening at http://localhost:${port}`));
