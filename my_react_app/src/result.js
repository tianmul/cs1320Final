import React, { Component } from 'react';
import NAImage from "./notAvaliable.jpg"
import './result.css';



function ItemNode(data) {
	this.transcription = data.transcription;
	this.date = data.not_before + " AD - " + data.not_after + " AD";
	this.language = data.language;
	this.findSpot = data.findspot_modern;
	if (data.fotos) {
		this.fotos = data.fotos[0];
	}
	else {
		this.fotos = NAImage;
	}
}


class Item extends Component {
  constructor(props) {
    super(props);
  }
  
  render() {
  	return (
  		<table className = "itemTable">
  			<thead>
  				<tr>
  					<th className = "itemHead">Number 1</th>
  				</tr>
  			</thead>
  			<tbody>
  				<tr>
  					<td className = "tdPhoto"><img src = {this.props.photo} alt = "inscription image" className = "photos" /></td>
  					<td className = "tdContent">
  						<table className = "tableContent">
  							<tbody>
  								<tr classname = "rowContent">
  									<td className = "category"><b>Transcription</b></td>
  									<td className = "content">{this.props.transcription}</td>
  								</tr>
  								<tr classname = "rowContent">
  									<td className = "category"><b>Language</b></td>
  									<td className = "content">{this.props.language}</td>
  								</tr>
  								<tr classname = "rowContent">
  									<td className = "category"><b>Date</b></td>
  									<td className = "content">{this.props.date}</td>
  								</tr>
  								<tr classname = "rowContent">
  									<td className = "category"><b>Place Found</b></td>
  									<td className = "content">{this.props.findSpot}</td>
  								</tr>
  							</tbody>
  						</table>
  					</td>
  				</tr>
  			</tbody>
  		</table>
  	);
  }
}

class Result extends Component {
  constructor(props) {
    super(props);
    this.state = {
    	items: []
    };
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount() {
  	fetch('https://edh-www.adw.uni-heidelberg.de/data/api/inscriptions/search?province=ges&province=gei&transcription=votum%20solvit&year_not_before=200')
  	.then(res => res.json())
  	.then(data => {
  		console.log(data.items[0].fotos[0]);
  		let wholeItems = [];
  		for (var i = 0; i < data.items.length; i++) {
  			let node = new ItemNode(data.items[i]);
  			wholeItems.push(node);
  		}
  		this.setState({
  			items: wholeItems
  		});
  	})
  	.catch(err => {
  		console.log(err);
  	});
  	console.log("hello");
  }

  render() {
    return (
      <div className="Items">
        <div className = "topbar"></div>
        <div className = "main-page">
        	<div className = "itemList">
        		{this.state.items.map((node, index) => <Item transcription = {node.transcription} date = {node.date} language = {node.language} findSpot = {node.findSpot} photo = {node.fotos}/>)}
        	</div>
        </div>
      </div>
    );
  }
}

export default Result;
