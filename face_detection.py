import torch
import json
import itertools
import os
from detectron2.utils.logger import setup_logger
from detectron2.config import get_cfg
from detectron2.engine import DefaultPredictor
from detectron2.evaluation import COCOEvaluator, inference_on_dataset
from detectron2.data import build_detection_test_loader, DatasetCatalog, MetadataCatalog


def get_board_dicts(input):
    l = [input]
    return l


def lowest_conf_pred(pair):
    if pair[1]["score"] <= pair[0]["score"]:
        return pair[1]["image_id"], pair[1]["bbox"][0] # no id value to return :(
    else:
        return pair[0]["image_id"], pair[0]["bbox"][0]


def check_intersection(pairs):
    # Store prediction ids that are duplicate detections in image
    preds_to_remove = []
    for pair in pairs:
        # Calculate area of each bbox
        a_area = pair[0]["bbox"][2] * pair[0]["bbox"][3]
        b_area = pair[1]["bbox"][2] * pair[1]["bbox"][3]
        # Calculate intersection overlap
        # Bounding box format is [top-left-x, top-left-y, width, height]
        a_x1 = pair[0]["bbox"][0]
        a_y1 = pair[0]["bbox"][1]
        a_x2 = pair[0]["bbox"][0] + pair[0]["bbox"][2]
        a_y2 = pair[0]["bbox"][1] + pair[0]["bbox"][3]
        b_x1 = pair[1]["bbox"][0]
        b_y1 = pair[1]["bbox"][1]
        b_x2 = pair[1]["bbox"][0] + pair[1]["bbox"][2]
        b_y2 = pair[1]["bbox"][1] + pair[1]["bbox"][3]
        dx = min(a_x2, b_x2) - max(a_x1, b_x1)
        dy = min(a_y2, b_y2) - max(a_y1, b_y1)
        if (dx>=0) and (dy>=0):
            intersection = dx*dy
            # Is the intersection of either bbox area greater than 50%?
            a_overlap = intersection / a_area
            b_overlap = intersection / b_area
            if a_overlap >= 0.5 or b_overlap >= 0.5:
                image_id, bbox_x1 = lowest_conf_pred(pair)
                markers = (image_id, bbox_x1)
                preds_to_remove.append(markers)
        else:
            #print("No intersection")
            continue
    return(preds_to_remove)


def remove_duplicate_detections(id):
    json_file = f"./static/images/{id}/out/coco_instances_results.json"
    with open(json_file) as f:
        predictions = json.load(f)
    
    # Sort the boxes from highest to lowest conf score
    predictions.sort(key=lambda x: x["score"], reverse=True)
    # Create list with all unique pair-wise permutations
    pair_order_list = itertools.combinations(predictions,2)
    pairs = list(pair_order_list)
    num_pairs = len(pairs)
    # Skip if only one prediction in image
    if num_pairs == 0:
        return
    # Get predictions that are duplicate detections
    preds_to_remove = check_intersection(pairs)
    unique_complete_list = list(set(preds_to_remove))
    
    # Update predictions dict
    new_predictions = []
    for x in predictions:
        if (x["image_id"], x["bbox"][0]) not in unique_complete_list:
            new_predictions.append(x)
    print(f"Predictions remaining after duplicate detection removal: {len(new_predictions)}/{len(predictions)}")
    
    # Save file
    os.rename(f"{json_file}", f"./static/images/{id}/out/coco_instances_results_original.json")
    with open(f"{json_file}", 'w') as fp:
        json.dump(new_predictions, fp)
    
    return


def expand_bbox(bbox_list, image_width, image_height):
    portraits_list = []
    for bbox in bbox_list:
        x1, y1, w, h = list(map(int, bbox)) # convert float annots to int
        # Increase the bbox size while ensuring it remains within image coordinates
        new_x1 = max(x1 - int(w*0.25), 0)
        new_y1 = max(y1 - int(h*0.5), 0)
        new_w = min(w + int(w*0.5), image_width)
        new_h = min(h + int(h*0.75), image_height)
        expanded_bbox = [new_x1, new_y1, new_w, new_h]
        portraits_list.append(expanded_bbox)

    return portraits_list


def detect_face(image, id, confidence_threshold, remove_duplicates):
    device = "cuda:0" if torch.cuda.is_available() else "cpu"

    width, height = image.size
    path = f"./static/images/{id}/frame.png"
    input = {"image_id": 0, "file_name": path, "width": width, "height": height, "annotations": []}

    # Register dataset
    for d in ["inference"]:
        DatasetCatalog.register(f"inference_{id}", lambda d=d: get_board_dicts(input)) 
        MetadataCatalog.get(f"inference_{id}").set(thing_classes=["Face"])

    # Detect faces
    setup_logger()
    cfg = get_cfg()
    cfg.merge_from_file("./Best_Detector/output/config.yaml")
    cfg.MODEL.ROI_HEADS.SCORE_THRESH_TEST = confidence_threshold
    cfg.MODEL.WEIGHTS = "./Best_Detector/output/model_final.pth"
    cfg.MODEL.ROI_HEADS.NUM_CLASSES = 1 # "Face"
    cfg.MODEL.DEVICE = device
    predictor = DefaultPredictor(cfg)
    evaluator = COCOEvaluator(f"inference_{id}", cfg, False, output_dir=f"./static/images/{id}/out/")
    test_loader = build_detection_test_loader(cfg, f"inference_{id}")
    inference_on_dataset(predictor.model, test_loader, evaluator)

    if remove_duplicates:
        remove_duplicate_detections(id)

    # Read predictions saved in out/coco_instances_results.json
    bbox_list = []
    metadata = []
    json_file = f"./static/images/{id}/out/coco_instances_results.json"
    with open(json_file) as f:
        predictions_dic = json.load(f)
    for prediction in predictions_dic:
        bbox_list.append(prediction["bbox"])

        coordinates = list(map(int, prediction["bbox"]))
        conf = "{:.2f}".format(round(prediction["score"] * 100, 2))
        metadata.append({"bbox": coordinates, "bboxConf": conf})

    portraits_list = expand_bbox(bbox_list, width, height)

    return portraits_list, metadata