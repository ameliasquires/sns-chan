
const key = process.env.WEBUI_KEY
const bodyParser = require("body-parser");
const express = require('express');
let db = require("../src/db");
const path = require("path")
const Tickets = db.Tickets

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const port = 7001;
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

app.get('/settings', async (req, res) => {
  res.sendFile(path.join(__dirname+'/../html/settings.html'))
})
app.post('/settings/data', async (req, res) => {
  if(req.body.key == key)
    res.send('todo:P')
  else
    res.send('failed')
})
app.listen(port, () => console.log(`listening at http://localhost:${port}`));
