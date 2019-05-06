import React, {Component} from 'react';
import './detail.css';
import NAImage from "./notAvaliable.jpg"
import Redirect from "./redirect.png"

const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1)
};
const proj1 = ["place_found", "material", "physical_type", "diplomatic", "language_display", "dimensions", "_version_", "display_status", "notBefore", "notAfter", "translation", "transcription", "placeMenu", "text", "metadata", "dispaly_status", "language", "bibl", "biblDiplomatic", "biblTranscription", "biblTranslation"];
const proj2 = ["id", "fotos", "language", "height", "width", "depth", "not_before", "not_after"
    , "findspot_ancient", "findspot_modern", "transcription", "material", "type_of_monument", "trismegistos_uri", "diplomatic_text", "country", "social_economic_legal_history", "work_status", "uri", "people"];

const generateElement = (key, value) => {
    // Error checking
    if (typeof(value) === "object" || value === undefined || value.length === 0 || (value.length === 1 && value[0] === "")) {
        value = "NA";
    }
    
    // console.log(value);
    if(typeof (value) === "string") {
        if (value.includes("<") || value.includes(">")) {
            // Remove span tags
            if (value.includes("<span>")) {
                value = value.replace("<span>", "");
                value = value.replace("</span>", "");
            }
            value = stripHTML(value);
        }
    }

    key = key.replace(/_/gm, " ");
    key = capitalize(key);

    if (key === "Original Site:") {
        let link = <a href={value} target="_blank"> <img alt="redirect symbol" src={Redirect}/> Click to Redirect</a>;
        return (
            <div key={key} className="row_em">
                <div className="field_des">{key}</div>
                <div className="field_con">{link}</div>
            </div>)
    }

    let valueStr = "";
    if (Array.isArray(value) && value.length > 1) {
        for (let i = 0; i < value.length - 1; i++) {
            valueStr = valueStr + value[i] + ", ";
        }
        valueStr = valueStr + value[value.length - 1];
        return (
            <div key={key} className="row">
                <div className="field_des">{key}</div>
                <div className="field_con">{valueStr}</div>
            </div>
        );


    } else {

        return (
            <div key={key} className="row">
                <div className="field_des">{key}</div>
                <div className="field_con">{value}</div>
            </div>
        );
    }
};

// Remove HTML tags
function stripHTML(text) {
    return text.replace(/<.*?>/gm, '\n');
}

function generateData(data) {
    const newData = Object.keys(data).reduce((result, currentKey) => {
        let valueStr = "";
        let elementToPush = "";
        if ((typeof data[currentKey] === 'string' || data[currentKey] instanceof String)) {
            elementToPush = generateElement(currentKey, data[currentKey]);
        } else {
            valueStr = data[currentKey][0];

            for (let i = 1; i < data[currentKey].length; i++) {

                valueStr = valueStr + ", " + data[currentKey][i];
            }
            elementToPush = generateElement(currentKey, valueStr);
        }

        if (whichProject(data) === 0) {
            result.push(elementToPush);
        } else if (whichProject(data) === 1 && !proj1.includes((currentKey))) {
            result.push(elementToPush);
        } else if (whichProject(data) === 2 && !proj2.includes((currentKey))) {
            result.push(elementToPush);
        }

        return result;
    }, []);
    return newData;
}

// JSON from which project, return T for iip, F for HD
function whichProject(data) {
    let keys = Object.keys(data);
    let projNum = 0;
    if (keys.includes("inscription_id")) {
        projNum = 1;
    } else if (keys.includes("id") && data.id.startsWith("HD")) {
        projNum = 2;
    }
    return projNum;
}

const Common = props => {
    const language = generateElement("Languages:", props.language);
    const dimensions = generateElement("Dimensions:", props.dimensions);

    let predate = "";
    if (props.data.notBefore !== undefined) {
        if (props.data.notBefore < 0) {
            predate = -props.data.notBefore + "BCE";
        } else {
            predate = props.data.notBefore + "CE";
        }
    }
    if (props.data.notAfter !== undefined) {
        if (props.data.notAfter < 0) {
            predate = predate + "-" + (-props.data.notAfter) + "BCE";
        } else {
            predate = predate + "-" + props.data.notAfter + "CE";
        }
    }
    if (predate === "") {
        predate = "NA";
    }

    const date = generateElement("Date:", predate);
    const material = generateElement("Material:", props.material);
    const placeFound = generateElement("Place Found:", props.placeFound);
    const physicalType = generateElement("Physical Type:", props.physicalType);
    const oriUrl = generateElement("Original Site:", props.site);

    return (<div className="right">
        {oriUrl}
        {language}
        {dimensions}
        {date}
        {placeFound}
        {material}
        {physicalType}
        {generateData(props.data)}
    </div>);
};

