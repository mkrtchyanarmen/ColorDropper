import Utils from '@utils';
import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react';

const initialData: {
  data: string[][] | undefined;
  x: number | undefined;
  y: number | undefined;
} = {
  x: undefined,
  y: undefined,
  data: undefined,
};

type useColorPickerProps = {
  img: ImageBitmap | undefined;
  onColorSelect: (color: string) => void;
  wrapperWidth: number | undefined;
};

const radius = import.meta.env.VITE_PICKER_RADIUS || 5;
// defualt image
const imageSource = '/images/default_image.jpg';

const useColorPicker = ({ wrapperWidth, img, onColorSelect }: useColorPickerProps) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // loading state
  const [loading, setLoading] = useState(false);

  // picker disabled/enabled states
  const [isPickerEnabled, setIsPickerEnabled] = useState(false);

  // cordinates
  const [data, setData] = useState({ ...initialData });

  useEffect(() => {
    const canvas = ref.current;

    if (!wrapperWidth) {
      return;
    }

    // handle cnavas reference null state
    if (!canvas) {
      setLoading(false);

      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // handle context null state
    if (!ctx) {
      setLoading(false);

      return;
    }
    contextRef.current = ctx;

    if (img) {
      const { width: imageWidth, height: imageHeight } = img;
      // define image aspect_ratio
      const aspectRatio = imageWidth / imageHeight;

      // set canvas width full container width
      canvas.width = wrapperWidth || 0;

      // set canvas width full container width
      canvas.height = wrapperWidth ? wrapperWidth / aspectRatio : 0;

      // render image on canvas (on container width change and on image upload)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // disable loading when image successfully loaded
      setLoading(false);
      // disable picker selection as new image rendered
      setIsPickerEnabled(false);
    } else {
      const imageObject = new Image();

      // create image object to pass cnavas
      imageObject.src = imageSource;
      imageObject.onload = () => {
        const { width: imageWidth, height: imageHeight } = imageObject;

        // TODO: add portrait layout case
        // define image aspect_ratio
        const aspectRatio = imageWidth / imageHeight;

        // set canvas width full container width
        canvas.width = wrapperWidth || 0;

        // set canvas width full container width
        canvas.height = wrapperWidth ? wrapperWidth / aspectRatio : 0;

        // render image on canvas (on container width change and on image upload)
        ctx.drawImage(imageObject, 0, 0, canvas.width, canvas.height);

        // disable loading when image successfully loaded
        setLoading(false);
        // disable picker selection as new image rendered
        setIsPickerEnabled(false);
      };
    }

    return () => {
      setLoading(true);
    };
  }, [img, wrapperWidth]);

  const handleCanvasMouseMove = useCallback(
    (event: MouseEvent<HTMLCanvasElement>) => {
      if (ref.current && contextRef.current && isPickerEnabled) {
        // get mouse x and y cordinates
        const { clientX, clientY } = event;

        // get viewport relative position
        const { left, top } = ref.current.getBoundingClientRect();

        // calculate cursor absolute position in window
        const x = clientX - left;
        const y = clientY - top;

        if (x && y) {
          const { startX, startY, squareWidth, matrix, diameter } =
            Utils.getMatrixAndImageProperties(x, y, radius);
          const pickerImageData = contextRef.current.getImageData(
            startX,
            startY,
            squareWidth,
            squareWidth,
          );

          const pickerData = Utils.getPickerData(pickerImageData, matrix, diameter);

          setData({ x, y, data: pickerData });
        }
      }
    },
    [isPickerEnabled],
  );
  const handleCanvasMouseLeave = useCallback(() => {
    setData({ ...initialData });
  }, []);

  // Not need to wrapp in useCallback, picker on/off
  const handlePickerOnOff = () => {
    setIsPickerEnabled((prev) => !prev);
  };
  const handleCanvasClick = useCallback(() => {
    if (ref.current && contextRef.current && isPickerEnabled) {
      const centerColor = data.data?.[radius][radius];

      if (centerColor) {
        onColorSelect(centerColor);
      }
    }
  }, [data, isPickerEnabled, onColorSelect]);

  return {
    ref,
    loading,
    handleCanvasMouseMove,
    handleCanvasMouseLeave,
    handleCanvasClick,
    data,
    isPickerEnabled,
    handlePickerOnOff,
  };
};

export default useColorPicker;
