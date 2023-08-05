export const getMatrixAndImageProperties = (x: number, y: number, radius: number) => {
  // diameter of picker
  const diameter = radius * 2 + 1;

  // matrix according diameter
  const matrix = Array.from({ length: diameter }, () =>
    // fill the cell background transparent for the mssing cells
    new Array<string>(diameter).fill('transparent'),
  );

  // get image props based on radius and position
  const startX = Math.round(x - radius);
  const startY = Math.round(y - radius);

  // the same as diameter
  const squareWidth = diameter;

  return { squareWidth, startX, startY, matrix, diameter };
};

const toHex = (prop: number | undefined) => {
  return prop?.toString(16).padStart(2, '0');
};

export const getPickerData = ({ data }: ImageData, matrix: string[][], diameter: number) => {
  // each cell has 4 properties (red,green,blue,opacity) so the cell property count is 4
  const oneCellPropsCount = 4;

  // cell count in per row
  const cellInPerRow = diameter;

  // property count in per row
  const propertyPerRow = cellInPerRow * oneCellPropsCount;

  return matrix.map((cells, rowIndex) => {
    return cells.map((_, cellIndex) => {
      // previus rows used properties
      const usedPropertyCount = rowIndex * propertyPerRow;
      const currentRowUsedProperties = cellIndex * 4;

      // color start index
      const colorIndex = usedPropertyCount + currentRowUsedProperties;

      // red color of cell converted to hex
      const red = toHex(data[colorIndex]);

      // green color of cell converted to hex
      const green = toHex(data[colorIndex + 1]);

      // blue color of cell converted to hex
      const blue = toHex(data[colorIndex + 2]);

      // TODO: use opacity if you need
      // opacity of cell converted to hex
      // const opacity = toHex(data[colorIndex + 2]);
      return `#${red}${green}${blue}`;
    });
  });
};
