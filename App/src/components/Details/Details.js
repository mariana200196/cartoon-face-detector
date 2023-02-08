import React, {useState} from "react";
import styles from "./Details.module.css";
import Card from "../UI/Card";

function Details(props) {
    //need to reset this
    let clientId = props.client;
    let selectedImage = props.imageName;
    let bbox = props.bbox;
    let bboxConf = props.bboxConf;
    let gender = props.gender;
    let genderConf = props.genderConf;
    let bboxImagePath = "http://" + process.env.REACT_APP_SERVER_DOMAIN + ":8000/getprediction/?id=" + props.client + "&fileName=" + props.imageName + "_bbox.png";
    let gradcamImagePath = "http://" + process.env.REACT_APP_SERVER_DOMAIN + ":8000/getprediction/?id=" + props.client + "&fileName=" + props.imageName + "_gradcam.png";

    // const [clientId, setClientId] = useState(null);
    // const [selectedImage, setSelectedImage] = useState(null);
    // const [bbox, setBbox] = useState([]);
    // const [bboxConf, setBboxConf] = useState(null);
    // const [gender, setGender] = useState(null);
    // const [genderConf, setGenderConf] = useState(null);
    // const [bboxImagePath, setBboxImagePath] = useState(null);
    // const [gradcamImagePath, setGradCamImagePath] = useState(null);

    try {
        // setClientId(props.client);
        // setSelectedImage(props.imageName);
        // setBbox(props.bbox);
        // setBboxConf(props.bboxConf);
        // setGender(props.gender);
        // setGenderConf(props.genderConf);
        // setBboxImagePath("http://" + process.env.REACT_APP_SERVER_DOMAIN + ":8000/getprediction/?id=" + clientId + "&fileName=" + selectedImage + "_bbox.png");
        // setGradCamImagePath("http://" + process.env.REACT_APP_SERVER_DOMAIN + ":8000/getprediction/?id=" + clientId + "&fileName=" + selectedImage + "_gradcam.png");
    } catch (error) {
        console.error(error);
        console.log("Make a prediction to see detection and classification predictions.");
    }

    return (
        <Card className={styles.containerDetails}>
            <Card className={styles.detailsPortrait}>
                <h3>Face Detection</h3>
                <img src={bboxImagePath} alt="Loading..."></img>
                <p>Prediction: {bbox}</p>
                <p>Confidence: {bboxConf}</p>
            </Card>
            <Card className={styles.detailsPortrait}>
                <h3>Gender Classification</h3>
                <img src={gradcamImagePath} alt="Loading..."></img>
                <p>Prediction: {gender}</p>
                <p>Confidence: {genderConf}</p>
            </Card>
        </Card>
    );
}

export default Details