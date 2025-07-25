import { useEffect, useState } from "react";
import { App, Skeleton, Collapse, type CollapseProps } from "antd";

import type { Image } from "../../domain-models";
import * as apis from "../../apis";

import Uploader from "./Uploader";
import FolderImages from "./FolderImages";
import classes from "./index.module.css";

interface FoldersState {
  [folder: string]:
    | null
    | { error: string }
    | {
        totalCount: number;
        images: Image[];
      };
}

const loadingItems: CollapseProps["items"] = [
  {
    key: "1",
    label: <Skeleton.Input size="small" />,
  },
  {
    key: "2",
    label: <Skeleton.Input size="small" />,
  },
  {
    key: "3",
    label: <Skeleton.Input size="small" />,
  },
];

export default function Home() {
  const { notification } = App.useApp();

  const [isFetchingFolders, setIsFetchingFolders] = useState(false);
  const [folders, setFolders] = useState<
    Array<{ name: string; files_count: number }>
  >([]);
  const [foldersImages, setFoldersImages] = useState<FoldersState>({});

  async function fetchFolders() {
    setIsFetchingFolders(true);

    try {
      const { data } = await apis.requestGetFolders();
      const newFoldersImages = data.reduce<FoldersState>(
        (accumulator, folder) => {
          accumulator[folder.name] = null;
          return accumulator;
        },
        {}
      );

      setFolders(data);
      setFoldersImages(newFoldersImages);
    } catch {
      notification.error({
        message: "Error fetching uploaded folders",
      });
    } finally {
      setIsFetchingFolders(false);
    }
  }
  useEffect(() => {
    fetchFolders();
  }, []);

  // Use array of strings to track if we're fetching images for multiple folders at the same time
  const [isFetchingImagesForFolder, setIsFetchingImagesForFolder] = useState<
    string[]
  >([]);
  async function fetchImagesForFolder(folderName: string) {
    setIsFetchingImagesForFolder((oldValue) => [...oldValue, folderName]);
    try {
      const { total_count, data } = await apis.requestGetFolderImages(
        folderName
      );
      setFoldersImages({
        ...foldersImages,
        [folderName]: {
          totalCount: total_count,
          images: data,
        },
      });
    } catch {
      setFoldersImages({
        ...foldersImages,
        [folderName]: {
          error: "Error while fetching images.",
        },
      });
    } finally {
      setIsFetchingImagesForFolder((oldValue) =>
        oldValue.filter((v) => v != folderName)
      );
    }
  }

  return (
    <div className={classes.container}>
      <Uploader onUploadSuccess={fetchFolders} />
      <h2 className={classes["section-title"]}>Uploaded Folders</h2>
      <Collapse
        // To force close any open panel when the reloading the folders
        key={String(isFetchingFolders)}
        style={{ width: 780 }}
        size="large"
        accordion
        collapsible={isFetchingFolders ? "disabled" : "header"}
        items={
          isFetchingFolders
            ? loadingItems
            : folders.map(({ name, files_count }) => ({
                key: name,
                label: (
                  <span key={name}>
                    <span className={classes["folder-name"]}>{name}</span>&nbsp;
                    ({files_count} {files_count == 1 ? "image" : "images"})
                  </span>
                ),
                children: (
                  <FolderImages
                    isLoading={isFetchingImagesForFolder.includes(name)}
                    data={foldersImages[name]}
                    refetch={() => fetchImagesForFolder(name)}
                  />
                ),
              }))
        }
        onChange={async ([key]) => {
          // No expanded panel
          if (!key) {
            return;
          }

          // Images already fetched
          if (foldersImages[key] != null) {
            return;
          }

          fetchImagesForFolder(key);
        }}
      />
    </div>
  );
}
