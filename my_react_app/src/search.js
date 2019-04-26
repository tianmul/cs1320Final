import React, {Component} from 'react';
import './search.css'

/*basic functions*/
const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}
const lowitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toLowerCase() + s.slice(1)
}


/*select -> Name Mapping Table*/
const project1Mapping = {
    locationsSel: 'city',
    typesSel: 'type',
    physicalTypesSel: 'physical_type',
    languagesSel: 'language_display',
    religionsSel: 'religion',
    materialsSel: 'material',
}

const project2Mapping = {
    locationsSel: 'provinz',
    typesSel: 'inschriftgattung',
    physicalTypesSel: 'inschrifttraeger',
    languagesSel: 'sprache',
    religionsSel: 'religion',
    materialsSel: 'material',
}
let project2QueryMapping = {
    locationsSel: {},
    typesSel: {},
    physicalTypesSel: {},
    languagesSel: {},
    religionsSel: {},
    materialsSel: {},
}

class Search extends Component {
    constructor(props) {
        super(props);
        this.fetchData = this.fetchData.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            /*option List*/
            locations: [],
            types: [],
            physicalTypes: [],
            languages: [],
            religions: [],
            materials: [],

            /*Selected Fields*/
            locationsSel: [],
            typesSel: [],
            physicalTypesSel: [],
            languagesSel: [],
            religionsSel: [],
            materialsSel: [],

            /*Text Fields*/
            from: '',
            to: '',
            searchText: ''
        };
    }

    componentDidMount() {
        this.fetchData();
    }

    fetchData() {
        /*Fetch option list from IIP*/
        fetch(`/search1`).then(response => response.json()).then(data => {
            this.setState({
                locations: this.uniq(this.state.locations.concat(data.city)),
                types: this.uniq(this.state.types.concat(data.type)),
                physicalTypes: this.uniq(this.state.physicalTypes.concat(data.physical_type)),
                languages: this.uniq(this.state.languages.concat(data.language_display)),
                religions: this.uniq(this.state.religions.concat(data.religion)),
                materials: this.uniq(this.state.materials.concat(data.material)),
            });
        });

        /*Fetch option list and mapping table from EDH*/
        fetch(`/search2`).then(response => response.text()).then(state => {
            let parser = new DOMParser();
            let doc = parser.parseFromString(state, "text/html");

            let loc = this.findDataInTree(doc, "tree", true);
            let mat = this.findDataInTree(doc, "treeMat", false);
            project2QueryMapping.locationsSel = loc["ma"]
            project2QueryMapping.materialsSel = mat["ma"]

            let type = this.findData2(doc, "inschriftgattung", false);
            let ptype = this.findData2(doc, "inschrifttraeger", false);
            let lang = this.findData2(doc, "sprache", true);
            let reli = this.findData2(doc, "religion", false);
            project2QueryMapping.typesSel = type["ma"]
            project2QueryMapping.physicalTypesSel = ptype["ma"]
            project2QueryMapping.languagesSel = lang["ma"]
            project2QueryMapping.religionsSel = reli["ma"]

            this.setState({
                locations: this.uniq(this.state.locations.concat(loc["li"])),
                types: this.uniq(this.state.types.concat(type["li"])),
                physicalTypes: this.uniq(this.state.physicalTypes.concat(ptype["li"])),
                languages: this.uniq(this.state.languages.concat(lang["li"])),
                religions: this.uniq(this.state.religions.concat(reli["li"])),
                materials: this.uniq(this.state.materials.concat(mat["li"]))

            });

        });
    }

    //EDH option parsing
    findData2(doc, nameString, up) {
        let list = [];
        let map = {};
        let temp = doc.getElementsByName(nameString);
        if (temp.length !== 0) {
            let nameList = temp[0];
            for (var i = 0; i < nameList.length; i++) {
                if (nameList[i].innerText.trim() !== "") {
                    let name = nameList[i].innerText.trim() + '(-)';
                    if (up === true) name = capitalize(name);
                    else name = lowitalize(name);
                    list.push(name);
                    map[name] = nameList[i].value;
                }
            }
        }
        let rt = {li: list, ma: map};
        return rt;
    }

    //EDH tree parsing
    findDataInTree(doc, treeId, up) {
        let list = [];
        let map = {};
        let temp = doc.getElementById(treeId);
        if (temp != null) {
            let ulList = temp.getElementsByTagName("li");
            for (var i = 0; i < ulList.length; i++) {
                if (ulList[i].className !== "collapsed") {
                    let name = ulList[i].innerText.trim();
                    if (up === true) name = capitalize(name);
                    else name = lowitalize(name);
                    list.push(name);
                    map[name] = ulList[i].childNodes[0].value;
                }
            }
        }
        let rt = {li: list, ma: map};
        return rt;
    }

    //make unique list
    uniq(a) {
        return a.sort().filter(function (item, pos, ary) {
            return !pos || item !== ary[pos - 1];
        });
    }

    render() {
        return (
            <div className="Search">
                <form style={{margin: "40px"}} action="./result" onSubmit={this.handleSubmit}>
                    <div className="container">
                        <Filter name="Location" data={this.state.locations} parent={this} cat="locations"/>
                        <Filter name="Type of Inscription" data={this.state.types} parent={this} cat="types"/>
                        <Filter name="Physical Type" data={this.state.physicalTypes} parent={this} cat="physicalTypes"/>
                        <Filter name="Language" data={this.state.languages} parent={this} cat="languages"/>
                        <Filter name="Religion" data={this.state.religions} parent={this} cat="religions"/>
                        <Filter name="Material" data={this.state.materials} parent={this} cat="materials"/>

                    </div>
                    <table>
                        <tr>
                            <th><span>From:</span> <input id="from" name="from" onChange={this.handleChange}/>
                                <span>&nbsp;&nbsp;</span></th>
                            <th><span>&nbsp;&nbsp;To:</span> <input id="to" name="to" onChange={this.handleChange}/></th>
                        </tr>
                        <tr><th>&nbsp;</th></tr>
                        <tr>
                            <th colSpan="2"><span>Text:</span> <input style={{width: "85%"}} id="searchText" name="searchText" onChange={this.handleChange}/></th>
                        </tr>
                    </table>
                    <input className="button-4" type="submit" value="Search"/>

                </form>


            </div>
        )
            ;
    }

    handleChange(event) {
        this.setState({
            [event.target.id]: event.target.value
        });
    };


    handleSubmit(event) {
        event.preventDefault();
        //make checkbox fields IIP query
        let query = '';
        for (let objname in project1Mapping) {
            if (this.state[objname].length !== 0) {
                if (query === '') query = query + project1Mapping[objname] + ':';
                else query = query + '+AND+' + project1Mapping[objname] + ':';

                if (this.state[objname].length === 1) query = query + '%22' + encodeURI(this.state[objname][0].split(' ').join('+')) + '%22';
                else {
                    for (let i = 0; i < this.state[objname].length; i++) {
                        if (i === 0) query = query + '(';
                        else query = query + '+OR+';
                        query = query + '%22' + encodeURI(this.state[objname][i].split(' ').join('+')) + '%22';
                    }
                    query = query + ')';
                }
            }
        }

        //make text fields IIP query
        if (this.state.from !== '') {
            var from = parseInt(this.state["from"], 10);
            if (isNaN(from)) {
                alert("Invalid from value, should be an integer. Negative is BCE and positive is CE.");
                return;
            }
            if (query === '') query = query + '(notBefore:[' + String(from) + ' TO 10000])';
            else query = query + '+AND+(notBefore:[' + String(from) + ' TO 10000])';
        }

        if (this.state.to !== '') {
            var to = parseInt(this.state["to"], 10);
            if (isNaN(to)) {
                alert("Invalid to value, should be an integer. Negative is BCE and positive is CE.");
                return;
            }
            if (query === '') query = query + '(notAfter:[-10000 TO ' + String(to) + '])';
            else query = query + '+AND+(notAfter:[-10000 TO ' + String(to) + '])';

        }
        if (this.state.searchText !== "") {
            if (query === '') query = query + '(text:%22' + encodeURI(this.state.searchText.split(' ').join('+')) + '%22)';
            else query = query + '+AND+(text:%22' + encodeURI(this.state.searchText.split(' ').join('+')) + '%22)';
        }

        if (query === '') query = '*:*';
        console.log(query)


        /*Pass Query and Jump to Next Page, Next Page Do Following*/

        /*let jsonData = { queryStr:query, start:"0", rows:"100" };
        fetch("/query1", {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData),
        }).then(response => response.json()).then(data => {console.log(data)});		*/

        let query2 = '';
        //make checkbox fields EDH query
        for (let objname in project2Mapping) {
            if (this.state[objname].length !== 0) {
                for (let i = 0; i < this.state[objname].length; i++) {
                    if (this.state[objname][i] in project2QueryMapping[objname]) {
                        if (query2 === '') query2 = query2 + project2Mapping[objname] + '=';
                        else query2 = query2 + '&' + project2Mapping[objname] + '=';
                        query2 = query2 + project2QueryMapping[objname][this.state[objname][i]];
                        if (objname !== 'locationsSel' || objname !== 'materialsSel') break;
                    }
                }
            }
        }
        /*&dat_jahr_a=-100&dat_jahr_e&atext1=su+b*/
        if (this.state.from !== '') {
            if (query2 === '') query2 = query2 + 'dat_jahr_a=' + String(from);
            else query2 = query2 + '&dat_jahr_a=' + String(from);
        }
        if (this.state.to !== '') {
            if (query2 === '') query2 = query2 + 'dat_jahr_e=' + String(to);
            else query2 = query2 + '&dat_jahr_e=' + String(to);
        }
        if (this.state.searchText !== '') {
            if (query2 === '') query2 = query2 + 'atext1=' + this.state.searchText.split(' ').join('+');
            else query2 = query2 + '&atext1=' + this.state.searchText.split(' ').join('+');
        }

        console.log(query2)
        if (query2 !== '') {
            let jsonData = {queryStr: query2, start: "0", rows: "100"};
            fetch("/query2", {
                method: "post",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jsonData),
            }).then(response => response.text()).then(state => {
                let parser = new DOMParser();
                let doc = parser.parseFromString(state, "text/html");
                console.log(doc);
            });
        }
        localStorage.setItem('query', JSON.stringify({q1: query, q2: query2}));

        this.props.history.push('./result');
        //history.push('/result');

    };
}

class Filter extends Component {

    render() {
        return (

            <div className="FilterWarpper">
                <span>{this.props.name}</span>
                <div className="Filter">
                    {this.props.data.map((name, idx) => (
                        <CheckBoxSample name={name} id={this.props.name + name} key={idx} pp={this.props.parent}
                                        pcat={this.props.cat}/>
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
                <input name={this.props.name} id={this.props.id + "Checkbox"} type="checkbox"
                       onChange={this.handleChange}/>
                <span>{'  '}{this.props.name}</span>
            </div>
        );
    }

    handleChange(event) {
        if (event.target.checked) {
            let catStr = this.props.pcat + 'Sel';
            let prev = this.props.pp.state[catStr];
            prev.push(this.props.name)
            this.props.pp.setState({[catStr]: prev})
        } else {
            let catStr = this.props.pcat + 'Sel';
            let prev = this.props.pp.state[catStr];
            let idx = prev.indexOf(this.props.name);
            if (idx > -1) {
                prev.splice(idx, 1);
            }
            this.props.pp.setState({[catStr]: prev});
        }
    }
}

export default Search;
