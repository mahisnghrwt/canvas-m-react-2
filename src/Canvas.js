import { useReducer, useRef } from "react";
import "./canvas.css";
import { BASE_NODE_DIMENSIONS, SCALE_UNIT } from "./enums";
import Epic from "./components/Epic";
import HorizontalScale from "./components/HorizontalScale";
import VerticalScale from "./components/VerticalScale";
import { differenceInDays } from "date-fns/esm";
import { add } from "date-fns";
import {pixelToGridBasedPos__} from "./canvasHelper";
import Path from "./components/Path";

const GRIDLINE_COLOR = "#bdc3c7";
const GRIDLINE_SIZE_IN_PX = 1;
const VERTICAL_SCALE_WIDTH = 100;
const HORIZONTAL_SCALE_HEIGHT = 20;

let id = 1;
const getId__ = () => {
	return id++;
}

const getGridlinesCss__ = (nodeDimensions, gridlineSize, gridlineColor)  => {
	const verticalGirdlinesCss = `repeating-linear-gradient(
	to right, 
	${gridlineColor} 0 1px,
	transparent 1px ${nodeDimensions.width - gridlineSize}px, 
	${gridlineColor} ${nodeDimensions.width - gridlineSize}px ${nodeDimensions.width}px)`;

	const horizontalGridlinesCss = `repeating-linear-gradient(
	to bottom, 
	${gridlineColor} 0 1px,
	transparent 1px ${nodeDimensions.height - 1}px, 
	${gridlineColor} ${nodeDimensions.height - 1}px ${nodeDimensions.height}px)`;

	return horizontalGridlinesCss + ", " + verticalGirdlinesCss;
}

const _reducer = (state, action) => {
	switch(action.type) {
		case "ADD_EPIC":
			return {
				...state,
				epics: {
					...state.epics,
					[action.epic.id]: {...action.epic}
				}
			}
		case "UPDATE_EPIC":
			const targetEpic = state.epics[action.id];
			if (targetEpic === undefined)
				return state;
			const patchedEpic = {
				...targetEpic, ...action.patch
			}


			return {
				...state,
				epics: {
					...state.epics,
					[action.id]: patchedEpic
				}
			}
		case "CREATE_INTERMEDIATE_PATH":
			return {
				...state,
				intermediate: {
					...state.intermediate,
					path: {
						...action.path
					}
				}
			}
		case "PATCH_INTERMEDIATE_PATH_RAW":
			return {
				...state,
				intermediate: {
					...state.intermediate,
					path: {
						...state.intermediate.path,
						from: {
							...state.intermediate.path.from,
						},
						to: {
							...state.intermediate.path.to,
						},
						raw: state.intermediate.path.raw,
						[state.intermediate.path.raw]: {
							...action.patch
						}
					}
				}
			}
		case "REMOVE_INTERMEDIATE_PATH":
			return {
				...state,
				intermediate: { }
			}

		case "CREATE_NEW_PATH":
			return {
				...state,
				intermediate: {},
				paths: {
					...state.paths,
					[action.path.id]: {
						...action.path
					}
				}
			}
		default:
			throw new Error(`Unknown case: ${action.type}`);
	}
}

