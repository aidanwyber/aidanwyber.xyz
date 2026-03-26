export type Quaternion = Readonly<{
	w: number;
	x: number;
	y: number;
	z: number;
}>;

export const IDENTITY_QUATERNION: Quaternion = {
	w: 1,
	x: 0,
	y: 0,
	z: 0,
};

type AxisAngle = Readonly<{
	angle: number;
	axis: readonly [number, number, number];
}>;

function normalizeQuaternion(quaternion: Quaternion): Quaternion {
	const magnitude = Math.hypot(
		quaternion.w,
		quaternion.x,
		quaternion.y,
		quaternion.z,
	);

	if (magnitude === 0) {
		return IDENTITY_QUATERNION;
	}

	return {
		w: quaternion.w / magnitude,
		x: quaternion.x / magnitude,
		y: quaternion.y / magnitude,
		z: quaternion.z / magnitude,
	};
}

function dotQuaternion(left: Quaternion, right: Quaternion) {
	return (
		left.w * right.w +
		left.x * right.x +
		left.y * right.y +
		left.z * right.z
	);
}

function multiplyQuaternions(left: Quaternion, right: Quaternion): Quaternion {
	return normalizeQuaternion({
		w:
			left.w * right.w -
			left.x * right.x -
			left.y * right.y -
			left.z * right.z,
		x:
			left.w * right.x +
			left.x * right.w +
			left.y * right.z -
			left.z * right.y,
		y:
			left.w * right.y -
			left.x * right.z +
			left.y * right.w +
			left.z * right.x,
		z:
			left.w * right.z +
			left.x * right.y -
			left.y * right.x +
			left.z * right.w,
	});
}

function quaternionFromAxisAngle(
	axis: readonly [number, number, number],
	angle: number,
): Quaternion {
	const axisLength = Math.hypot(axis[0], axis[1], axis[2]) || 1;
	const halfAngle = angle * 0.5;
	const sine = Math.sin(halfAngle) / axisLength;

	return normalizeQuaternion({
		w: Math.cos(halfAngle),
		x: axis[0] * sine,
		y: axis[1] * sine,
		z: axis[2] * sine,
	});
}

export function quaternionFromYawPitch(yaw: number, pitch: number): Quaternion {
	const yawQuaternion = quaternionFromAxisAngle([0, 1, 0], yaw);
	const pitchQuaternion = quaternionFromAxisAngle([1, 0, 0], pitch);

	return multiplyQuaternions(yawQuaternion, pitchQuaternion);
}

export function conjugateQuaternion(quaternion: Quaternion): Quaternion {
	return {
		w: quaternion.w,
		x: -quaternion.x,
		y: -quaternion.y,
		z: -quaternion.z,
	};
}

export function slerpQuaternion(
	from: Quaternion,
	to: Quaternion,
	amount: number,
): Quaternion {
	const t = amount; //Math.min(Math.max(amount, 0), 1);
	let target = to;
	let cosine = dotQuaternion(from, to);

	if (cosine < 0) {
		cosine = -cosine;
		target = {
			w: -to.w,
			x: -to.x,
			y: -to.y,
			z: -to.z,
		};
	}

	if (cosine > 0.9995) {
		return normalizeQuaternion({
			w: from.w + (target.w - from.w) * t,
			x: from.x + (target.x - from.x) * t,
			y: from.y + (target.y - from.y) * t,
			z: from.z + (target.z - from.z) * t,
		});
	}

	const theta = Math.acos(Math.min(Math.max(cosine, -1), 1));
	const sine = Math.sin(theta);

	if (sine < 0.0001) {
		return normalizeQuaternion(target);
	}

	const fromWeight = Math.sin((1 - t) * theta) / sine;
	const toWeight = Math.sin(t * theta) / sine;

	return normalizeQuaternion({
		w: from.w * fromWeight + target.w * toWeight,
		x: from.x * fromWeight + target.x * toWeight,
		y: from.y * fromWeight + target.y * toWeight,
		z: from.z * fromWeight + target.z * toWeight,
	});
}

export function quaternionToAxisAngle(quaternion: Quaternion): AxisAngle {
	const normalized = normalizeQuaternion(quaternion);
	const clampedW = Math.min(Math.max(normalized.w, -1), 1);
	const angle = 2 * Math.acos(clampedW);
	const sine = Math.sqrt(1 - clampedW * clampedW);

	if (sine < 0.0001) {
		return {
			angle: 0,
			axis: [0, 1, 0],
		};
	}

	return {
		angle,
		axis: [normalized.x / sine, normalized.y / sine, normalized.z / sine],
	};
}
