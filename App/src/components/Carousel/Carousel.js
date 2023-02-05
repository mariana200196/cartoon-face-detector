import React, {useState} from "react";
import "./Carousel.css";
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
    
    const [indexDic, setIndexDic] = useState({});
    let iDic = {};
    const [prevHighlighted, setPrevHighlighted] = useState(null);
    const [currIndex, setCurrIndex] = useState(0);

    function showImageDetails(e, imageName) {
        // does this depend on previous state?
        try {
            if (prevHighlighted) {
                document.getElementById(prevHighlighted).style.boxShadow = "none"; 
            }
        } catch (error) {
            console.log(error);
            console.log("document.getElementById(prevHighlighted) no longer exists.")
            setPrevHighlighted(null);
        }
        e.target.style.boxShadow = "0 2px 20px gold";
        setPrevHighlighted(imageName);
        props.onImageSelection(imageName);

        //setCurrIndex(parseInt(imageName.replace('.png','').replace('face','')));
        setCurrIndex(iDic[imageName])
    }

    function getGender(k) {
        if (Object.keys(props.faceList).length > 0) {
            let gender = props.faceList[k].gender;
            return (<Card className="portrait-label">
            <p>{gender}</p>
            </Card>);
        } else {
            return null;
        }
    }

    function populateCarousel(ks) {
        let l = [];
        iDic = {};
        //make getting the gender less hacky
        ks.forEach(function(k, i) { 
            l.push(
                <div>
                    <Card className="portrait">
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
        //setIndexDic(iDic);
        return l;
    }

    const handleDragStart = (e) => e.preventDefault();
    const items = populateCarousel(Object.keys(props.faceList));
    const responsive = {
        0: { items: 1 },
        320: {items: 2 },
        470: {items: 3 },
        620: {items: 4 },
        770: { items: 5 },
        920: { items: 6 }
    };

    return (
        <Card className="container-carousel">
                <AliceCarousel 
                mouseTracking 
                items={items} 
                responsive={responsive} 
                keyboardNavigation="true" 
                disableButtonsControls="true" 
                activeIndex={currIndex} />
        </Card>
/*         <div>
            <Card className="container">
                {imageKeys.map(k => <img src={images[k]} key={k} alt="Not found" />)}
            </Card>
        </div> */
    );
}

export default Carousel;