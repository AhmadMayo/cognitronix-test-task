export interface DomainError {
  error:
    | "invalid_file_type"
    | "max_file_size_exceeded"
    | "folder_does_not_exist"
    | "general_error";
}

export function isDomainError(value: unknown): value is DomainError {
  return typeof value == "object" && value != null && "error" in value;
}
