import React, { Component } from 'react';
import './detail.css';
import NAImage from "./notAvaliable.jpg"

const generateElement=(key,value)=> {
        return (
            <div key={key} className="row">
            <div className="field_des">{key}</div>
            <div className="field_con">{value}</div>
            </div>
        );
    }

function generateData(data) {
  const newData = Object.keys(data).reduce((result, currentKey) => {
    
    if (typeof data[currentKey] === 'string' || data[currentKey] instanceof String) {
      const elementToPush = generateElement(currentKey, data[currentKey]);
      result.push(elementToPush);
    } else {
      console.log(currentKey);
      var toDisplay = data[currentKey][0];
      for (var i = 1; i < data[currentKey].length; i++){
           toDisplay = toDisplay + ", " + data[currentKey][i];
      }
      const elementToPush = generateElement(currentKey, toDisplay);
      result.push(elementToPush);
//      const nested = generateData(data[currentKey]);
//      result.push(...nested);
    }
    return result;
  }, []);
  console.log(newData);
  return newData;
}

function generateTitle(data){
    const title = data.inscription_id + " _ " + data.place + data.date_desc + ", " + data.physical_type;
    return (<h3>{title}</h3>);
}

class Detail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data:[]
        };
        this.componentDidMount = this.componentDidMount.bind(this);
    }

    fetchDetail(){
        fetch('ex1.json')
            .then(res => res.json())
            .then(data => {
            console.log("Get data");
            console.log(data.response.docs[0]);
            this.setState({data: data.response.docs[0]});
        })
            .catch(err => {
            console.log(err);
        });
    }

    componentDidMount() {

      // Smple code
      // let detail = JSON.parse(localStorage.getItem('detailData'));
      // console.log("Here: ", detail);
        this.fetchDetail();
    }

    render() {
        const {data} = this.state;
        
        return (
             <div>
             <div>{generateTitle(data)}</div>
             <div>
                <div>
                    {generateData(data)}        
                </div>
                <div className = "photo"></div>
            </div>
            </div>
        );      
    }
}

export default Detail;
