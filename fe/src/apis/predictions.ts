import type { Prediction } from "../domain-models";
import instance from "./instance";

export async function requestPredictImage(image: Blob): Promise<Prediction> {
  console.log("==api", typeof image, image, image?.size);
  const { data } = await instance.post(
    "/predict/",
    { file: image },
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
}
