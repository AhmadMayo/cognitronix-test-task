from enum import Enum


class ErrorCodes(Enum):
    required_field_missing = "required_field_missing"
    invalid_file_type = "invalid_file_type"
    max_file_size_exceeded = "max_file_size_exceeded"
    folder_does_not_exist = "folder_does_not_exist"

    internal_error = "internal_error"
