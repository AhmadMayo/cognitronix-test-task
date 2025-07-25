import { useEffect, useState } from "react";
import { Button, Modal, Skeleton } from "antd";

import type { Prediction } from "../../domain-models";
import { requestPredictImage } from "../../apis";
import classes from "./PredictionModal.module.css";

type State =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; prediction: Prediction };

interface Props {
  image: Blob | null;
  onClose: () => void;
}
export function PredictionModal({ image, onClose }: Props) {
  const isOpen = image != null;
  const [state, setState] = useState<State>({ status: "loading" });

  async function predict(image: Blob) {
    setState({ status: "loading" });

    try {
      console.log("==modal", typeof image, image, image?.size);
      const prediction = await requestPredictImage(image);
      setState({ status: "success", prediction });
    } catch {
      setState({ status: "error", error: "Error fetching uploaded folders" });
    }
  }

  useEffect(() => {
    if (!image) {
      return;
    }

    predict(image);
  }, [image]);

  return (
    <Modal
      open={isOpen}
      centered
      title="Prediction"
      footer={<Button onClick={onClose}>Close</Button>}
      onCancel={onClose}
      // Reset status after the close animation ends
      afterClose={() => setState({ status: "loading" })}
    >
      <div className={classes.container}>
        <div>
          <span className={classes.label}>Label:</span>
          {state.status == "loading" && <Skeleton.Input active size="small" />}
          {state.status == "error" && (
            <>
              <span className={classes.error}>{state.error}</span>
              &nbsp;
              <Button
                color="primary"
                variant="link"
                onClick={() => {
                  if (!image) {
                    return;
                  }

                  predict(image);
                }}
              >
                Retry
              </Button>
            </>
          )}
          {state.status == "success" && <span>{state.prediction.label}</span>}
        </div>
        <div>
          <span className={classes.label}>Confidence:</span>
          {state.status == "loading" && <Skeleton.Input active size="small" />}
          {state.status == "error" && <span>-</span>}
          {state.status == "success" && (
            <span>{state.prediction.confidence}</span>
          )}
        </div>
      </div>
    </Modal>
  );
}
