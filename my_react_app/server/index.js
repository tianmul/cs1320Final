const axios = require('axios');
const express = require('express');
const pino = require('express-pino-logger')();
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
app.use(cors())
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
//app.use(pino);

let project1 = {};
let project2 = "";

const project1_facets_lists = ["type", "city", "language_display", "physical_type", "religion", "material"];
for( i = 0; i < project1_facets_lists.length; i++){
	let facet = project1_facets_lists[i];
	axios.get('https://library.brown.edu/search/solr_pub/iip/?q=*:*&start=0&rows=0&indent=on&facet=on&facet.field=' + facet + '&wt=json').then((response) => {
		let returnData = response.data.facet_counts.facet_fields[facet];
		let facetList = [];
		for ( j = 0; j < returnData.length; j++){
			if( j%2 === 0 && returnData[j]!=="") facetList.push(returnData[j]);
		}
		project1[facet] = facetList;
		console.log(facet + " Get!");
	}).catch(function(error){
		console.log("enter faceList Error");
		console.log(error);
	});
}

function setP2(){
	axios.get('https://edh-www.adw.uni-heidelberg.de/inschrift/erweiterteSuche').then((response) => {		
		project2 = response.data.toString();
		console.log("Project 2 cached!");
	}).catch(function(error){
		project2 = "";
		console.log(error);
		console.log("Project 2 cache error!")

	});
};
setP2();
//Update p2 everyday
setInterval(setP2 , 86400*1000);

app.get('/search1', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.end( JSON.stringify(project1) );
});
app.get('/search2', (req, res) => {
	res.setHeader('Content-Type', 'text/plain');
	res.send( project2 );
});
app.post('/query1', (req, res) => {
	let website = 'https://library.brown.edu/search/solr_pub/iip/?';
	// let website = 'https://library.brown.edu/search/solr_pub/?';
	let showWhich = 'start=' + req.body.start + '&rows=' + req.body.rows;
	let urlPostfix = '&indent=on&wt=json&q=';
	console.log(website + showWhich + urlPostfix + req.body.queryStr);

        axios.get(website + showWhich + urlPostfix + req.body.queryStr).then((response) => {  
		res.setHeader('Content-Type', 'application/json'); 
		res.end( JSON.stringify(response.data) );  
	   	console.log("query 1 result returned!"); 
	}).catch(function(err){
		res.setHeader('Content-Type', 'application/json'); 
		console.log("query1 error:", err);
	 	res.end(JSON.stringify({error:"err"}));   
	});
});

app.post('/query2', (req, res) => {
	let website = 'https://edh-www.adw.uni-heidelberg.de/inschrift/erweiterteSuche?';
	// let website = 'https://edh-www.adw.uni-heidelber/inschrift?';
	let urlPostfix = '&anzahl='+ req.body.rows + '&start=' + req.body.start;
	console.log(website + req.body.queryStr + urlPostfix);

	axios.get(website + req.body.queryStr + urlPostfix).then((response) => {	
		res.setHeader('Content-Type', 'text/plain');
		res.send( response.data.toString() );	
		console.log("query 2 result returned!");
	}).catch(function(err){
		res.setHeader('Content-Type', 'application/json'); 
		console.log("query2 error:", err);
		res.end(JSON.stringify({error:"err"}));  
	});
});

app.post('/query2Detail', (req, res) => {
	let website = 'https://edh-www.adw.uni-heidelberg.de/data/api/inscriptions/search?';

	axios.get(website + req.body.queryStr).then((response) => {	
		res.setHeader('Content-Type', 'application/json');
		res.end( JSON.stringify(response.data) );	
		console.log("query 2 detail returned!");
	});
});

app.listen(3001, () =>
           console.log('Express server is running on localhost:3001')
          );
