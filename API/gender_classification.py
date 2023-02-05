import torch
import os
from torchvision import datasets, transforms
import torch.nn.functional as F

from helper_functions import create_dataloader

def classify_gender(id):
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
     
    dataloader = create_dataloader(id)

    class_names = ["female","male"]

    # Load model
    path_to_model = f"./Best_Classifier/output/model_best.pt"
    model = torch.load(path_to_model, map_location=torch.device(device))
    model.to(device)

    # Predict gender
    print(f"Starting gender prediction for {len(dataloader.dataset)} images...")
    predictions_list = []
    with torch.no_grad():
        for i, (inputs, labels) in enumerate(dataloader):
            inputs = inputs.to(device)
            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)
            conf = torch.max(F.softmax(outputs, dim=1)).item()
            path, _ = dataloader.dataset.samples[i]
            path = os.path.normpath(path)
            face_id = path.split("/")[-1].split(".png")[0]
            for j in range(inputs.size()[0]):
                gender = class_names[preds[j]]
                genderConf = "{:.2f}".format(round(conf * 100, 2))
                predictions_list.append({"id": face_id, "client_id": id, "gender": gender, "genderConf": genderConf})
                print(f"Gender prediction for {i+1}/{len(dataloader.dataset)} images completed.")

    # predictions_list = [
    #     {"id": "face0", "gender": "male", "genderConf": 0.99, "client_id": 1}, 
    #     {"id": "face1", "gender": "male", "genderConf": 0.95, "client_id": 1}, 
    #     {"id": "face2", "gender": "female", "genderConf": 0.62, "client_id": 1}, 
    #     {"id": "face3", "gender": "male", "genderConf": 0.92, "client_id": 1},
    #     {"id": "face4", "gender": "male", "genderConf": 0.77, "client_id": 1}
    # ]
    return predictions_list
