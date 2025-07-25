import type { Image } from "../domain-models";
import instance from "./instance";

interface RequestGetFoldersListResponse {
  total_count: number;
  data: Array<{
    name: string;
    files_count: number;
  }>;
}
export async function requestGetFolders(): Promise<RequestGetFoldersListResponse> {
  const { data } = await instance.get<RequestGetFoldersListResponse>("/files/");

  return data;
}

interface RequestGetFolderImagesResponse {
  total_count: number;
  data: Array<{
    url: string;
    name: string;
    width: number;
    height: number;
  }>;
}
export async function requestGetFolderImages(
  folderName: string
): Promise<RequestGetFolderImagesResponse> {
  const { data } = await instance.get<RequestGetFolderImagesResponse>(
    `/files/${folderName}/`
  );

  return data;
}

interface RequestUploadZipFileResponse {
  total_count: number;
  data: Array<Image>;
}
export async function requestUploadZipFile(
  file: File
): Promise<RequestUploadZipFileResponse> {
  const { data } = await instance.post<RequestUploadZipFileResponse>(
    `/files/`,
    { file },
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
}
