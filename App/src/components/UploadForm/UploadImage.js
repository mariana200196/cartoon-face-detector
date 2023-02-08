import React, { useState, useRef } from "react";
import styles from "./UploadForm.module.css";

const UploadImage = (props) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const hiddenBrowseButton = useRef(null) // to style the Browse button

  function imageUploadHandler(event) {
    console.log(event.target.files[0]);
    setSelectedImage(event.target.files[0]);

    props.onCheckImage(event.target.files[0]);
  }

  function showImage() {
    let chosenImage = <img alt="default-img.jpg"
                           src="lightyear.jpg"
                           style={{maxHeight: 250}} />
    if (selectedImage) {
      chosenImage = <img alt="Not found. Please upload a valid image. Accepted file extensions are .png, .jpg, and .jpeg."  
                         src={URL.createObjectURL(selectedImage)}
                         style={{maxHeight: 250}} />
    }
    return chosenImage;
  }

  return (
    <div className={styles.containerImageDiv}>
        {showImage()}   
        <br /> 
        <input
          ref={hiddenBrowseButton}
          type="file"
          name="myImage"
          onChange={imageUploadHandler}
          style={{"display": "none"}}
        />
        <button style={{width: 80, marginTop: "1%"}} onClick={() => hiddenBrowseButton.current.click()}>Browse...</button>
    </div>
  );
};

export default UploadImage;
