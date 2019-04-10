const axios = require('axios')
const express = require('express');
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(pino);

let project1 = "";
let project2 = "";
axios.get('https://library.brown.edu/iip_development/mapsearch/').then((response) => {
	project1 = response.data.toString();
	console.log("Project 1 cached!");
});

axios.get('https://edh-www.adw.uni-heidelberg.de/inschrift/erweiterteSuche').then((response) => {		
	project2 = response.data.toString();
	console.log("Project 2 cached!");
});

app.get('/search1', (req, res) => {
	res.setHeader('Content-Type', 'text/plain');
	res.send( project1 );
});
app.get('/search2', (req, res) => {
	res.setHeader('Content-Type', 'text/plain');
	res.send( project2 );
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
