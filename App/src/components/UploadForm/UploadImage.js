import React, { useState, useRef } from "react";

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
                           width={"100%"} 
                           src="lightyear.jpg"
                           style={{"maxHeight": "350px", "width": "auto"}} />
    if (selectedImage) {
      chosenImage = <img alt="Not found. Please upload a valid image. Accepted file extensions are .png, .jpg, and .jpeg." 
                         width={"100%"} 
                         src={URL.createObjectURL(selectedImage)}
                         style={{"maxHeight": "350px", "width": "auto"}} />
    }
    return chosenImage;
  }

  return (
    <div style={{"textAlign":"center"}}>
        {showImage()}   
        <br /> 
        <input
          ref={hiddenBrowseButton}
          type="file"
          name="myImage"
          onChange={imageUploadHandler}
          style={{"display": "none"}}
        />
        <button onClick={() => hiddenBrowseButton.current.click()}>Browse...</button>
    </div>
  );
};

export default UploadImage;
