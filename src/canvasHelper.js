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

