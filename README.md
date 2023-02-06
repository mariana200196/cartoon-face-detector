CartoonFace Predictor is an AI that detects the presence of animated faces in imgaes and predicts their gender. Try it out [here](http://ec2-3-83-155-104.compute-1.amazonaws.com:3000/).

![Demo](https://github.com/mariana200196/cartoon-face-detector/blob/main/App/demoscreenshot.png)

## Dependencies
- python3 (including development tools)
- fastapi
- uvicorn
- gunicorn
- python-multipart
- opencv (opencv-python-headless==4.6.0.66)
- aiohttp
- aiofiles
- gcc and g++ (on Windows install Visual Studio with C/C++ add-on)
- Cython
- PyTorch (pip3 install torch==1.10.0+cpu torchvision==0.11.0+cpu torchaudio==0.10.0 -f https://download.pytorch.org/whl/torch_stable.html)
- [detectron2](https://github.com/facebookresearch/detectron2) (python3 -m pip install detectron2 -f https://dl.fbaipublicfiles.com/detectron2/wheels/cpu/torch1.10/index.html)
- [grad-cam](https://github.com/jacobgil/pytorch-grad-cam)
- Node.js (>= 16) and npm

## Start server (API)
Navigate to root directory (where main-py is) and run `gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000`.

If the start-up is successful, `Application startup complete` will be printed in the command line.

Check that the server is reachable at `http://localhost:8000/docs`.

## Start client (App)
Navigate to root directory (where package.json is) and install required packages with `npm install`.

Start the app by running `npm start`.

Check that the webpage is reachable at `http://localhost:3000`.