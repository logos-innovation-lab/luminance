export interface RGB {
	r: number
	g: number
	b: number
}

export interface HSL {
	h: number
	s: number
	l: number
}

interface HUE {
	p: number
	q: number
	t: number
}

export function hexToRgb(hex: string): RGB {
	const bigint = parseInt(hex.substring(1), 16)
	const r = (bigint >> 16) & 255
	const g = (bigint >> 8) & 255
	const b = bigint & 255

	return { r, g, b }
}

export function rgbToHex({ r, g, b }: RGB) {
	return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b
		.toString(16)
		.padStart(2, '0')}`
}

// Converts an HSL color value to RGB.
// h, s, and l are contained in the set [0, 1] and
// returns r, g, and b in the set [0, 255].
export function hslToRgb({ h, s, l }: HSL): RGB {
	let r, g, b

	if (s == 0) {
		r = g = b = l // achromatic
	} else {
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s
		const p = 2 * l - q
		r = hue2rgb({ p, q, t: h + 1 / 3 })
		g = hue2rgb({ p, q, t: h })
		b = hue2rgb({ p, q, t: h - 1 / 3 })
	}

	return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
}

// Converts an RGB color value to HSL.
// r, g, and b are contained in the set [0, 255] and
// returns h, s, and l in the set [0, 1].
export function rgbToHsl({ r, g, b }: RGB): HSL {
	r /= 255
	g /= 255
	b /= 255
	const max = Math.max(r, g, b)
	const min = Math.min(r, g, b)
	const l = (max + min) / 2
	let h,
		s = l

	if (max == min) {
		h = s = 0 // achromatic
	} else {
		const d = max - min
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0)
				break
			case g:
				h = (b - r) / d + 2
				break
			default: // case b:
				h = (r - g) / d + 4
				break
		}
		h /= 6
	}

	return { h, s, l }
}

function hue2rgb({ p, q, t }: HUE) {
	if (t < 0) t += 1
	if (t > 1) t -= 1
	if (t < 1 / 6) return p + (q - p) * 6 * t
	if (t < 1 / 2) return q
	if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
	return p
}

function gammaCorrect(color: number) {
	return color <= 0.03928 ? color / 12.92 : ((color + 0.055) / 1.055) ** 2.4
}

export function calculateLuminance(rgbOrHex: RGB | string) {
	if (typeof rgbOrHex === 'string') rgbOrHex = hexToRgb(rgbOrHex)
	let { r, g, b } = rgbOrHex

	// Normalized to values between 0 and 1
	r /= 255
	g /= 255
	b /= 255

	// apply gamma correction
	r = gammaCorrect(r)
	g = gammaCorrect(g)
	b = gammaCorrect(b)

	// calculate luminance
	return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function getClosestColor(
	hex: string,
	targetLuminance: number,
	targetPrecision = 0.01,
	maxSteps = 100
) {
	return getClosestColorBisection(hex, targetLuminance, targetPrecision, maxSteps)
}

export function getClosestColorNewton(
	hex: string,
	targetLuminance: number,
	targetPrecision = 0.01,
	maxSteps = 100
) {
	// 	// Just a shortcut for all colors these are 0 and 100 luminance
	if (targetLuminance <= 0) return '#000000'
	if (targetLuminance >= 1) return '#ffffff'

	const hsl = rgbToHsl(hexToRgb(hex))
	const damping = 15 // Damping factor to avoid instability

	for (let steps = 0; steps < maxSteps; ++steps) {
		// Limit iterations to prevent infinite loop
		const rgb = hslToRgb(hsl)
		const currentLuminance = calculateLuminance(rgb)
		const error = currentLuminance - targetLuminance

		if (Math.abs(error) / targetLuminance <= targetPrecision) {
			return rgbToHex(rgb) // Found suitable luminance
		}

		// If the color is white and the target luminance is less than the current, start decreasing the brightness
		if (rgb.r === 255 && rgb.g === 255 && rgb.b === 255 && targetLuminance < currentLuminance) {
			hsl.l -= 0.01 // decrement brightness
			continue
		}

		// Newton-Raphson update
		const tmpRgb = hslToRgb({ ...hsl, l: hsl.l + 0.01 })
		const derivative = (calculateLuminance(tmpRgb) - currentLuminance) / 0.01

		if (error) hsl.l -= error / derivative / damping

		// Clamp brightness to [0,1]
		if (hsl.l < 0) hsl.l = 0
		if (hsl.l > 1) hsl.l = 1
	}

	return rgbToHex(hslToRgb(hsl)) // Suitable luminance wasn't found in time, return
}

export function getClosestColorBisection(
	hex: string,
	targetLuminance: number,
	targetPrecision = 0.01,
	maxSteps = 100
) {
	// Just a shortcut for all colors these are 0 and 100 luminance
	if (targetLuminance <= 0) return '#000000'
	if (targetLuminance >= 1) return '#ffffff'

	const hsl = rgbToHsl(hexToRgb(hex))

	let low = 0,
		high = 1,
		steps = 0
	let lowLum = 0,
		highLum = 1
	for (
		steps = 0;
		(highLum - lowLum) / targetLuminance > targetPrecision && steps < maxSteps;
		steps += 1
	) {
		// Stop when interval size is within target precision
		hsl.l = (low + high) / 2 // Take the midpoint as the new guess
		const currentLuminance = calculateLuminance(hslToRgb(hsl))

		if (currentLuminance > targetLuminance) {
			high = hsl.l
			highLum = currentLuminance
		} else {
			low = hsl.l
			lowLum = currentLuminance
		}
	}

	return rgbToHex(hslToRgb(hsl)) // Return the hex color for the best luminance match
}
