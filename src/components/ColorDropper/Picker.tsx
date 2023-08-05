import cx from 'classnames';
import { FC } from 'react';

export type PickerProps = {
  left?: number;
  top?: number;
  viewData?: string[][];
};

const getCellStyle = (isCenter: boolean) =>
  cx({ 'border-white border': !isCenter, 'shadow-inset-1': isCenter });

const Picker: FC<PickerProps> = ({ left, top, viewData }) => {
  const dataLenght = viewData?.length;
  const centerPoint = dataLenght ? Math.floor(dataLenght / 2) : undefined;

  return left && top && centerPoint ? (
    <div
      className="w-20 h-20 rounded-full overflow-hidden absolute select-none pointer-events-none bg-white border-2 border-slate-500"
      style={{ left: `${left - 40}px`, top: `${top - 40}px` }}
    >
      <table className="w-full h-full  border-collapse">
        <tbody>
          {viewData?.map((cells, rowIndex) => (
            <tr key={rowIndex}>
              {cells.map((color, cellIndex) => (
                // eslint-disable-next-line jsx-a11y/control-has-associated-label
                <td
                  key={cellIndex}
                  className={getCellStyle(rowIndex === centerPoint && cellIndex === centerPoint)}
                  style={{ backgroundColor: color }}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : null;
};

export default Picker;
