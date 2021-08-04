class Vector2 {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	isValid() {
		return typeof this.x === "number" && this.y === "number";
	}
}

export default Vector2;