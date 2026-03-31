/// <reference types="p5/global" />

import 'p5';
import { extinctionMix, type RGBColor } from './extinction';
import {
	conjugateQuaternion,
	IDENTITY_QUATERNION,
	quaternionFromYawPitch,
	quaternionToAxisAngle,
	rotateVectorByQuaternion,
	slerpQuaternion,
	type Quaternion,
} from './quaternion';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app');
const skyColor: RGBColor = [228, 236, 244];
const outlineColor: RGBColor = [0, 0, 0];
const cameraDistance = 920;
const fovDegrees = 60;
const gridRadius = 3;
const gridSpacing = 170;
const boxSize = 26;
const lookSensitivity = 0.006;
const pitchLimit = 1.12;

let yawTarget = 0;
let pitchTarget = 0;
let currentOrientation: Quaternion = IDENTITY_QUATERNION;
let targetOrientation: Quaternion = IDENTITY_QUATERNION;

if (!app) {
	throw new Error('App root not found');
}

app.innerHTML = '';

function applyCameraPerspective() {
	perspective(radians(fovDegrees), width / height, 1, 5000);
}

function updateTargetOrientation() {
	if (!mouseIsPressed) {
		return;
	}

	const deltaX = mouseX - pmouseX;
	const deltaY = mouseY - pmouseY;

	yawTarget -= deltaX * lookSensitivity;
	pitchTarget = constrain(
		pitchTarget - deltaY * lookSensitivity,
		-pitchLimit,
		pitchLimit,
	);

	targetOrientation = quaternionFromYawPitch(yawTarget, pitchTarget);
}

function drawBoxGrid(viewQuaternion: Quaternion) {
	for (let xIndex = -gridRadius; xIndex <= gridRadius; xIndex += 1) {
		for (let yIndex = -gridRadius; yIndex <= gridRadius; yIndex += 1) {
			for (let zIndex = -gridRadius; zIndex <= gridRadius; zIndex += 1) {
				const x = xIndex * gridSpacing;
				const y = yIndex * gridSpacing;
				const z = zIndex * gridSpacing;
				const viewPosition = rotateVectorByQuaternion(viewQuaternion, [
					x,
					y,
					z,
				]);
				const distanceFromCamera = Math.hypot(
					viewPosition[0],
					viewPosition[1],
					cameraDistance - viewPosition[2],
				);
				const baseColor: RGBColor = [
					map(xIndex, -gridRadius, gridRadius, 68, 226),
					map(yIndex, -gridRadius, gridRadius, 92, 208),
					map(zIndex, -gridRadius, gridRadius, 210, 96),
				];
				const boxTint = extinctionMix(
					baseColor,
					skyColor,
					distanceFromCamera,
					0.00155,
					[1.06, 0.96, 0.84],
				);
				const outlineTint = extinctionMix(
					outlineColor,
					skyColor,
					distanceFromCamera,
					0.00155,
					[1.06, 0.96, 0.84],
				);

				push();
				{
					translate(x, y, z);
					fill(boxTint[0], boxTint[1], boxTint[2]);
					stroke(outlineTint[0], outlineTint[1], outlineTint[2], 180);
					strokeWeight(1);
					box(boxSize, boxSize, boxSize);
				}
				pop();
			}
		}
	}
}

function drawCrosshair() {
	push();
	resetMatrix();
	ortho(-width / 2, width / 2, -height / 2, height / 2, -1000, 1000);
	stroke(0, 13);
	strokeWeight(1);
	line(-8, 0, 8, 0);
	line(0, -8, 0, 8);
	pop();
}

window.setup = () => {
	const canvas = createCanvas(windowWidth, windowHeight, WEBGL);
	canvas.parent(app);
	setAttributes('antialias', true);

	noStroke();
	applyCameraPerspective();
};

window.draw = () => {
	updateTargetOrientation();
	currentOrientation = slerpQuaternion(
		currentOrientation,
		targetOrientation,
		0.12,
	);

	background(...skyColor);
	applyCameraPerspective();
	camera(0, 0, cameraDistance, 0, 0, 0, 0, 1, 0);

	push();
	const viewQuaternion = conjugateQuaternion(currentOrientation);
	const viewRotation = quaternionToAxisAngle(viewQuaternion);

	if (viewRotation.angle > 0.0001) {
		rotate(viewRotation.angle, [...viewRotation.axis]);
	}

	noLights();

	push();
	noFill();
	const frameTint = extinctionMix(
		outlineColor,
		skyColor,
		cameraDistance,
		0.00155,
		[1.06, 0.96, 0.84],
	);
	stroke(frameTint[0], frameTint[1], frameTint[2], 110);
	strokeWeight(1);
	box(
		gridRadius * gridSpacing * 2.2,
		gridRadius * gridSpacing * 2.2,
		gridRadius * gridSpacing * 2.2,
	);
	pop();

	drawBoxGrid(viewQuaternion);
	pop();

	drawCrosshair();
};

window.windowResized = () => {
	resizeCanvas(windowWidth, windowHeight);
	applyCameraPerspective();
};
