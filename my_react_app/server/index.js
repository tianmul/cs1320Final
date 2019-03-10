/*const express = require('express');
const app = express();

app.get('/', (req, res) => {
	axios.get('https://library.brown.edu/iip_development/mapsearch/').then((response) => {
  		response.setHeader('Content-Type', 'application/json');
  		response.send(JSON.stringify({ greeting: `Hello!` }));
  	});
});*/
const axios = require('axios')
const express = require('express');
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(pino);

app.get('/search1', (req, res) => {
	axios.get('https://library.brown.edu/iip_development/mapsearch/').then((response) => {		
  		res.setHeader('Content-Type', 'text/plain');
  		res.send( response.data.toString());
  	});
});
app.listen(3001, () =>
	console.log('Express server is running on localhost:3001')
);
