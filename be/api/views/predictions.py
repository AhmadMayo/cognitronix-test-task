from keras.applications.mobilenet_v2 import (
    MobileNetV2,
    preprocess_input,
    decode_predictions,
)
import numpy as np
from PIL import Image
from django.conf import settings
from os import path
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import status
from openvino import convert_model, compile_model, save_model, Core

from ..errors_codes import ErrorCodes

mobilenet_model = MobileNetV2(weights="imagenet")
model_path = path.join(settings.BASE_DIR, "mobile_net_v2_tf")
if not path.exists(model_path):
    mobilenet_model.export(model_path)

model_xml_path = path.join(settings.BASE_DIR, "mobilenet_v2.xml")
if not path.exists(model_xml_path):
    ov_model = convert_model(model_path)
    save_model(ov_model, "model.xml")
else:
    core = Core()
    ov_model = core.read_model(model_xml_path)

compiled_model = compile_model(ov_model, device_name="CPU")
output_layer = compiled_model.output(0)


class PredictionsViewSet(ViewSet):
    def create(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response(
                {
                    "error": ErrorCodes.required_field_missing.value,
                    "field": "file",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with Image.open(file) as img:
                img = img.convert("RGB")
                img = img.resize((224, 224))
                converted_image = np.array(img)
                converted_image = np.expand_dims(converted_image, axis=0)
                converted_image = preprocess_input(converted_image)
                predictions = compiled_model([converted_image])[output_layer]
                [[(_, label, confidence)]] = decode_predictions(predictions, top=1)
                return Response(
                    {"label": label, "confidence": float(f"{confidence:.2f}")}
                )

        except Exception as e:
            return Response(
                {"error": ErrorCodes.internal_error.value},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


def test():
    return
