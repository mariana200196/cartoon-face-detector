## Setup
```
conda install -c conda-forge fastapi
conda install -c conda-forge uvicorn
conda install -c conda-forge python-multipart
conda install pytorch torchvision torchaudio cpuonly -c pytorch
conda install -c anaconda cython
install Visual Studio with C/C++ so that gcc and g++ get installed (check in command line by running gcc -v and g++ -v)
python -m pip install 'git+https://github.com/facebookresearch/detectron2.git'
conda install -c menpo opencv
conda install -c conda-forge aiohttp
conda install -c anaconda aiofiles

(conda install astunparse numpy ninja pyyaml setuptools cmake cffi typing_extensions future six requests dataclasses)
(conda install mkl mkl-include)
```

## Starting the Web Server

Navigating to the home directory via the command line (Anaconda) and run

```
uvicorn main:app --reload
```

If the start-up was successful, you should see `Application startup complete` printed in the command line. You can check that Uvicorn is running by entering http://localhost:8000/docs into your browser. 