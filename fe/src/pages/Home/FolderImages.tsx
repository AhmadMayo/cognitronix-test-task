import { useRef, useState } from "react";
import { Button, Image as ImageComponent, Skeleton } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

import type { Image } from "../../domain-models";
import classes from "./FolderImages.module.css";
import { PredictionModal } from "./PredictionModal";

type Props = {
  isLoading: boolean;
  data: null | { error: string } | { totalCount: number; images: Image[] };
  refetch: () => void;
};
export default function FolderImages({ isLoading, data, refetch }: Props) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const [imageForPrediction, setImageForPredication] = useState<Blob | null>(
    null
  );

  if (isLoading || !data) {
    return (
      <div className={classes.container}>
        <Skeleton.Image active className={classes.loader} />
      </div>
    );
  }

  if ("error" in data) {
    return (
      <div className={classes["error-container"]}>
        <p className={classes.error}>{data.error}</p>
        <Button onClick={refetch}>re-fetch</Button>
      </div>
    );
  }

  return (
    <>
      <div className={classes.container}>
        <div ref={sliderRef} className={classes.slider}>
          {data.images.map(({ url, name, width, height }) => (
            <button
              key={name}
              className={classes.slide}
              onKeyDown={(event) => {
                if (event.key == "ArrowRight") {
                  event.preventDefault();
                  const { nextSibling } = event.currentTarget;
                  if (nextSibling) {
                    (nextSibling as HTMLButtonElement).focus();
                  } else {
                    const firstSibling =
                      event.currentTarget.parentElement?.firstChild;
                    if (firstSibling) {
                      (firstSibling as HTMLButtonElement).focus();
                    }
                  }
                  return;
                }

                if (event.key == "ArrowLeft") {
                  event.preventDefault();
                  const { previousSibling } = event.currentTarget;
                  if (previousSibling) {
                    (previousSibling as HTMLButtonElement).focus();
                  } else {
                    const lastSibling =
                      event.currentTarget.parentElement?.lastChild;
                    if (lastSibling) {
                      (lastSibling as HTMLButtonElement).focus();
                    }
                  }
                  return;
                }
              }}
              onClick={(event) => {
                const imageEl = event.currentTarget.querySelector(
                  "img"
                ) as HTMLImageElement;

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                if (!ctx) {
                  return;
                }

                ctx.drawImage(imageEl, 0, 0);
                canvas.toBlob((blob) => {
                  console.log("==blob", typeof blob, blob, blob?.size);
                  setImageForPredication(blob);
                }, "image/png");
              }}
            >
              <div className={classes["image-container"]}>
                <ImageComponent
                  className={classes.image}
                  preview={false}
                  src={`${import.meta.env.VITE_BE_URL}${url}`}
                  crossOrigin="anonymous"
                />
              </div>
              <div className={classes["meta-container"]}>
                <div>{name}</div>
                <div>
                  {width} * {height}
                </div>
              </div>
            </button>
          ))}
        </div>
        <Button
          shape="circle"
          ghost
          className={`${classes["slider-button"]} ${classes.left}`}
          icon={<LeftOutlined />}
          onClick={() => {
            if (!sliderRef.current) {
              return;
            }

            const scrollLeft = sliderRef.current.scrollLeft;
            const sliderWidth = sliderRef.current.clientWidth;

            const indexOfVisibleElement = Math.round(scrollLeft / sliderWidth);
            if (indexOfVisibleElement > 0) {
              (
                sliderRef.current.children[
                  indexOfVisibleElement - 1
                ] as HTMLButtonElement
              ).focus();
            } else {
              (sliderRef.current.lastChild as HTMLButtonElement).focus();
            }
          }}
        />
        <Button
          shape="circle"
          ghost
          className={`${classes["slider-button"]} ${classes.right}`}
          icon={<RightOutlined />}
          onClick={() => {
            if (!sliderRef.current) {
              return;
            }

            const scrollLeft = sliderRef.current.scrollLeft;
            const sliderWidth = sliderRef.current.clientWidth;

            const indexOfVisibleElement = Math.round(scrollLeft / sliderWidth);
            if (indexOfVisibleElement + 1 < data.totalCount) {
              (
                sliderRef.current.children[
                  indexOfVisibleElement + 1
                ] as HTMLButtonElement
              ).focus();
            } else {
              (sliderRef.current.firstChild as HTMLButtonElement).focus();
            }
          }}
        />
      </div>
      <PredictionModal
        image={imageForPrediction}
        onClose={() => setImageForPredication(null)}
      />
    </>
  );
}
