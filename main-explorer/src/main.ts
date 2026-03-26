/// <reference types="p5/global" />

import 'p5';
import { extinctionMix, type RGBColor } from './extinction';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app');
const skyColor: RGBColor = [8, 12, 20];
const warmAccent: RGBColor = [255, 118, 91];
const coolAccent: RGBColor = [24, 121, 255];
const beamColor: RGBColor = [245, 247, 251];

if (!app) {
	throw new Error('App root not found');
}

app.innerHTML = `
  <div class="viewport-shell">
    <div class="viewport-label">
      <span>Main Explorer</span>
      <span>p5 global mode</span>
    </div>
  </div>
`;

window.setup = () => {
	const canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent(app);

	noStroke();
};

window.draw = () => {
	background(...skyColor);

	const glow = 50 + sin(frameCount * 0.02) * 20;
	const coolGlow = extinctionMix(coolAccent, skyColor, 180, 0.0022);
	fill(coolGlow[0], coolGlow[1], coolGlow[2], 28);
	circle(width * 0.35, height * 0.4, min(width, height) * 0.7 + glow);

	const warmGlow = extinctionMix(warmAccent, skyColor, 120, 0.0026);
	fill(warmGlow[0], warmGlow[1], warmGlow[2], 32);
	circle(width * 0.72, height * 0.62, min(width, height) * 0.45 - glow * 0.4);

	const trackerDepth = map(mouseY, 0, height, 20, 500);
	const trackerTint = extinctionMix(
		warmAccent,
		skyColor,
		trackerDepth,
		0.0024,
	);
	const trackerHighlight = extinctionMix(
		beamColor,
		skyColor,
		trackerDepth * 0.35,
		0.0012,
	);
	const haloSize = 42 + sin(frameCount * 0.08) * 3;

	push();
	noFill();
	stroke(trackerHighlight[0], trackerHighlight[1], trackerHighlight[2], 180);
	strokeWeight(2);
	circle(mouseX, mouseY, haloSize);

	noStroke();
	fill(trackerTint[0], trackerTint[1], trackerTint[2], 230);
	circle(mouseX, mouseY, 18);

	fill(255, 255, 255, 245);
	circle(mouseX, mouseY, 5);
	pop();
};

window.windowResized = () => {
	resizeCanvas(windowWidth, windowHeight);
};
