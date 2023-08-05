import ColorDropper from '@components/ColorDropper';
import FileUpload from '@components/FileUpload';
import { useState } from 'react';

const App = () => {
  const [file, setFile] = useState<ImageBitmap | undefined>(undefined);

  return (
    <div className="px-4 sm:px-8 pt-10">
      <ColorDropper image={file} />
      <FileUpload onUpload={(bitMapFile) => setFile(bitMapFile)} />
    </div>
  );
};

export default App;
