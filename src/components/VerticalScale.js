const VerticalScale = ({style, labels, unit}) => {
	return (
		<div className="vertical-scale" style={{...style}}>
			{labels.map(x => {
				return <div style={{height: unit.height}}>{x}</div>
			})}
		</div>
	)
}

export default VerticalScale;