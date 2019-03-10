import React, { Component } from 'react';

					/* <Filter name="Type of Inscription"/>
					<Filter name="Physical Type"/>
					<Filter name="Language"/>
					<Filter name="Religion"/>
					<Filter name="Material"/>*/
class Search extends Component {
	render() {
		return (
			<div className="Search">
				<form action="./result" method="get">
					<Filter name="Location"/>
					<input type="submit" value="Search"/>
				</form>
			</div>
		);
	}
}

class Filter extends Component {
	constructor(props) {
		super(props);
		this.fetchData = this.fetchData.bind(this);
		this.state = {choices: []};
	}

	componentDidMount() {
		this.fetchData();	
	}

	fetchData(){
	    fetch(`/search1`).then(response => response.text()).then(state => {	
			let parser = new DOMParser();
			let doc = parser.parseFromString(state,"text/html");
			let locationList = [];

			for (var i = 0; ;i++){
				let temp = doc.getElementById("id_place_"+i);
				if(temp!=null){
					locationList.push(temp.value);
				}
				else{
					break;
				}
			}
			this.setState({choices:locationList});
		});
	}

	render() {
		return (
				<div className="Filter">			
				{this.state.choices.map((name, idx) => (
					<CheckBoxSample name={name} id={name} value={name} key={idx}/>
				))}
				</div>
		);
	}
}

class CheckBoxSample extends Component {
	render() {
		return (
			<div>
			<input name={this.props.name} value={this.props.value} id={this.props.name} type="checkbox"/>
			<div>{this.props.name}</div>
			</div>
		);
	}
}
export default Search;
