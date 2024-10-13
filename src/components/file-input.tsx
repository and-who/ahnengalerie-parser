import React, { useEffect } from "react";
import { Entry, parseAhnenFileData } from "../utils/ahnen-file-util";

export const FileInput = (props: {
  onEntriesParsed: (entries: Entry[]) => void;
}) => {
  const { onEntriesParsed } = props;
  const [fileContent, setFileContent] = React.useState<
    ArrayBuffer | null | undefined
  >(null);
  const [fileName, setFileName] = React.useState<string | undefined>();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log(event);
    let file = event.target.files?.[0];
    console.log(file);
    let arrayBuffer = await file?.arrayBuffer();
    console.log(arrayBuffer);
    setFileContent(arrayBuffer);
    setFileName(file?.name);
  };

  useEffect(() => {
    if (fileContent) {
      const fileUIntArray = new Uint8Array(fileContent);
      const entries = parseAhnenFileData(fileUIntArray);
      onEntriesParsed(entries);
    }
  }, [fileContent, fileName]);

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
    </div>
  );
};
