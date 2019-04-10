import React, { Component } from 'react';
import './search.css'

const capitalize = (s) => {
	if (typeof s !== 'string') return ''
	return s.charAt(0).toUpperCase() + s.slice(1)
}

const project1Mapping = {
	locationsSel: 'region',
	typesSel: 'type',
	physicalTypesSel: 'physical_type',
	languagesSel: 'language',
	religionsSel: 'religion',
	materialsSel: 'material',
}

class Search extends Component {
	constructor(props) {
		super(props);
		this.fetchData = this.fetchData.bind(this);		
		this.handleSubmit = this.handleSubmit.bind(this);
		this.state = {
				locations: [],
				types:[],
				physicalTypes:[],
				languages:[],
				religions:[],
				materials:[],
				/*Selected Fields*/
				locationsSel: [],
				typesSel:[],
				physicalTypesSel:[],
				languagesSel:[],
				religionsSel:[],
				materialsSel:[],
			};
	}

	componentDidMount() {
		this.fetchData();	
	}

	fetchData(){
	    fetch(`/search1`).then(response => response.json()).then(data => {	
			this.setState({
				locations:this.uniq(this.state.locations.concat(data.city)),
				types:this.uniq(this.state.types.concat(data.type)),
				physicalTypes:this.uniq(this.state.physicalTypes.concat(data.physical_type)),
				languages:this.uniq(this.state.languages.concat(data.language_display)),
				religions:this.uniq(this.state.religions.concat(data.religion)),
				materials:this.uniq(this.state.materials.concat(data.material)),
			});

			/*let parser = new DOMParser();
			let doc = parser.parseFromString(state,"text/html");
			this.setState({
				locations:this.uniq(this.state.locations.concat(this.findData1(doc, "id_place_"))),
				types:this.uniq(this.state.types.concat(this.findData1(doc, "id_type_"))),
				physicalTypes:this.uniq(this.state.physicalTypes.concat(this.findData1(doc, "id_physical_type_"))),
				languages:this.uniq(this.state.languages.concat(this.findData1(doc, "id_language_"))),
				religions:this.uniq(this.state.religions.concat(this.findData1(doc, "id_religion_"))),
				materials:this.uniq(this.state.materials.concat(this.findData1(doc, "id_material_"))),

			});*/
		});

		/*fetch(`/search2`).then(response => response.text()).then(state => {	
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
			
		});*/
	}

	//For first website
	/*findData1(doc, idString){
		let list = [];
		for (var i = 0; ;i++){
			let temp = doc.getElementById(idString+i); 
			if(temp!=null) list.push(capitalize(temp.labels[0].innerText.trim()));
			else break;
		}
		return list;		
	}*/

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
				<form action="./result" onSubmit={this.handleSubmit}>
					<Filter name="Location" data={this.state.locations} parent={this} cat="locations"/>
					<Filter name="Type of Inscription" data={this.state.types} parent={this} cat="types"/>
					<Filter name="Physical Type" data={this.state.physicalTypes} parent={this} cat="physicalTypes"/>
					<Filter name="Language" data={this.state.languages} parent={this} cat="languages"/>
					<Filter name="Religion" data={this.state.religions} parent={this} cat="religions"/>
					<Filter name="Material" data={this.state.materials} parent={this} cat="materials"/>
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

	handleSubmit(event){
		event.preventDefault();
		console.log(this.state)	
		/*https://library.brown.edu/search/solr_pub/iip/?start=0&rows=100&indent=on&wt=json&q=region:%22Coastal+Plain%22+%22AND%22+religion:%22jewish%22*/	
		let urlPrefix = 'https://library.brown.edu/search/solr_pub/iip/?';
		let urlChange = 'start=0&rows=100';
		let urlPostfix = '&indent=on&wt=json&q=';
		let query = '';
		for (let objname in project1Mapping){
			if (this.state[objname].length !== 0){
				if ( query === '' ) query = query + project1Mapping[objname] + ':';
				else query = query + '+AND+' + project1Mapping[objname] + ':';

				if(this.state[objname].length ===1) query=query+'%22' + encodeURI(this.state[objname][0].split(' ').join('+')) +'%22';
				else{
					for( let i = 0; i < this.state[objname].length; i++){
						if(i===0) query = query+'(';
						else query = query+'+OR+';
						query = query + '%22' + encodeURI(this.state[objname][i].split(' ').join('+')) + '%22';
					}
					query = query+')';
				}

			}
		}
		if (query === '') query = '*:*';
		console.log(query)
		let jsonData = { queryStr:query, start:"0", rows:"100" };
		fetch("/query1", {
			method: "post",
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(jsonData),
		}).then(response => response.json()).then(data => {console.log(data)});		


		/*https://edh-www.adw.uni-heidelberg.de/inschrift/erweiterteSuche?hd_nr=&tm_nr=&land=&fo_antik=&fo_modern=&fundstelle=&region=&compFundjahr=eq&fundjahr=&aufbewahrung=&inschriftgattung=&sprache=It&inschrifttraeger=&compHoehe=eq&hoehe=&compBreite=eq&breite=&compTiefe=eq&tiefe=&bh=&palSchreibtechnik=&dat_tag=&dat_monat=&dat_jahr_a=&dat_jahr_e=&hist_periode=&religion=&literatur=&kommentar=&p_name=&p_praenomen=&p_nomen=&p_cognomen=&p_supernomen=&p_tribus=&p_origo=&p_geschlecht=&p_status=&compJahre=eq&p_lJahre=&compMonate=eq&p_lMonate=&compTage=eq&p_lTage=&compStunden=eq&p_lStunden=&atext1=&bool=AND&atext2=&sort=hd_nr&anzahl=20*/
	};
}

class Filter extends Component {

	render() {
		return (
			<div className="FilterWarpper">
			<span>{this.props.name}</span>
				<div className="Filter">			
				{this.props.data.map((name, idx) => (
					<CheckBoxSample name={name} id={this.props.name+name} key={idx} pp={this.props.parent} pcat={this.props.cat}/>
				))}
				</div>
			</div>
		);
	}
}

class CheckBoxSample extends Component {
	constructor(props) {
		super(props);		
		this.handleChange = this.handleChange.bind(this);
	}
	render() {
		return (
			<div className="CheckBoxSample">
			<input name={this.props.name} id={this.props.id+"Checkbox"} type="checkbox" onChange={this.handleChange}/>
			<span>{'  '}{this.props.name}</span>
			</div>
		);
	}
	handleChange(event){
		if(event.target.checked) {
			let catStr = this.props.pcat + 'Sel';
			let prev = this.props.pp.state[catStr];
			prev.push(this.props.name)
			this.props.pp.setState({ [catStr]: prev })
		}
		else{
			let catStr = this.props.pcat + 'Sel';
			let prev = this.props.pp.state[catStr];
			let idx = prev.indexOf(this.props.name);
			if (idx > -1) {
			  prev.splice(idx, 1);
			}
			this.props.pp.setState({ [catStr]: prev });			
		}
	}
}
export default Search;
