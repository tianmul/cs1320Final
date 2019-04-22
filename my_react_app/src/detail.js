import React, {Component} from 'react';
import './detail.css';
import NAImage from "./notAvaliable.jpg"

const proj2 = ["id", "fotos", "language", "height", "width", "depth", "not_before", "not_after"
    , "findspot_ancient", "findspot_modern", "transcription", "material", "type_of_monument", "trismegistos_uri", "diplomatic_text", "country", "social_economic_legal_history"];

const generateElement = (key, value) => {
    // Error checking
    if (value === undefined || value.length === 0 || (value.length === 1 && value[0] === "")) {
        console.log(key);
        value = "NA";
    }
    if (value.includes("<") || value.includes(">")) {
        // Remove span tags
        if (value.includes("<span>")) {
            value = value.replace("<span>", "");
            value = value.replace("</span>", "");
        }
        value = stripHTML(value);
    }

    return (
        <div key={key} className="row">
            <div className="field_des">{key}</div>
            <div className="field_con">{value}</div>
        </div>
    );
};

// const generateSub = (key, value) => {
//     return (
//         <div key={key} className="row">
//             <div className="sub_field_des">{key}</div>
//             <div className="sub_field_con">{value}</div>
//         </div>
//     );
// };

// Remove HTML tags
function stripHTML(text) {
    return text.replace(/<.*?>/gm, '\n');
}

function generateData(data) {
    if (whichProject(data)) {
        return generateElement("Description:", data["description"]);
    }
    const newData = Object.keys(data).reduce((result, currentKey) => {
        if ((typeof data[currentKey] === 'string' || data[currentKey] instanceof String)) {
            const elementToPush = generateElement(currentKey, data[currentKey]);
            if (!proj2.includes((currentKey))) {
                result.push(elementToPush);
            }
        } else {
            console.log(currentKey);
            let toDisplay = data[currentKey][0];
            // const nested = generateData(toDisplay);
            // result.push(nested);
            for (let i = 1; i < data[currentKey].length; i++) {
                toDisplay = toDisplay + ", " + data[currentKey][i];
                console.log(toDisplay);
            }
            const nested = generateData(data[currentKey]);
            const elementToPush = generateElement(currentKey, nested);

            result.push(elementToPush);
        }
        return result;
    }, []);
    console.log(newData);
    return newData;
}

// JSON from which project, return T for iip, F for HD
function whichProject(data) {
    let keys = Object.keys(data);
    return keys.includes("inscription_id");
}

const Common = props => {
    const language = generateElement("Languages:", props.language);
    const dimensions = generateElement("Dimensions:", props.dimensions);
    let predate = "";
    if (props.data.notBefore !== undefined && props.data.notBefore < 0) {
        let from = -props.data.notBefore;
        predate = from + " BCE";
    } else {
        predate = props.data.notBefore + " CE";
    }
    if (props.data.notAfter !== undefined && props.data.notAfter < 0) {
        let to = -props.data.notAfter;
        predate = predate + " - " + to + " BCE";
    } else {
        predate = predate + " - " + props.data.notAfter + " CE";
    }

    const date = generateElement("Date:", predate);
    const material = generateElement("Material:", props.material);
    const placeFound = generateElement("Place Found:", props.placeFound);
    const physicalType = generateElement("Physical Type:", props.physicalType);

    return (<div className="right">
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

    if (whichProject(props.data)) {
        imgUrl = props.url;
    } else {
        if (props.data.fotos !== undefined) {
            imgUrl = props.data.fotos;
        }

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

};

const Title = props => {
    if (whichProject(props.data)) {
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
        let data = JSON.parse(localStorage.getItem('detailData'));
        console.log("detail page: ", data);
        if (whichProject(data)) {
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
                diplomatic: data.diplomatic
            });
        } else {
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
                diplomatic: data.diplomatic_text
            });

        }
    }

    render() {
        return (
            <div>
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
                    />

                </div>
            </div>
        );
    }
}

export default Detail;
