require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const urlparser = require('url');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://yave:CHb8GOQnUO64qcWD@cluster0.xagm8aw.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

let enlace = new mongoose.Schema({
  url:String
});

const Url = mongoose.model('Url', enlace);

app.post('/api/shorturl', (req, res) => {
  console.log(req.body.url);
  const postUrlBody = req.body.url;
  /*const urlInfo = urlparser.parse(postUrlBody);
  if (!urlInfo.hostname){
    return res.json({error: "Invalid URL"});
  }*/
  dns.lookup(urlparser.parse(postUrlBody).hostname, (err, address) =>{
    console.log(err);
    if (!urlparser.parse(postUrlBody).hostname || err){
      console.log(err);
      res.json({error: "Invalid URL"})
    }//CAPTURAR EL VALOR EN MONGO DB
    else{
      const url = new Url({url: postUrlBody});
        url.save((err, data) =>{
        res.json({
          original_url: data.url,
          short_url: data._id
        });     
      })
    };
  });
});

app.get('/api/shorturl/:id', (req, res)=>{
  const id = req.params.id;
  Url.findById(id, (err, data)=>{
    if(err){
      console.log(err);
    }else{
      res.redirect(data.url);
    }
  }); 
});
