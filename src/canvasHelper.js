/**
 * Converts the grid based position into pixel based position (canvas)
 * @param {{x: number, y: number}} gridPos 
 * @param {{height: number, width: number}} baseNodeDimensions 
 * @returns 
 */
 export const gridToPixelBasedPos__ = (gridPos, baseNodeDimensions) => {
	const x = gridPos.x  * baseNodeDimensions.width;
	const y = gridPos.y * baseNodeDimensions.height;

	return {
		x,
		y
	}
}

/**
 * 
 * @param {{x: number, y: number}} pos 
 * @param {{width: number, height: number}} canvasDimensions 
 * @param {{x: number, y: number}} totalGrids 
 * @param {boolean} roundUp [Optional] round up the value 
 * @returns 
 */
export const pixelToGridBasedPos__ = (pos, canvasDimensions, totalGrids) => {
	const x = (pos.x / canvasDimensions.width) * totalGrids.x;
	const y = (pos.y / canvasDimensions.height) * totalGrids.y;

	return {
		x: Number.parseInt(x),
		y: Number.parseInt(y)
	}
}

/**
 * Generates a string representing smooth brezier curve for Svg->Path("d" attribute) element.
 */
export const generatePathD = (head, tail, controlPoint) => {
	const controlPoint1 = {
		x: head.x + controlPoint.x,
		y: head.y + controlPoint.y
	}

	const controlPoint2 = {
		x: tail.x - controlPoint.x,
		y: tail.y - controlPoint.y
	}

	return `M${head.x} ${head.y} C${controlPoint1.x} ${controlPoint1.y} ${controlPoint2.x} ${controlPoint2.y} ${tail.x} ${tail.y}`;
}
