import { add, differenceInDays, endOfMonth, nextSunday } from "date-fns";
import { useEffect, useReducer } from "react";
import { SCALE_UNIT } from "../enums";

const reducer__ = (labels, action) => {
	switch(action.type) {
		case "NEW": {
			return [...action.labels];
		}
		default:
			throw new Error(`Unkown case ${action.type}`);
	}
}

/**
 * 
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @param {string} unit 
 * @param {{height: number, width: number}} baseNodeDimensions
 */
const makeLabels__ = (startDate, endDate, unit, baseNodeDimensions) => {
	let labels = [];

	let l = new Date(startDate);
	let endReached = false;
	while(!endReached) {
		let temp = getNextDate__(l, unit);
		let r;
		if (temp < endDate) {
			r = temp;
		}
		else  {
			r = endDate;
		}

		let d = differenceInDays(r, l) + 1;
		labels.push({value: l.toDateString(), width: d * baseNodeDimensions.width})
		
		if (differenceInDays(endDate, r) === 0) {
			endReached = true;
		}

		l = add(r, {days: 1});
	}

	return labels;
}

const getNextDate__ = (date, unit) => {
	switch(unit) {
		case SCALE_UNIT.week: {
			return nextSunday(date)
		}
		case SCALE_UNIT.month: {
			return endOfMonth(date);
		}
		default:
			throw new Error(`Unknown case ${unit}`);
	}
}

const HorizontalScale = ({startDate, endDate, unit, style, baseNodeDimensions}) => {
	const [labels, dispatch] = useReducer(reducer__, []);

	useEffect(() => {
		const labels = makeLabels__(startDate, endDate, unit, baseNodeDimensions);
		dispatch({type: "NEW", labels});

	}, [startDate, endDate, unit])

	return (
		<div className="horizontal-scale" style={{...style}}>
			{labels.map(x => {
				return <div key={x.value} style={{width: x.width}}>
					<span>
						{x.value}
					</span>
				</div>
			})}
		</div>
	)
}

export default HorizontalScale;