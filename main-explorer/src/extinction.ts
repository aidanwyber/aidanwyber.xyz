export type RGBColor = readonly [number, number, number];
export type ExtinctionCoefficients = readonly [number, number, number];

const DEFAULT_COEFFICIENTS: ExtinctionCoefficients = [1, 0.92, 0.78];

function mixChannel(
	skyChannel: number,
	objectChannel: number,
	transmittance: number,
) {
	return skyChannel + (objectChannel - skyChannel) * transmittance;
}

// Beer-Lambert extinction pushes distant object color toward the sky color.
export function extinctionMix(
	objectColor: RGBColor,
	skyColor: RGBColor,
	distance: number,
	density = 0.003,
	coefficients: ExtinctionCoefficients = DEFAULT_COEFFICIENTS,
): RGBColor {
	const opticalDepth = Math.max(distance, 0) * density;

	const redTransmittance = Math.exp(-opticalDepth * coefficients[0]);
	const greenTransmittance = Math.exp(-opticalDepth * coefficients[1]);
	const blueTransmittance = Math.exp(-opticalDepth * coefficients[2]);

	return [
		mixChannel(skyColor[0], objectColor[0], redTransmittance),
		mixChannel(skyColor[1], objectColor[1], greenTransmittance),
		mixChannel(skyColor[2], objectColor[2], blueTransmittance),
	];
}
