import React, {useState} from "react";
import styles from "./Carousel.module.css";
import Card from "../UI/Card";
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';

// // fetch all images in the folder at BUILD-time
// const [images, imageKeys] = importAll(require.context('../../images', false, /face[0-9]+\.(png|jpe?g|svg)$/));
// function importAll(r) {
//     // // Use these line if you like to access arrays using an integer index, e.g. <img src={images[0]} alt="Not found" />
//     // let images = [];
//     // r.keys().map((item, index) => { images.push(r(item)); });
    
//     //Use these line if you want to access each image using the file name.
//     let images = {};
//     r.keys().map((item, index) => { images[item.replace('./','')] = r(item); });
//     console.log(images);
//     return [images, Object.keys(images)];
// }


function Carousel(props) {
    
    let iDic = {};
    const [prevHighlighted, setPrevHighlighted] = useState(null);
    const [currIndex, setCurrIndex] = useState(0);

    function showImageDetails(e, imageName) {
        // handle when new image has fewer predictions (e.g. 3) and 
        // previously a higher numbered face (e.g. >= 4th in carousel) was selected
        try {
            if (prevHighlighted) {
                document.getElementById(prevHighlighted).style.boxShadow = "none"; 
            }
        } catch (error) {
            console.log(error);
            console.log("document.getElementById(prevHighlighted) no longer exists.")
            setPrevHighlighted(null);
        }
        // highligh the currently selected face
        e.target.style.boxShadow = "0 2px 20px gold";
        setPrevHighlighted(imageName);
        props.onImageSelection(imageName);

        setCurrIndex(iDic[imageName])
    }

    function getGender(k) {
        if (Object.keys(props.faceList).length > 0) {
            let gender = props.faceList[k].gender;
            return (<Card className={styles.portraitLabel}>
            <p>{gender}</p>
            </Card>);
        } else {
            return null;
        }
    }

    function populateCarousel(ks) {
        let l = [];
        iDic = {};

        ks.forEach(function(k, i) { 
            l.push(
                <div>
                    <Card className={styles.portrait}>
                        <img
                        id={k} 
                        src={"http://" + process.env.REACT_APP_SERVER_DOMAIN + ":8000/getprediction/?id=" + props.client + "&fileName=" + k + ".png"}
                        style={{maxHeight:"100%", maxWidth:"100%", cursor:"pointer", boxShadow:"none"}} 
                        onDragStart={handleDragStart} 
                        role="presentation"
                        onClick={(e) => showImageDetails(e, k)} />
                    </Card> 
                    {getGender(k)}
                </div>
            );
            iDic[k] = i; 
        });

        return l;
    }

    const handleDragStart = (e) => e.preventDefault();
    const items = populateCarousel(Object.keys(props.faceList));
    // each face requires at least 160 px of space
    const responsive = {
        0: { items: 1 },
        340: {items: 2 },
        500: {items: 3 },
        660: {items: 4 },
        820: { items: 5 },
        980: { items: 6 },
        1140: { items: 7 },
        1300: { items: 8 }
    };

    return (
        <Card className={styles.containerCarousel}>
                <AliceCarousel 
                mouseTracking 
                items={items} 
                responsive={responsive} 
                keyboardNavigation="true" 
                disableButtonsControls="true" 
                activeIndex={currIndex} />
        </Card>
    );
}

export default Carousel;