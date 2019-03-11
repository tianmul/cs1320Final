const axios = require('axios')
const express = require('express');
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(pino);

app.get('/search1', (req, res) => {
    axios.get('https://library.brown.edu/iip_development/mapsearch/').then((response) => {
        cosole.log("ss");
        res.setHeader('Content-Type', 'text/plain');
        res.send( response.data.toString());
    });
});
app.get('/search2', (req, res) => {
    axios.get('https://edh-www.adw.uni-heidelberg.de/inschrift/erweiterteSuche').then((response) => {		
        res.setHeader('Content-Type', 'text/plain');
        res.send( response.data.toString());
    });
});

//app.get('/details', (req, res) => {
//    axios.get('https://library.brown.edu/search/solr_pub/iip/?start=0&rows=1&indent=on&wt=json&q=*').then((response) => {
//        console.log("fetched");
////        res.header("Access-Control-Allow-Origin", "*");
////        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//
//        res.setHeader('Content-Type', 'text/plain');
//        res.send(response);
//    });
//});

app.listen(3001, () =>
           console.log('Express server is running on localhost:3001')
          );
