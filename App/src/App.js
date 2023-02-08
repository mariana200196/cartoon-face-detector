import React, {useState} from "react";
import UploadForm from "./components/UploadForm/UploadForm";
import Carousel from "./components/Carousel/Carousel";
import Details from "./components/Details/Details";
import { Card } from "react-bootstrap";

function App() {

  const [response, setResponse] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageBbox, setSelectedImageBbox] = useState([]);
  const [selectedImageBboxConf, setSelectedImageBboxConf] = useState(null);
  const [selectedImageGender, setSelectedImageGender] = useState(null);
  const [selectedImageGenderConf, setSelectedImageGenderConf] = useState(null);

  function refresh() {
    setResponse(null);
    setSelectedImage(null);
    renderCarousel()
    renderDetails()
  }
  
  function recordResponse(l) {
    let resDic = {};
    if (l.length > 0) {
      setClientId(l[0].client_id);

      l.map(prediction => {
        resDic[prediction.id] = {
          "bbox": prediction.bbox,
          "bboxConf": prediction.bboxConf,
          "gender": prediction.gender,
          "genderConf": prediction.genderConf,
          "clientId": prediction.clientId,
          "fileName": prediction.id + ".png"
        };
      });
    }
    setResponse(resDic);
  }

  function selectImage(k) {
    setSelectedImage(k);
    setSelectedImageBbox(response[k].bbox.join(" px, ") + " px");
    setSelectedImageBboxConf(response[k].bboxConf + " %");
    setSelectedImageGender(response[k].gender);
    setSelectedImageGenderConf(response[k].genderConf + " %");
  }

  function renderCarousel() {
    let renderedCarousel = <Card style={{"boxShadow": "none"}}></Card>
    if (response && Object.keys(response).length > 0) {
      renderedCarousel = <Carousel client={clientId} faceList={response} onImageSelection={selectImage}></Carousel>
    } else if (response && Object.keys(response).length === 0) {
      console.log("no faces detected");
      renderedCarousel = <Card style={{"backgroundColor": "white", "textAlign": "center"}}><p>No faces were detected.</p></Card>
    }
    return renderedCarousel;
  }

  function renderDetails() {
    let renderedDetails = <Card style={{"boxShadow": "none"}}></Card>
    if (selectedImage) {
      renderedDetails = <Details client={clientId}
                          imageName={selectedImage} 
                          bbox={selectedImageBbox} 
                          bboxConf={selectedImageBboxConf} 
                          gender={selectedImageGender} 
                          genderConf={selectedImageGenderConf} />
    }
    return renderedDetails;
  }

  return (
    <div>
      <h1>CartoonFace Predictor</h1>
      <UploadForm onSubmit={refresh} onResponse={recordResponse}></UploadForm>
      {renderCarousel()}
      {renderDetails()}
    </div>
  );
}

export default App;
