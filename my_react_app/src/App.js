import React, { Component } from 'react';
import Search from './search';
import Result from './result';
import Detail from './detail';
import './App.css';
import {BrowserRouter, Switch, Route} from 'react-router-dom'

class App extends Component {
	render() {
		return (
			<div className="App">
				<BrowserRouter>
					<Switch>
						<Route exact path='/' component={Search}/>
						<Route path='/result' component={Result}/>
                        <Route path='/detail' component={Detail}/>
					</Switch>
				</BrowserRouter>
			</div>
		);
	}
}

export default App;
