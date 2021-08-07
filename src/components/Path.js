import { differenceInDays } from "date-fns";
import { gridToPixelBasedPos__ } from "../canvasHelper";
import { BASE_NODE_DIMENSIONS } from "../enums";

/**
 * 
 * @param {{x: number, y: number}} from 
 * @param {{x: number, y: number}} to 
 * @param {{x: number, y: number}} c 
 * @returns 
 */
const generatePathString__ = (from, to, c) => {
	const c1 = {
		x: from.x + c.x,
		y: from.y + c.y
	}

	const c2 = {
		x: to.x - c.x,
		y: to.y - c.y
	}

	return `M${from.x} ${from.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${to.x} ${to.y}`;
}

const Path = ({id, from, to, path, canvas}) => {

	const makePath = (from, to) => {
		const head = {
			x: differenceInDays(from.endDate, canvas.startDate),
			y: from.row
		}
	
		const tail = {
			x: differenceInDays(to.startDate, canvas.startDate),
			y: to.row
		}

		return {
			head, tail
		}
	}

	const calcPathD = (path) => {
		const p1 = gridToPixelBasedPos__(path.head, BASE_NODE_DIMENSIONS);
		p1.y += BASE_NODE_DIMENSIONS.height / 2;

		const p2 = gridToPixelBasedPos__(path.tail, BASE_NODE_DIMENSIONS);
		p2.y += BASE_NODE_DIMENSIONS.height / 2;

		return generatePathString__(p1, p2, {x: BASE_NODE_DIMENSIONS.width, y: 0})
	}


	const pathD = calcPathD(path !== undefined ? path : makePath(from, to));

	return (
		<path d={pathD} 
			key={id}
			stroke="#34495e" 
			strokeWidth="2"
			fill="transparent" />
	)
}

export default Path;