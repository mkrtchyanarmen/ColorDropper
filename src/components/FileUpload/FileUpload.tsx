import { FC } from 'react';

type FileUploadProps = {
  onUpload: (imageBitMap: ImageBitmap) => void;
};
const FileUpload: FC<FileUploadProps> = ({ onUpload }) => {
  return (
    <div className="w-full flex justify-center">
      <input
        className=""
        id="file_input"
        onChange={async ({ target }) => {
          const file = target.files?.[0];

          if (file) {
            createImageBitmap(file).then((bitMap) => {
              onUpload(bitMap);
            });
          }
        }}
        type="file"
      />
    </div>
  );
};

export default FileUpload;
