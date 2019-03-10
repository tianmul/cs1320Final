import React, { Component } from 'react';
import './search.css'

const capitalize = (s) => {
	if (typeof s !== 'string') return ''
	return s.charAt(0).toUpperCase() + s.slice(1)
}

class Search extends Component {
	constructor(props) {
		super(props);
		this.fetchData = this.fetchData.bind(this);
		this.state = {
				locations: [],
				types:[],
				physicalTypes:[],
				languages:[],
				religions:[],
				materials:[],
			};
	}

	componentDidMount() {
		this.fetchData();	
	}

	fetchData(){
	    fetch(`/search1`).then(response => response.text()).then(state => {	
			let parser = new DOMParser();
			let doc = parser.parseFromString(state,"text/html");
			this.setState({
				locations:this.uniq(this.state.locations.concat(this.findData1(doc, "id_place_"))),
				types:this.uniq(this.state.types.concat(this.findData1(doc, "id_type_"))),
				physicalTypes:this.uniq(this.state.physicalTypes.concat(this.findData1(doc, "id_physical_type_"))),
				languages:this.uniq(this.state.languages.concat(this.findData1(doc, "id_language_"))),
				religions:this.uniq(this.state.religions.concat(this.findData1(doc, "id_religion_"))),
				materials:this.uniq(this.state.materials.concat(this.findData1(doc, "id_material_"))),

			});
		});

		fetch(`/search2`).then(response => response.text()).then(state => {	
			let parser = new DOMParser();
			let doc = parser.parseFromString(state,"text/html");
			
			this.setState({
				locations:this.uniq(this.state.locations.concat(this.findDataInTree(doc, "tree"))),
				types:this.uniq(this.state.types.concat(this.findData2(doc, "inschriftgattung"))),
				physicalTypes:this.uniq(this.state.physicalTypes.concat(this.findData2(doc, "inschrifttraeger"))),
				languages:this.uniq(this.state.languages.concat(this.findData2(doc, "sprache"))),
				religions:this.uniq(this.state.religions.concat(this.findData2(doc, "religion"))),
				materials:this.uniq(this.state.materials.concat(this.findDataInTree(doc, "treeMat")))

			});
			
		});
	}

	//For first website
	findData1(doc, idString){
		let list = [];
		for (var i = 0; ;i++){
			let temp = doc.getElementById(idString+i); 
			if(temp!=null) list.push(capitalize(temp.labels[0].innerText.trim()));
			else break;
		}
		return list;		
	}

	//For second website
	findData2(doc, nameString){
		let list = [];
		let temp = doc.getElementsByName(nameString); 
		if(temp.length!==0){
			let nameList = temp[0];
			for (var i = 0; i < nameList.length ;i++){
				if(nameList[i].innerText.trim()!=="") list.push(capitalize(nameList[i].innerText.trim()));
			}
		}
		return list;		
	}

	findDataInTree(doc, treeId){
		let list = [];
		let temp = doc.getElementById(treeId); 
		if(temp!=null){
			let ulList = temp.getElementsByTagName("li");
			for (var i = 0; i < ulList.length ;i++){
				if(ulList[i].className!=="collapsed")
				list.push(capitalize(ulList[i].innerText.trim()));
			}
		}
		return list;		
	}
	uniq(a) {
    		return a.sort().filter(function(item, pos, ary) {
        		return !pos || item !== ary[pos - 1];
    		});
	}

	render() {
		return (
			<div className="Search">
				<form action="./result" method="get">
					<Filter name="Location" data={this.state.locations}/>
					<Filter name="Type of Inscription" data={this.state.types}/>
					<Filter name="Physical Type" data={this.state.physicalTypes}/>
					<Filter name="Language" data={this.state.languages}/>
					<Filter name="Religion" data={this.state.religions}/>
					<Filter name="Material" data={this.state.materials}/>
					<div style={{width:"800px", textAlign:"center"}}>
					<br /> 
						<div>From: <input type="number" id="from" name="from" step="1"/></div>
						<div>To: <input type="number" id="to" name="to" step="1"/></div>
					</div>
					<input type="text" id="searchText" name="searchText"/>
					<input type="submit" value="Search"/>
				</form>
			</div>
		);
	}
}

class Filter extends Component {

	render() {
		return (
			<div className="FilterWarpper">
			<span>{this.props.name}</span>
				<div className="Filter">			
				{this.props.data.map((name, idx) => (
					<CheckBoxSample name={name} id={name} value={name} key={idx}/>
				))}
				</div>
			</div>
		);
	}
}

class CheckBoxSample extends Component {
	render() {
		return (
			<div className="CheckBoxSample">
			<input name={this.props.name} value={this.props.value} id={this.props.name} type="checkbox"/>
			<span>{'  '}{this.props.name}</span>
			</div>
		);
	}
}
export default Search;
