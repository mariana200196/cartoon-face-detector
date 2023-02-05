import React, { useState } from "react";

const UploadImage = (props) => {
  const [selectedImage, setSelectedImage] = useState(null);

  function imageUploadHandler(event) {
    console.log(event.target.files[0]);
    setSelectedImage(event.target.files[0]);

    props.onCheckImage(event.target.files[0]);
  }

  return (
    <div style={{"textAlign":"center"}}>
        {selectedImage && (
            // <div>
            <img alt="Not found. Please upload a valid image. Accepted file extensions are .png, .jpg, and .jpeg ." 
            width={"100%"} 
            src={URL.createObjectURL(selectedImage)}
            style={{"maxHeight": "350px", "width": "auto"}} />
            // <br />
            // <button onClick={()=>setSelectedImage(null)}>Remove</button>
            // </div>
        )}     
        <br /> 
        <input
          type="file"
          name="myImage"
          onChange={imageUploadHandler}
        />
    </div>
  );
};

export default UploadImage;