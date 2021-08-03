import {differenceInDays} from "date-fns";
import {gridToPixelBasedPos__} from "../canvasHelper";
import { BASE_NODE_DIMENSIONS } from "../enums";


const Epic = ({id, startDate, endDate, color, row, canvas, createPath, dragData, notifyPathEnd}) => {
	/**
	 * Calculates position in pixels relative to canvas, references intermediateState if between an event, like resizing epic.
	 * @returns {{x: number, y: number}}
	 */
	const calcPos = () => {
		return gridToPixelBasedPos__({
			x: differenceInDays(startDate, canvas.startDate),
			y: row
		}, BASE_NODE_DIMENSIONS)
	}

	const pos = calcPos();
	
	const width = (differenceInDays(endDate, startDate)) * BASE_NODE_DIMENSIONS.width;

	const resizeHandleCssDimensions = {
		width: Math.min(parseInt(width / 5), BASE_NODE_DIMENSIONS.width / 5),
		height: BASE_NODE_DIMENSIONS.height
	}

	const epicDragStartHandler = (e) => {
		dragData.current = {
			epicId: id,
			type: "MOVE_EPIC"
		}
		e.dataTransfer.setDragImage(new Image(), 0, 0);
	}

	const epicDragEndHandler = (e) => {
		dragData.current = {};
	}

	const resizerDragStartHandler = (e, isLeftHandle) => {
		e.stopPropagation();
		e.dataTransfer.setDragImage(new Image(), 0, 0)
		dragData.current = {
			epicId: id,
			type: "RESIZE_EPIC",
			isLeftHandle
		}
	}

	const resizerDragEndHandler = (e) => {
		e.stopPropagation();
		dragData.current = {};
	}

	const tipDragStartHandler = (e, direction) => {
		e.stopPropagation();
		e.dataTransfer.setDragImage(new Image(), 0, 0);
		dragData.current = {
			type: "DRAW_PATH"
		}

		let raw = "from"
		if (direction === "RIGHT") {
			raw = "to";
		}	

		const fromTo = {
			startDate,
			endDate,
			row
		}

		createPath(fromTo, {...fromTo}, raw, id);
	}

	const epicDropHandler = (e) => {
		e.preventDefault();

		if (dragData.current.type !== "DRAW_PATH") return;
		dragData.current.rawId = id;
	}

	const tipDragEndHandler = (e) => {
		e.preventDefault();
		if (e.target.className !== "epic" && e.target.className !== "interactive-layer") {
			notifyPathEnd(undefined);
		}
		dragData.current = {};
	}

	return (
		<div
			className="epic"
			draggable={true}
			onDragStart={epicDragStartHandler}
			onDragEnd={epicDragEndHandler}
			onDragOver={e => e.preventDefault()}
			onDrop={epicDropHandler}
			style={{
				position: "absolute",
				left: pos.x,
				top: pos.y,
				height: BASE_NODE_DIMENSIONS.height,
				width,
				backgroundColor: color
			}}	
		>
			<div 
				className="epic-left-tip"
				draggable
				onDragStart={e => tipDragStartHandler(e, "LEFT")}
				onDrag={e => e.stopPropagation()}
				onDragEnd={tipDragEndHandler} />
			<div 
				className="epic-resize-left-handle" 
				style={resizeHandleCssDimensions} 
				draggable 
				onDragStart={e => resizerDragStartHandler(e, true)} 
				onDragEnd={resizerDragEndHandler} />
			<div 
				className="epic-resize-right-handle" 
				style={resizeHandleCssDimensions} 
				draggable 
				onDragStart={e => resizerDragStartHandler(e, false)} 
				onDragEnd={resizerDragEndHandler} />
			<div 
				className="epic-right-tip" 
				draggable
				onDragStart={e => tipDragStartHandler(e, "RIGHT")}
				onDrag={e => e.stopPropagation()}
				onDragEnd={tipDragEndHandler} />
		</div>
	)
}

export default Epic;