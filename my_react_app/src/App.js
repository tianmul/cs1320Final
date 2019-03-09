import React, { Component } from 'react';
import Search from './search';
import Result from './result';
import './App.css';
import {BrowserRouter, Switch, Route} from 'react-router-dom'

class App extends Component {
	render() {
		return (
			<div className="App">
				<BrowserRouter>
					<Switch>
						<Route path='/search' component={Search}/>
						<Route path='/result' component={Result}/>
					</Switch>
				</BrowserRouter>
			</div>
		);
	}
}

export default App;
