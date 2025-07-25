from rest_framework import serializers
from .errors_codes import ErrorCodes

MAX_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_FILE_TYPES = ["application/zip", "application/x-zip-compressed"]


class UploadZipSerializer(serializers.Serializer):
    file = serializers.FileField(required=False)

    def validate(self, data):
        file = data.get("file")
        if not file:
            raise serializers.ValidationError(
                {
                    "file": {
                        "error": ErrorCodes.required_field_missing.value,
                        "field": "file",
                    }
                }
            )

        return data

    def validate_file(self, value):
        if not value.content_type in ALLOWED_FILE_TYPES:
            raise serializers.ValidationError(
                {
                    "error": ErrorCodes.invalid_file_type.value,
                    "allowed_types": ALLOWED_FILE_TYPES,
                }
            )

        # Because this is a demo, we'll only allow files < 10MB
        if value.size > MAX_SIZE:
            raise serializers.ValidationError(
                {
                    "error": ErrorCodes.max_file_size_exceeded.value,
                    "max_size": MAX_SIZE,
                }
            )

        return value