const Canvas = ({rows, startDate, endDate, increaseCanvasSizeBy}) => {
	// grid size
	// this should be a function thar returns grid dimensions
	const numOfUnits = {
		x: differenceInDays(endDate, startDate),
		y: rows
	}

	// canvas size is dependant on BASE_NODE_DIMENSIONS
	const canvasSize = {
		height: BASE_NODE_DIMENSIONS.height * numOfUnits.y,
		width: BASE_NODE_DIMENSIONS.width * numOfUnits.x
	}

	const [state, dispatch] = useReducer(_reducer, {epics: {}, paths: {}, intermediate: {}});

	// rename to cutomDragEvent
	const dragData = useRef({type: ""});

	const interactiveLayerDoubleClickHandler = (e) => {
		e.preventDefault();
		// position is relative to canvas
		createEpic({x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY}, startDate);
	}

	/**
	 * 
	 * @param {{x: number, y: number}} pos Raw position on canvas
	 * @param {Date} startDate_ Start date of canvas
	 */
	// convert into pure function
	// return epic object
	const createEpic = (pos, startDate_) => {
		// this can be dynamic, so we will store color in database as string ?!
		const defaultColor = "#7ed6df";

		const gridBasedPos = pixelToGridBasedPos__(pos, canvasSize, numOfUnits);

		const epic = {
			color: defaultColor,
			startDate: add(startDate_, {days: gridBasedPos.x}),
			endDate: add(startDate_, {days: gridBasedPos.x + 1}),
			row: gridBasedPos.y,
			id: getId__()
		}

		// NOTE -> this function should just return the epic object

		// NOTE -> call api
		dispatch({type: "ADD_EPIC", epic});
	}

	/**
	 * 
	 * @param {{startDate: Date, endDate: Date}} from 
	 * @param {{startDate: Date, endDate: Date}} to 
	 * @param {string} raw
	 * @param {nnumber} rawId
	 */
	// convert into pure function
	// return intermediate path object
	const createIntermediatePath = (from, to, raw, rawId) => {
		const rawId_ = `${raw}Id`;
		const path = {
			id: getId__(),
			from,
			to,
			raw,
			[rawId_]: rawId
		}

		// NOTE -> again this function should just return the intermediatePathObject

		// NOTE -> since this is an intermediate path and not the actual path, update the state
		dispatch({type: "CREATE_INTERMEDIATE_PATH", path});
	}

	/**
	 * 
	 * @param {number} id Epic Id
	 * @returns 
	 */
	const finaliseIntermediatePath = (id) => {
		if (state.intermediate.path === undefined)
			return;

		// debugger;
		if (id === undefined) {
			dispatch({type: "REMOVE_INTERMEDIATE_PATH"});
			return;
		}


		const k1 = state.intermediate.path.raw;
		const k2 = state.intermediate.path.raw === "from" ? "to" : "from";
		
		const p = {
			id: getId__(),
			[k2]: state.intermediate.path[k1 + "Id"],
			[k1]: id
		}

		// NOTE -> again this function should return the path object

		// NOTE -> call api
		dispatch({type: "CREATE_NEW_PATH", path: p});
	}

	/**
	 * 
	 * @param {{x: number, y: number}} pos 
	 */
	const drawPath = (pos) => {
		if (state.intermediate.path === undefined)
			return;

		// convert the pixels into grid
		const gridPos = pixelToGridBasedPos__(
			pos,
			canvasSize,
			numOfUnits );

		const newStartDate = add(startDate, {days: gridPos.x});
		const newEndDate = add(startDate, {days: gridPos.x + 1});


		const patch = {
			startDate: newStartDate,
			endDate: newEndDate,
			row: gridPos.y
		};

		// NOTE -> again this function should return patch for intermediate path

		const d = differenceInDays(newStartDate, state.intermediate.path[state.intermediate.path.raw].startDate);
		// NOTE -> update local state
		if (d !== 0) {
			dispatch({type: "PATCH_INTERMEDIATE_PATH_RAW", patch});
		}		
	}

	const moveEpic = (customEvent, pos) => {
		const epic = state.epics[customEvent.epicId];
		const gridPos = pixelToGridBasedPos__(pos, canvasSize, numOfUnits);
		const newStartDate = add(startDate, {days: gridPos.x});
		const widthInDays = differenceInDays(epic.endDate, epic.startDate);

		const newEndDate = add(startDate, {days: gridPos.x + widthInDays});

		// if new end date is greater than the end date of the canvas, then increase the size of the canvas to embody the new epic
		const d2 = differenceInDays(newEndDate, endDate);
		if (d2 >= 0) {
			increaseCanvasSizeBy(d2 + 1);
		}

		//debugger;

		//NOTE -> eventhough the current epic state could be intermediate, we will update it over API
		const diff = differenceInDays(newStartDate, epic.startDate);

		if (diff !== 0) {
			dispatch({type: "UPDATE_EPIC", id: epic.id, patch: {startDate: newStartDate, endDate: newEndDate}})
		}
	}

	/**
	 * 
	 * @param {{epicId: number, isLeftHandle: boolean}} customEvent 
	 * @param {{x: number, y: number}} pos 
	 * @returns 
	 */
	const resizeEpic = (customEvent, pos) => {
		const epic = state.epics[customEvent.epicId]

		const newGridPos = pixelToGridBasedPos__({x: pos.x, y: pos.y}, canvasSize, numOfUnits, true);

		const newDate = add(startDate, {days: newGridPos.x});


		// difference between newDate and last "endDate"
		if (customEvent.isLeftHandle) {
			if (differenceInDays(epic.startDate, newDate) === 0) return;
			if (differenceInDays(newDate, epic.endDate) >= 0) return;
		}
		else {
			if (differenceInDays(newDate, epic.endDate) === 0) return;
			if (differenceInDays(newDate, epic.startDate) <= 0) return;
		}

		let d3 = differenceInDays(newDate, endDate);
		if (d3 >= 0) {
			increaseCanvasSizeBy(d3 + 1);
		}

		//debugger;

		dispatch({type: "UPDATE_EPIC", id: epic.id, patch: {
			startDate: customEvent.isLeftHandle ? newDate : epic.startDate,
			endDate: !customEvent.isLeftHandle ? newDate : epic.endDate
		}})
	}

	const dragOver = (e) => {
		e.preventDefault();

		if (e.target.className !== "epic" && e.target.className !== "interactive-layer") {
			return;
		}


		const pos = {x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY};


		// position is always relative to interactive-layer
		if (e.target.className === "epic") {
			pos.x += e.target.offsetLeft;
			pos.y += e.target.offsetTop;
		}

		switch(dragData.current.type) {
			case "DRAW_PATH":
				drawPath(pos);
				break;
			case "MOVE_EPIC":
				moveEpic(dragData.current, pos);
				break;
			case "RESIZE_EPIC":
				resizeEpic(dragData.current, pos);
				break;
			// default:
			// 	throw new Error(`Unknown drag event type: ${dragData.current.type}`);
		}

	}

	const drop = (e) => {
		e.preventDefault();

		if (e.target.className !== "epic" && e.target.className !== "interactive-layer") {
			return;
		}

		switch(dragData.current.type) {
			case "DRAW_PATH":
				finaliseIntermediatePath(dragData.current.rawId);
				break;
		}
	}	

	return (
		<div className="canvas-with-scale" style={{position: "relative"}}>
			<HorizontalScale 
				style={{height: HORIZONTAL_SCALE_HEIGHT, position: "relative", left: `${VERTICAL_SCALE_WIDTH}px`}} 
				startDate={startDate} 
				endDate={endDate} 
				baseNodeDimensions={BASE_NODE_DIMENSIONS} 
				unit={SCALE_UNIT.month}
			/>
			<VerticalScale style={{width: VERTICAL_SCALE_WIDTH}} labels={["label 1", "label 2", "label 3"]} unit={BASE_NODE_DIMENSIONS} />
			<div 
				className="canvas-layer" 
				id="canvas-layer"
				style={{
					...canvasSize,
					position: "absolute",
					left: `${VERTICAL_SCALE_WIDTH}px`,
					top: `${HORIZONTAL_SCALE_HEIGHT}px`,
					backgroundImage: getGridlinesCss__(BASE_NODE_DIMENSIONS, GRIDLINE_SIZE_IN_PX, GRIDLINE_COLOR)
				}}>

				{/* Svg Layer */}
				<svg id="svg-layer">
					{Object.values(state.paths).map(x => {
						return <Path 
							canvas={{startDate}}
							from={state.epics[x.from]}
							to={state.epics[x.to]}
							id={id} />
					})}
					{state.intermediate.path !== undefined && <Path {...state.intermediate.path} canvas={{startDate}} />}
				</svg>

				<div 
					id="interactive-layer"
					className="interactive-layer"
					onDragOver={dragOver}
					onDrop={drop}
					onDoubleClick={interactiveLayerDoubleClickHandler}
				>
					{Object.values(state.epics).map((x) => {
						return <Epic 
							key={x.id}
							createPath={createIntermediatePath}
							notifyPathEnd={finaliseIntermediatePath}
							dragData={dragData}
							{...x}
							canvas={{
								dimensions: {...canvasSize},
								startDate,
								endDate,
								grid: {
									...numOfUnits
								}
							}} />
					})}
				</div>
			</div>
		</div>
  );
}

export default Canvas;
