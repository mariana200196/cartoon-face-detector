from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from torchvision import datasets, models, transforms
import torch
from PIL import Image
import numpy as np
import os
import asyncio

from helper_functions import create_dataloader


async def apply_gradCAM(id):
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

    # Load model
    path_to_model = f"./Best_Classifier/output/model_best.pt"
    model = torch.load(path_to_model, map_location=torch.device(device))
    model.to(device)

    # Create the Grad-CAM object
    target_layers = [model.layer4[-1]] # last layer
    cam = GradCAM(model=model, target_layers=target_layers)

    model.eval()

    dataloader = create_dataloader(id)

    # Grad-CAM analysis
    print(f"Starting Grad-CAM analysis for {len(dataloader.dataset)} images...")
    for i, (inputs, labels) in enumerate(dataloader):
        inputs = inputs.to(device)
        for j in range(inputs.size()[0]):
            inp = inputs.cpu().data[j]
            inp_np = inp.numpy().transpose((1, 2, 0))
            mean = np.array([0.485, 0.456, 0.406]) #ImageNet Mean
            std = np.array([0.229, 0.224, 0.225]) #ImageNet StdDev
            inp_np = std * inp_np + mean # denormalise image
            inp_float_np = np.clip(inp_np, 0, 1)

            input_tensor = inp.to(device)
            input_tensor = input_tensor.unsqueeze(0)
            grayscale_cam = cam(input_tensor)
            grayscale_cam = grayscale_cam[0, :]
            cam_image = show_cam_on_image(inp_float_np, grayscale_cam, use_rgb=True)
            act_map = Image.fromarray(cam_image)

            path, _ = dataloader.dataset.samples[i]
            path = os.path.normpath(path)
            new_path = path.split(".png")[0] + "_gradcam.png"

            act_map.save(new_path, format='PNG')

            print(f"Grad-CAM analysis for {i+1}/{len(dataloader.dataset)} images completed.")

    return