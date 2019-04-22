import React, {Component} from 'react';
import NAImage from "./notAvaliable.jpg"
import ReactPaginate from 'react-paginate';
import './result.css';

function q1ItemNode(data, num) {
    console.log(data);
    this.transcription = data.text[0];
    this.date = data.notBefore + "BCD - " + data.notAfter + " BCD";
    this.language = data.language_display[0];
    this.findSpot = data.place_found;
    this.fotos = NAImage;
    this.sequence = num;
    this.title = data.inscription_id.toUpperCase();
    this.data = data;
}

function q2ItemNode(data, num) {
    this.transcription = data.transcription;
    this.date = data.not_before + " AD - " + data.not_after + " AD";
    this.language = data.language;
    this.findSpot = data.findspot_modern;
    this.sequence = num;
    this.title = data.id;
    this.data = data;
    if (data.fotos) {
        this.fotos = data.fotos[0];
    } else {
        this.fotos = NAImage;
    }
}


class Item extends Component {
    constructor(props) {
        super(props);

        this.goDetail = this.goDetail.bind(this);
    }

    goDetail() {
        localStorage.setItem('detailData', JSON.stringify(this.props.data));
        window.location.href = "http://localhost:3000/detail";
        // console.log(this.props.history);
        // this.props.history.push('./detail');
    }

    render() {
        return (
            <table className="itemTable">
                <thead>
                <tr>
                    <th className="itemHead" colSpan="2"
                        onClick={this.goDetail}>Number {this.props.sequence}: {this.props.title}</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td className="tdPhoto"><img src={this.props.photo} alt="inscription img" className="photos"/></td>
                    <td className="tdContent">
                        <table className="tableContent">
                            <tbody>
                            <tr className="rowContent">
                                <td className="category"><b>Transcription</b></td>
                                <td className="content">{this.props.transcription}</td>
                            </tr>
                            <tr className="rowContent">
                                <td className="category"><b>Language</b></td>
                                <td className="content">{this.props.language}</td>
                            </tr>
                            <tr className="rowContent">
                                <td className="category"><b>Date</b></td>
                                <td className="content">{this.props.date}</td>
                            </tr>
                            <tr className="rowContent">
                                <td className="category"><b>Place Found</b></td>
                                <td className="content">{this.props.findSpot}</td>
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
            items: [],
            q1Start: 0,
            q1Total: -1,
            q2Start: 0,
            q2Total: -1,
            numOnePage: 10,
            numPages: 0,
        };

        this.handlePageClick = this.handlePageClick.bind(this);
        this.q1Fetch = this.q1Fetch.bind(this);
        this.q2Fetch = this.q2Fetch.bind(this);
        this.mixFetch = this.mixFetch.bind(this);
    }

    handlePageClick = data => {
        let selected = data.selected;
        console.log("selected: ", selected);

        if ((selected + 1) * this.state.numOnePage <= this.state.q1Total) {
            this.setState({q1Start: selected * this.state.numOnePage});
            // this.state.q1Start = selected * this.state.numOnePage;
            this.q1Fetch();
        } else if ((selected + 1) * this.state.numOnePage < this.state.q1Total + this.state.numOnePage) {
            this.setState({
                q1Start: selected * this.state.numOnePage,
                q2Start: 0
            });
            // this.state.q1Start = selected * this.state.numOnePage;
            // this.state.q2Start = 0;
            console.log("Condition 2", this.state.q1Start);
            this.mixFetch();
        } else {
            this.setState({q2Start: selected * this.state.numOnePage - this.state.q1Total});
            //this.state.q2Start = selected * this.state.numOnePage - this.state.q1Total;
            console.log("Condition 3: ", this.state.q2Start);
            this.q2Fetch();
        }
    };

