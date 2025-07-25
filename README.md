# Image Stack Uploader and Inference Viewer

## Front-End

For the development instruction please check the [dedicated README file](/fe/README.md)

## Back-End

For the development instruction please check the [dedicated README file](/be/README.md)

## LM Model

We used MobileNetV2 via [keras](https://keras.io/) and then we optimized the performance using [openvino](https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/download.html?PACKAGE=OPENVINO_BASE&VERSION=v_2025_2_0&OP_SYSTEM=WINDOWS&DISTRIBUTION=PIP).

The optimization is done programmatically. When you run the server, the app check if the optimized model exists, and if not, it will create it. Subsequent runs will use the optimized model as it already exists.

### Benchamrking

We have a script that benchmarks the optimized (openvino) vs the unoptimized (tensorflow) models. You can run it like this

```bash
cd be
python benchmark.py --image [IMAGE_PATH] --repeat [REPEAT]
```

where

- `IMAGE_PATH` is the relative path to the image that will be used for classification. This parameter is required.
- `REPEAT` is the number of runs. This parameter is optional, and the default is 10 runs.

The script will run the prediction logic multiple times, and calculate the maximum, minimum, and average times it took to run the logic. It will then print the hardware specs of the machine used to run the benchmark, and the times of both the optimized and the unoptimized models. Also it will plot the numbers and save it to a file called `benchmark_results.png`.

Here are the results from my machine:

```
==================================================
Benchmark Report

OS: Linux 6.6.87.2-microsoft-standard-WSL2 (#1 SMP PREEMPT_DYNAMIC Thu Jun  5 18:30:46 UTC 2025)
CPU: Intel(R) Core(TM) i9-14900K
Cores: 16 physical / 32 logical
Frequency: 3187 MHz
--------------------------------------------------
Benchmark Task (10 runs):
        tensorflow
                Min: 0.059565067291259766
                Avg: 0.10631790161132812
                Max: 0.48876285552978516
        openvino
                Min: 0.059224843978881836
                Avg: 0.06182143688201904
                Max: 0.06464433670043945
==================================================
```

[Plot](./benchmark_results.png)
