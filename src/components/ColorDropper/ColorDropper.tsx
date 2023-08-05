import ColorPickerIcon from '@assets/icons/color_picker.svg';
import Hooks from '@hooks';
import cx from 'classnames';
import { FC, useState } from 'react';

import Picker from './Picker';

export type ColorDropperProps = {
  image: ImageBitmap | undefined;
};

const ColorDropper: FC<ColorDropperProps> = ({ image }) => {
  const [color, setcolor] = useState<undefined | string>(undefined);
  const { ref: wrapperRef, width } = Hooks.useResizeObserver({ box: 'border-box' });

  const {
    ref,
    handleCanvasMouseLeave,
    handleCanvasMouseMove,
    handlePickerOnOff,
    handleCanvasClick,
    loading,
    data,
    isPickerEnabled,
  } = Hooks.useColorPicker({
    wrapperWidth: width,
    img: image,
    onColorSelect: (selectedColor) => {
      setcolor(selectedColor);
    },
  });

  const canvasContainerCN = cx(
    {
      'cursor-none': isPickerEnabled,
      'cursor-default': !isPickerEnabled,
    },
    'w-full relative max-w-2xl',
  );

  const pickerCN = cx(
    { 'border border-red-400': isPickerEnabled, 'hover:bg-gray-300': !isPickerEnabled },
    'w-6 h-6 flex justify-center items-center rounded ',
  );

  return (
    <div className="flex flex-col items-center mb-2">
      <div className="w-full max-w-2xl flex relative mb-1">
        <button className={pickerCN} onClick={handlePickerOnOff}>
          <ColorPickerIcon />
        </button>
        {color && (
          <div className="w-fit flex gap-1 items-center absolute left-0 right-0 mx-auto">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
            <p className="w-fit">{color}</p>
          </div>
        )}
      </div>
      {loading && <div>Loading...</div>}
      <div ref={wrapperRef} className={canvasContainerCN}>
        <Picker left={data.x} top={data.y} viewData={data.data} />
        <canvas
          ref={ref}
          onClick={handleCanvasClick}
          onMouseLeave={handleCanvasMouseLeave}
          onMouseMove={handleCanvasMouseMove}
        />
      </div>
    </div>
  );
};

export default ColorDropper;
