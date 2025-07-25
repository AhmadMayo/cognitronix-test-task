import { useState } from "react";
import { Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";

import { isDomainError, type Image } from "../../domain-models";
import * as apis from "../../apis";

import classes from "./Uploader.module.css";

const errorMessages: Record<string, string> = {
  invalid_file_type: "Invalid File Type",
  max_file_size_exceeded: "Max File Exceed",

  general_error: "Something went wrong. Please try again later.",
};

interface Props {
  onUploadSuccess: (args: { totalCount: number; images: Image[] }) => void;
}
export default function Uploader({ onUploadSuccess }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className={classes.container}>
      <Upload.Dragger
        className={classes["upload-container"]}
        accept="application/zip"
        maxCount={1}
        showUploadList={false}
        disabled={isUploading}
        beforeUpload={() => false}
        onChange={async ({ file }) => {
          if (!file) {
            return;
          }

          setIsUploading(true);
          setError(null);

          try {
            // Parse type to file because the type declaration in th library is incorrect although
            // they extend the File class
            const { total_count, data } = await apis.requestUploadZipFile(
              file as unknown as File
            );

            onUploadSuccess({
              totalCount: total_count,
              images: data,
            });
          } catch (error) {
            if (isDomainError(error) && errorMessages[error.error]) {
              setError(errorMessages[error.error]);
            } else {
              setError(errorMessages.general_error);
            }
          } finally {
            setIsUploading(false);
          }
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag a ZIP file to this area to upload
        </p>
        <ul className={`ant-upload-hint ${classes["upload-hint"]}`}>
          <li>The file must be a ZIP file.</li>
          <li>The file should not exceed 10MB.</li>
          <li>The file should only contain PNG files.</li>
        </ul>
      </Upload.Dragger>
      <p className={`${classes.error} ${error == null ? classes.hidden : ""}`}>
        {error}
      </p>
    </div>
  );
}