    mixFetch() {
        let query = JSON.parse(localStorage.getItem('query'));
        let jsonData = {queryStr: query.q1, start: this.state.q1Start, rows: this.state.numOnePage};
        let wholeItems = [];

        fetch("/query1", {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData),
        })
            .then(response => response.json())
            .then(data => {
                if (this.state.q2Total === -1) {
                    this.setState({
                        q1Total: data.response.numFound,
                        numPages: Math.ceil(this.state.q1Total / this.state.numOnePage)
                    });
                    // this.state.q1Total = data.response.numFound;
                    // this.state.numPages = Math.ceil(this.state.q1Total / this.state.numOnePage);
                }

                for (let i = 0; i < Math.min(this.state.q1Total - this.state.q1Start, this.state.numOnePage); i++) {
                    let node = new q1ItemNode(data.response.docs[i], this.state.q1Start + i + 1);
                    wholeItems.push(node);
                }

                // console.log("q1 query: ", query.q1);
                // console.log("q1found: ", data.response.numFound);
                // console.log("q2 query: ", query.q2);

                if (query.q2 !== '') {
                    let q2Rows = 0;
                    if (this.state.numOnePage > this.state.q1Total - this.state.q1Start) {
                        q2Rows = this.state.numOnePage - (this.state.q1Total - this.state.q1Start);
                    }
                    let jsonData2 = {queryStr: query.q2, start: this.state.q2Start, rows: q2Rows};
                    let q2IDs = [];
                    fetch("/query2", {
                        method: "post",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(jsonData2),
                    })
                        .then(response => response.text())
                        .then(state => {
                            let parser = new DOMParser();
                            let doc = parser.parseFromString(state, "text/html");

                            if (this.state.q2Total === -1) {
                                let resultNum = parseInt((doc.getElementsByTagName("b")[1].innerHTML).split(" ")[2], 10);
                                this.setState({
                                    q2Total: resultNum,
                                    numPages: Math.ceil((this.state.q1Total + this.state.q2Total) / this.state.numOnePage)
                                });
                                // this.state.q2Total = resultNum;
                                // this.state.numPages = Math.ceil((this.state.q1Total + this.state.q2Total) / this.state.numOnePage);
                            }

                            // console.log("q2Found: ", this.state.q2Total);

                            if (q2Rows === 0) {
                                this.setState({
                                    items: wholeItems
                                });
                                return
                            }

                            let q2Results = doc.getElementsByClassName("linkLastUpdateDetail");
                            let q2Num = Math.min(q2Results.length, q2Rows);

                            for (let i = 0; i < q2Num; i++) {
                                let id = doc.getElementsByClassName("linkLastUpdateDetail")[i].getAttribute("href").split("/")[3];
                                q2IDs.push(id);
                            }

                            for (let i = 0; i < q2IDs.length; i++) {
                                let jsonDataDetail = {queryStr: "hd_nr=" + q2IDs[i]};
                                fetch("/query2Detail", {
                                    method: "post",
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(jsonDataDetail),
                                })
                                    .then(response => response.json())
                                    .then(data => {
                                        let node = new q2ItemNode(data.items[0], this.state.q1Total + this.state.q2Start + i + 1);
                                        wholeItems.push(node);

                                        if (wholeItems.length === this.state.q1Total - this.state.q1Start + q2IDs.length) {
                                            wholeItems.sort((a, b) => (a.sequence > b.sequence) ? 1 : -1);
                                            this.setState({
                                                items: wholeItems,
                                            });
                                        }
                                    })
                                    .catch(err => {
                                        console.log(err);
                                    });
                            }
                        });
                } else {
                    this.setState({
                        items: wholeItems,
                    });
                }
            })
            .catch(err => {
                console.log(err);
            });
    }

    q1Fetch() {
        let query = JSON.parse(localStorage.getItem('query'));
        let jsonData = {queryStr: query.q1, start: this.state.q1Start, rows: this.state.numOnePage};

        let wholeItems = [];

        fetch("/query1", {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData),
        })
            .then(response => response.json())
            .then(data => {
                for (let i = 0; i < this.state.numOnePage; i++) {
                    let node = new q1ItemNode(data.response.docs[i], this.state.q1Start + i + 1);
                    wholeItems.push(node);
                }

                this.setState({
                    items: wholeItems,
                });
            })
            .catch(err => {
                console.log(err);
            });
    }

    q2Fetch() {
        let query = JSON.parse(localStorage.getItem('query'));
        let jsonData2 = {queryStr: query.q2, start: this.state.q2Start, rows: this.state.numOnePage};
        let wholeItems = [];
        let q2IDs = [];

        fetch("/query2", {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData2),
        })
            .then(response => response.text())
            .then(state => {
                let parser = new DOMParser();
                let doc = parser.parseFromString(state, "text/html");


                let q2Results = doc.getElementsByClassName("linkLastUpdateDetail");

                for (let i = 0; i < q2Results.length; i++) {
                    let id = doc.getElementsByClassName("linkLastUpdateDetail")[i].getAttribute("href").split("/")[3];
                    q2IDs.push(id);
                }

                for (let i = 0; i < q2IDs.length; i++) {
                    let jsonDataDetail = {queryStr: "hd_nr=" + q2IDs[i]};
                    fetch("/query2Detail", {
                        method: "post",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(jsonDataDetail),
                    })
                        .then(response => response.json())
                        .then(data => {
                            let node = new q2ItemNode(data.items[0], this.state.q1Total + this.state.q2Start + i + 1);
                            wholeItems.push(node);

                            if (wholeItems.length === q2IDs.length) {
                                wholeItems.sort((a, b) => (a.sequence > b.sequence) ? 1 : -1);
                                this.setState({
                                    items: wholeItems,
                                });
                            }
                        })
                        .catch(err => {
                            console.log(err);
                        });
                }
            });
    }

    componentDidMount() {
        this.mixFetch();
    }

    render() {
        return (
            <div className="Items">
                <div className="topbar"></div>
                <div className="main-page">
                    <div className="itemList">
                        {this.state.items.map((node, index) => <Item key={index} transcription={node.transcription}
                                                                     date={node.date} language={node.language}
                                                                     findSpot={node.findSpot} photo={node.fotos}
                                                                     sequence={node.sequence} title={node.title}
                                                                     data={node.data}/>)}
                    </div>
                    <ReactPaginate
                        previousLabel={'previous'}
                        nextLabel={'next'}
                        breakLabel={'...'}
                        breakClassName={'break-me'}
                        pageCount={this.state.numPages}
                        marginPagesDisplayed={3}
                        pageRangeDisplayed={3}
                        onPageChange={this.handlePageClick}
                        containerClassName={'pagination'}
                        subContainerClassName={'pages pagination'}
                        activeClassName={'active'}
                    />
                </div>
            </div>
        );
    }
}

export default Result;
