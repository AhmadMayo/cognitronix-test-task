# Image Stack Uploader and Inference Viewer

## Front-End

### Tech stack

- Vite: It's the latest toolchain with almost all of the necessary configuration out of the box, and the compatibility with rollup APIs which allows us to utilize the existing ecosystem if we wanted to.
- React: Mainly because of ant design.
- Ant Design: It's the most comprehensive components library available in the market across all FE frameworks. It's theming is also highly customizable, and it's very actively maintained.
- Typescript: The productivity boost gained from the type safety is a huge benefit.

### Development

For the development instruction please check the [dedicated README file](/fe/README.md)

### Limitations and Assumptions

- I assumed that testing the app may include uploading large files, losing the state and being forced to re-upload on page refresh was a huge downside, so I opted to show the previously uploaded folders to prevent this from happening.
- As it was explicitly stated in the requirements that the images should be shown in a slider, and clicking the image should trigger the prediction, I couldn't come up with a good UX for adding additional functionality. If I had more freedom, I'd show each uploaded folder as a gallery, each image in a card with explicit actions - panning, zooming, cropping, and prediction.

## Back-End

### Tech stack

- Django: It's "batteries included" philosophy contributed to the commitment to the deadline.
- djangorestframework: TO be able to build APIs with minimal manual configuration.

### Development

For the development instruction please check the [dedicated README file](/be/README.md)

### Limitations and Assumptions

- The app is only intended for demo purposes, so the risk of filling the storage by uploading multiple large files was not acceptable. So I decided to only keep the last 2 uploaded folders.
- Another limitation that I intentionally introduced to mitigate the risk of filling the storage, is that the uploaded folder must not exceed 10 MB.
- Additional validations were ignored, but in real life scenarios they should be implemented, like:
  - Validating that the uploaded zip file only contains PNG files, and no nested directories.
  - Validating PNG files by reading the binary header from the contents of the file.

## LM Model

We used MobileNetV2 via [keras](https://keras.io/) and then we optimized the performance using [openvino](https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/download.html?PACKAGE=OPENVINO_BASE&VERSION=v_2025_2_0&OP_SYSTEM=WINDOWS&DISTRIBUTION=PIP).

The optimization is done programmatically. When you run the server, the app check if the optimized model exists, and if not, it will create it. Subsequent runs will use the optimized model as it already exists.

### Limitations and Assumptions

- As I don't fully understand the optimization that I did to the model, I may have accidentally caused degradation in the model's prediction capabilities. Additional investigation and testing could be done to ensure higher quality.

### Benchmarking

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

```bash
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