const Side = props => {
    const diplomatic = generateElement("Diplomatic:", props.diplomatic);
    const transcription = generateElement("Transcription:", props.transcription);
    const translation = generateElement("Translation:", props.translation);
    let imgUrl = NAImage;

    if (whichProject(props.data) === 1 || (whichProject(props.data) === 2 && props.data.fotos === undefined)) {
        imgUrl = props.url;
        if (imgUrl === undefined) {
            imgUrl = NAImage;
        }

        return (<div className="left">
            <img className="figure" src={imgUrl} onError={(e) => {
                e.target.onerror = null;
                e.target.src = NAImage
            }} alt="figure"/>

            {diplomatic}
            {transcription}
            {translation}
        </div>);

    } else {
        if (props.data.fotos !== undefined) {
            imgUrl = props.data.fotos;
        }

        const panel = [];
        let i = 0;
        for (; i < imgUrl.length; i++) {
            panel.push(<img className="figure" src={imgUrl[i]} key={i} onError={(e) => {
                e.target.onerror = null;
                e.target.src = NAImage
            }} alt={imgUrl[i]}/>)
        }

        return (<div className="left">
            {panel}
            {diplomatic}
            {transcription}
            {translation}
        </div>);
    }

};

const Title = props => {
    if (whichProject(props.data) === 1) {
        return <h3>{props.id} - {props.placeFound}. {props.physicalType}</h3>
    } else {
        if (props.data.placeFound !== undefined) {
            return <h3>{props.id} - {props.placeFound}. {props.physicalType}</h3>
        } else {
            let spot = "NA";
            if (props.data.findspot_modern !== undefined && props.data.findspot_ancient !== undefined) {
                spot = props.data.findspot_modern + "/" + props.data.findspot_ancient + "(ancient)";
            }
            return <h3>{props.id} - {spot}. {props.physicalType}</h3>

        }
    }
};

class Detail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            auth: true,
            data: [],
            id: "",
            language: "",
            dimensions: "",
            notBefore: "",
            notAfter: "",
            placeFound: "",
            transcription: "",
            translation: "",
            material: "",
            physicalType: "",
            diplomatic: ""
        };
        this.componentDidMount = this.componentDidMount.bind(this);
    }

    componentDidMount() {
        window.scrollTo(0, 0);
        let data = JSON.parse(localStorage.getItem('detailData'));
        // console.log(data);
        if (data === null || data.length === 0) {
            this.setState({auth: false});
            return;
        }
        if (whichProject(data) === 1) {
            this.setState({
                data: data,
                url: "https://raw.githubusercontent.com/Brown-University-Library/iip-images/master/" + data.inscription_id.toLowerCase() + ".jpg",
                id: data.inscription_id,
                language: data.language_display,
                dimensions: data.dimensions,
                notBefore: data.notBefore,
                notAfter: data.notAfter,
                date: data.notBefore + "CE - " + data.notAfter + "CE",
                placeFound: data.city + ", " + data.region,
                transcription: data.transcription,
                translation: data.translation,
                material: data.material,
                physicalType: data.physical_type,
                diplomatic: data.diplomatic,
                site: "https://library.brown.edu/iip_development/viewinscr/" + data.inscription_id + "/"
            });
        } else if (whichProject(data) === 2) {
            this.setState({
                data: data,
                url: data.fotos,
                id: data.id,
                language: data.language,
                dimensions: "h: " + (data.height ? data.height : "NA") + " w: " + (data.width ? data.width : "NA") + " d: " + (data.depth ? data.depth : "NA"),
                notBefore: data.not_before,
                notAfter: data.not_after,
                date: data.not_before + "AD - " + data.not_after + "AD",
                placeFound: data.findspot ? data.findspot : data.findspot_modern,
                transcription: data.transcription,
                translation: data.translation,
                material: data.material,
                physicalType: data.type_of_monument,
                diplomatic: data.diplomatic_text,
                site: data.uri
            });

        }
    }

    render() {
        if (!this.state.auth) {
            return <div className="Detail">
                <div className="errMsg">Cannot reach page</div>
            </div>
        }


        return (
            <div className="Detail">
                <Title
                    data={this.state.data}
                    id={this.state.id}
                    placeFound={this.state.placeFound}
                    physicalType={this.state.physicalType}
                />

                <div className="up">
                    <Side
                        data={this.state.data}
                        diplomatic={this.state.diplomatic}
                        transcription={this.state.transcription}
                        translation={this.state.translation}
                        url={this.state.url}
                    />

                    <Common
                        language={this.state.language}
                        dimensions={this.state.dimensions}
                        date={this.state.date}
                        placeFound={this.state.placeFound}
                        material={this.state.material}
                        physicalType={this.state.physicalType}
                        data={this.state.data}
                        site={this.state.site}
                    />

                </div>
            </div>
        );
    }
}

export default Detail;
