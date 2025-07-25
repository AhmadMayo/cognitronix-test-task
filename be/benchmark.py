from os import path
import platform
import psutil
import cpuinfo
from pathlib import Path
import time
import argparse
import matplotlib.pyplot as plt
from matplotlib.ticker import MaxNLocator
from keras.applications.mobilenet_v2 import (
    MobileNetV2,
    preprocess_input,
)
import numpy as np
from PIL import Image
from openvino import convert_model, compile_model, save_model, Core


BASE_DIR = Path(__file__).resolve().parent
mobilenet_model = MobileNetV2(weights="imagenet")
model_path = path.join(BASE_DIR, "mobile_net_v2_tf")
if not path.exists(model_path):
    mobilenet_model.export(model_path)

model_xml_path = path.join(BASE_DIR, "mobilenet_v2.xml")
if not path.exists(model_xml_path):
    ov_model = convert_model(model_path)
    save_model(ov_model, "model.xml")
else:
    core = Core()
    ov_model = core.read_model(model_xml_path)

compiled_model = compile_model(ov_model, device_name="CPU")
output_layer = compiled_model.output(0)


def run_tensorflow(image_path):
    try:
        with Image.open(image_path) as img:
            img = img.convert("RGB")
            img = img.resize((224, 224))
            converted_image = np.array(img)
            converted_image = np.expand_dims(converted_image, axis=0)
            converted_image = preprocess_input(converted_image)
            predictions = mobilenet_model.predict(converted_image)
            return predictions

    except Exception as e:
        print("Error while running the tensorflow prediction", e)


def run_openvino(image_path):
    try:
        with Image.open(image_path) as img:
            img = img.convert("RGB")
            img = img.resize((224, 224))
            converted_image = np.array(img)
            converted_image = np.expand_dims(converted_image, axis=0)
            converted_image = preprocess_input(converted_image)
            predictions = compiled_model([converted_image])[output_layer]
            return predictions

    except Exception as e:
        print("Error while running the openvino prediction", e)


def calculate_min_max_avg(fn, image_path, repeat):
    times = []
    for _ in range(repeat):
        start = time.time()
        fn(image_path)
        end = time.time()
        times.append(end - start)
    min_time = min(times)
    avg_time = sum(times) / len(times)
    max_time = max(times)
    return (min_time, avg_time, max_time)


def print_report(repeat, values):
    os_name = platform.system()
    os_release = platform.release()
    os_version = platform.version()

    cpu = cpuinfo.get_cpu_info()
    cpu_brand = cpu["brand_raw"]
    logical_cores = psutil.cpu_count(logical=True)
    physical_cores = psutil.cpu_count(logical=False)
    freq = psutil.cpu_freq()

    print("=" * 50)
    print(f"Benchmark Report\n")
    print(f"OS: {os_name} {os_release} ({os_version})")
    print(f"CPU: {cpu_brand}")
    print(f"Cores: {physical_cores} physical / {logical_cores} logical")
    print(f"Frequency: {round(freq.current)} MHz")
    print("-" * 50)
    print(f"Benchmark Task ({repeat} runs):")

    for key, [min, avg, max] in values.items():
        print(f"\t{key}")
        print(f"\t\tMin: {min}")
        print(f"\t\tAvg: {avg}")
        print(f"\t\tMax: {max}")
    print("=" * 50)


def main():
    parser = argparse.ArgumentParser(
        description="Benchmark TF vs OpenVINO on MobileNetV2"
    )
    parser.add_argument("--image", required=True, help="Path to input image")
    parser.add_argument(
        "--repeat",
        type=int,
        default=10,
        help="Number of repetitions for timing. Default is 10",
    )
    args = parser.parse_args()

    image_path, repeat = args.image, int(args.repeat)

    min_tensorflow, avg_tensorflow, max_tensorflow = calculate_min_max_avg(
        run_tensorflow, image_path, repeat
    )
    min_openvino, avg_openvino, max_openvino = calculate_min_max_avg(
        run_tensorflow, image_path, repeat
    )

    print_report(
        repeat,
        {
            "tensorflow": [min_tensorflow, avg_tensorflow, max_tensorflow],
            "openvino": [min_openvino, avg_openvino, max_openvino],
        },
    )

    plt.figure(figsize=(6, 6))
    x_positions = [0.3, 0.7]
    avgs = [avg_tensorflow, avg_openvino]
    lower_boundaries = [avg_tensorflow - min_tensorflow, avg_openvino - min_openvino]
    upper_boundaries = [max_tensorflow - avg_tensorflow, max_openvino - avg_openvino]

    _, ax = plt.subplots(figsize=(6, 4))

    ax.errorbar(
        x_positions,
        avgs,
        yerr=[lower_boundaries, upper_boundaries],
        fmt="o",
        capsize=10,
        color="blue",
        ecolor="black",
    )
    ax.set_ylim(bottom=0)
    ax.set_xlim(left=0, right=1)
    ax.yaxis.set_major_locator(MaxNLocator(nbins=20))

    plt.axvline(1, color="gray", linestyle="--")
    ax.set_xticks(x_positions)
    ax.set_xticklabels(["tensorflow", "openvino"])
    ax.set_ylabel("Time (seconds)")
    ax.set_title(f"tensorflow vs openvino prediction times ({repeat} runs)")
    ax.grid(True)

    plot_path = path.join(BASE_DIR, "benchmark_results.png")
    print("will save plot image to", plot_path)
    plt.savefig(plot_path)


if __name__ == "__main__":
    main()
