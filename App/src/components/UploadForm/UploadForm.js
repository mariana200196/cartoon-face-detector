import React, {useState, useEffect} from "react";
import styles from "./UploadForm.module.css";
import Card from "../UI/Card";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import UploadImage from "./UploadImage";

function UploadForm(props) {
    const [image, setImage] = useState(null);
    const [confThreshold, setConfThreshold] = useState(70);
    const [noDuplicate, setNoDuplicate] = useState(true);
    const [buttonTxt, setButtonTxt] = useState("Make Predictions");
    const [error, setError] = useState(null);

    // to set a default imagewhen the website first loads
    useEffect(() => {
        fetch('lightyear.jpg').then(res => res.blob()).then(blob => { 
            let defaultImage = new File([blob], "default-image.jpg",  {type: "image/jpeg"});
            setImage(defaultImage);
        })
    }, []);

    function confThresholdHandler(value) {
        setConfThreshold(value); 
        console.log(value);
    }

    function noDuplicateHandler() {
        // use function when state update depends on previous state
        setNoDuplicate((prevState) => {console.log(!prevState); return !prevState;})
    }

    function checkImageUpload(uploadedImage) {
        if (uploadedImage.type.includes("image/")) {
            setImage(uploadedImage);
            console.log("OK");
        } else {
            setImage(null);
            console.log("Please upload a valid image.");
        }
    }

    async function makePrediction() {
        setButtonTxt("Loading...\n This will take a couple minutes.");
        setError(null);
        props.onSubmit();

        try {
            const formData = new FormData();
            formData.append("file", image);

            const response = await fetch("http://" + process.env.REACT_APP_SERVER_DOMAIN + ":8000/predict/?confidence=" + confThreshold + "&noduplicates=" + noDuplicate,
            {
                method: "POST", 
                body: formData
            });
            if (!response.ok) {
                throw new Error(response.status + " error. There was a problem fetching the predictions.");
            }
            const data = await response.json();
            console.log(data);

            props.onResponse(data.result);
            setButtonTxt("Make New Predictions");
        } catch (error) {
            setButtonTxt("Error!\nCheck your browser console.");
            setError(error);
        }
    }

    function submitHandler(e) {
        // check that image has been uploaded
        try {
            if (image.type.includes("image/")) {
                e.preventDefault();
    
                const request = {
                    confThreshold: confThreshold/100,
                    noDuplicate: noDuplicate,
                };
                console.log(request);

                makePrediction();
            } else {
                e.preventDefault();
                console.log("Cannot submit form without valid image!");
            }
        } catch (error) {
            console.error(error);
            e.preventDefault();
            console.log("Cannot submit form without valid image!");
        }

        //to do double bindings, add line "setNoDuplicate(true);" here 
        //and in the input tag replace "defaultChecked" with "checked={noDuplicate}"
    }

    return (
        <Card className={styles.container}>
            <form className={styles.containerForm} onSubmit={submitHandler}>
                <Card className={styles.containerDescription}>
                CartoonFace Predictor is an AI that detects the presence
                of animated faces in imgaes and predicts their gender.
                Try it out by uploading a film frame from any Disney or 
                Pixar movie!
                </Card>
                <div className={styles.containerConf}>
                    <label className={styles.confLabel}>Confidence Threshold</label>
                    <Slider className={styles.confSlider}
                    min={50} max={100} defaultValue={70} 
                    marks={{ 50:50, 60:60, 70:70, 80:80, 90:90, 100:100 }} 
                    step={5} onAfterChange={confThresholdHandler} />
                </div>
                <div className={styles.containerConf}>
                    <label>Remove Duplicate Detections</label>
                    <input style={{"margin-left": "5%"}} type="checkbox" defaultChecked onChange={noDuplicateHandler} />
                </div>
                <div style={{"textAlign": "center"}}>
                    <button type="submit" className={styles.uploadButton}>{buttonTxt}</button>
                </div>
            </form>
            <Card className={styles.containerImage}>
                <UploadImage onCheckImage={checkImageUpload}></UploadImage>
            </Card>
        </Card>
    );
}

export default UploadForm;
