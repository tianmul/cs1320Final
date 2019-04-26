import React, {Component} from 'react';
import Search from './search';
import Result from './result';
import Detail from './detail';
import './App.css';
import logo from './logo.png';
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom'

class App extends Component {
    render() {
        return (

            <div className="App">
                <BrowserRouter>
                    <div>
                        <Link to={'/'}><img className="logo" src={logo} alt=" logo"/></Link>
                        <Switch>
                            <Route exact path='/' component={Search}/>
                            <Route path='/result' component={Result}/>
                            <Route path='/detail' component={Detail}/>
                        </Switch>
                    </div>
                </BrowserRouter>
            </div>
        );
    }
}

export default App;
