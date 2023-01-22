import random
import os
import shutil
from PIL import Image, ImageDraw
import torch
from torchvision import datasets, transforms
from detectron2.utils.logger import setup_logger
from detectron2.config import get_cfg
from detectron2.engine import DefaultPredictor
import asyncio

def crop_portraits(portraits_list, film_frame, id):
    print(f"Cropping {len(portraits_list)} images...")
    for i, portrait in enumerate(portraits_list):
        x1, y1, w, h = portrait
        cropped = film_frame.crop((x1, y1, x1+w, y1+h))
        # Save portrait
        path = f"./static/images/{id}/out/face{i}.png"
        cropped.save(path, format='PNG')
        print(f"Cropped {i+1}/{len(portraits_list)} portraits.")
    return

async def trace_bbox(metadata_bbox, portraits_list, film_frame, id):
    print(f"Tracing bbox for {len(portraits_list)} images...")
    for i, bbox in enumerate(metadata_bbox):
        x1, y1, w, h = bbox["bbox"]
        coordinates = [(x1, y1), (x1+w, y1+h)]
        # Draw bbox
        copy = film_frame.copy()
        draw = ImageDraw.Draw(copy)
        draw.rectangle(coordinates, outline ="green")
        # Crop
        x1, y1, w, h = portraits_list[i]
        cropped = copy.crop((x1, y1, x1+w, y1+h)).resize((224,224))
        # Save portrait
        path = f"./static/images/{id}/out/face{i}_bbox.png"
        cropped.save(path, format='PNG')
        print(f"Traced {i+1}/{len(portraits_list)} bboxes.")
    return

def generate_id():
    id = random.randint(0,10)
    dir = f"./static/images/{id}/out"
    if os.path.exists(dir):
        shutil.rmtree(f"./static/images/{id}")
    os.makedirs(dir)
    return id

def create_dataloader(id):
    data_transforms = { 
        'inference': transforms.Compose([ 
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                [0.485, 0.456, 0.406], #ImageNet Mean
                [0.229, 0.224, 0.225] #ImageNet StdDev
            ) 
        ])
    }
    path = f"./static/images/{id}"
    image_dataset = datasets.ImageFolder(path, data_transforms['inference'])
    # batch size 1 so can get file names correctly
    dataloader = torch.utils.data.DataLoader(image_dataset, batch_size=1, shuffle=False, num_workers=2)
    return dataloader

def load_classifier():
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    path_to_model = f"./Best_Classifier/output/model_best.pt"
    model = torch.load(path_to_model, map_location=torch.device(device))
    model.to(device)
    return model

def load_detector():
    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    setup_logger()
    cfg = get_cfg()
    cfg.merge_from_file("./Best_Detector/output/config.yaml")
    cfg.MODEL.ROI_HEADS.SCORE_THRESH_TEST = 0.7
    cfg.MODEL.WEIGHTS = "./Best_Detector/output/model_final.pth"
    cfg.MODEL.ROI_HEADS.NUM_CLASSES = 1 # "Face"
    cfg.MODEL.DEVICE = device
    predictor = DefaultPredictor(cfg)
    return predictor.model, cfg