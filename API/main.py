from typing import Union
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import StreamingResponse, Response, FileResponse
from PIL import Image
import io
import uvicorn
import os
import asyncio

from face_detection import detect_face
from helper_functions import crop_portraits, generate_id, trace_bbox, load_classifier, load_detector
from gender_classification import classify_gender
from gradCAM import apply_gradCAM

app = FastAPI()
current_dir = os.getcwd() # make sure the directory path to the static file is reachable from the current_dir
app.mount("/static", StaticFiles(directory='static'), name="static")

origins = [
    "http://localhost:3000",
    "http://ec2-3-83-155-104.compute-1.amazonaws.com:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {
        "result" : [
            {"id": "face0", "gender": "male", "genderConf": 0.99, "client_id": "0", "bbox": ["x1", "y1", "w", "h"], "bboxConf": 0.99}, 
            {"id": "face1", "gender": "male", "genderConf": 0.95, "client_id": "0", "bbox": ["x1", "y1", "w", "h"], "bboxConf": 0.99}, 
            {"id": "face2", "gender": "female", "genderConf": 0.62, "client_id": "0", "bbox": ["x1", "y1", "w", "h"], "bboxConf": 0.99}, 
            {"id": "face3", "gender": "male", "genderConf": 0.92, "client_id": "0", "bbox": ["x1", "y1", "w", "h"], "bboxConf": 0.99},
            {"id": "face4", "gender": "male", "genderConf": 0.77, "client_id": "0", "bbox": ["x1", "y1", "w", "h"], "bboxConf": 0.71}
        ]
    }


@app.get("/getprediction/")
def getprediction(id: str = None, fileName: str = None):
    #print("Received client request for image.")
    path = f"./static/images/{id}/out/{fileName}"
    #print("Sending image to client.")
    return FileResponse(path, media_type="image/png")


@app.post("/predict/")
async def predict(file: UploadFile = File(...), confidence: float = 0.7, noduplicates: bool = True):
    print("Received client request for predictions.")
    id = generate_id()

    # Read image
    file_bytes = file.file.read()
    image = Image.open(io.BytesIO(file_bytes))
    image.save(f"./static/images/{id}/frame.png", format='PNG')

    # Get face detections
    portraits_list, metadata_bbox = detect_face(image, id, confidence/100, noduplicates)

    if len(portraits_list) > 0:
        # Save portraits
        crop_portraits(portraits_list, image, id)

        # Get gender predictions
        metadata_gender = classify_gender(id)

        # Create Grad-CAM portraits
        await asyncio.gather(apply_gradCAM(id))

        # Save portraits with bbox outline
        await asyncio.gather(trace_bbox(metadata_bbox, portraits_list, image, id))

    # Merge detection and gender predictions
    predictions_list = []
    for i, prediction in enumerate(metadata_bbox):
        predictions_list.append({**prediction, **metadata_gender[i]}) # prediction | metadata_gender[i] for Python >= 3.9

    print("Sending predictions to client.")
    return {"result": predictions_list}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
    
    #DEFAULT_CLASSIFIER = load_classifier()
    #DEFAULT_DETECTOR, DEFAULT_CFG = load_detector() #the detector needs to be loaded with the unique configs if not default