import { describe, it, expect } from 'vitest'
import {
	hexToRgb,
	rgbToHex,
	hslToRgb,
	calculateLuminance,
	getClosestColor,
	getClosestColorNewton,
	type RGB,
	type HSL,
	rgbToHsl
} from '../src/index'

function formatRgb(rgb: RGB) {
	return `{r=${rgb.r.toString().padStart(3, ' ')}, g=${rgb.g.toString().padStart(3, ' ')}, b=${rgb.b
		.toString()
		.padStart(3, ' ')}}`
}
function formatHsl(hsl: HSL) {
	return `{h=${hsl.h.toString().padStart(3, ' ')}, s=${hsl.s.toString().padStart(3, ' ')}, l=${hsl.l
		.toString()
		.padStart(3, ' ')}}`
}

describe('hexToRgb', () => {
	const testValues = [
		{ hex: '#000000', rgb: { r: 0, g: 0, b: 0 } },
		{ hex: '#ffffff', rgb: { r: 255, g: 255, b: 255 } },
		{ hex: '#ff0000', rgb: { r: 255, g: 0, b: 0 } },
		{ hex: '#00ff00', rgb: { r: 0, g: 255, b: 0 } },
		{ hex: '#0000ff', rgb: { r: 0, g: 0, b: 255 } }
	]

	testValues.forEach(({ hex, rgb }) => {
		it(`with hex=${hex} should return ${formatRgb(rgb)}`, () => {
			const res = hexToRgb(hex)
			expect(res.r).toEqual(rgb.r)
			expect(res.g).toEqual(rgb.g)
			expect(res.b).toEqual(rgb.b)
		})
	})
})

describe('rgbToHex', () => {
	const testValues = [
		{ rgb: { r: 0, g: 0, b: 0 }, hex: '#000000' },
		{ rgb: { r: 255, g: 255, b: 255 }, hex: '#ffffff' },
		{ rgb: { r: 255, g: 0, b: 0 }, hex: '#ff0000' },
		{ rgb: { r: 0, g: 255, b: 0 }, hex: '#00ff00' },
		{ rgb: { r: 0, g: 0, b: 255 }, hex: '#0000ff' }
	]

	testValues.forEach(({ rgb, hex }) => {
		it(`with rgb = ${formatRgb(rgb)} should return ${hex}`, () => {
			const res = rgbToHex(rgb)
			expect(res).toEqual(hex)
		})
	})
})

describe('hslToRgb', () => {
	const testValues = [
		{ hsl: { h: 0, s: 0, l: 0 }, rgb: { r: 0, g: 0, b: 0 } },
		{ hsl: { h: 0, s: 0, l: 1 }, rgb: { r: 255, g: 255, b: 255 } },
		{ rgb: { r: 255, g: 0, b: 0 }, hsl: { h: 0, s: 1, l: 0.5 } },
		{ rgb: { r: 0, g: 255, b: 0 }, hsl: { h: 0.3333333333333333, s: 1, l: 0.5 } },
		{ rgb: { r: 0, g: 0, b: 255 }, hsl: { h: 0.6666666666666666, s: 1, l: 0.5 } }
	]

	testValues.forEach(({ hsl, rgb }) => {
		it(`with hsl=${formatHsl(hsl)} should return ${formatRgb(rgb)}`, () => {
			const res = hslToRgb(hsl)
			expect(res.r).toEqual(rgb.r)
			expect(res.g).toEqual(rgb.g)
			expect(res.b).toEqual(rgb.b)
		})
	})
})

describe('rgbToHsl', () => {
	const testValues = [
		{ rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 } },
		{ rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 1 } },
		{ rgb: { r: 255, g: 0, b: 0 }, hsl: { h: 0, s: 1, l: 0.5 } },
		{ rgb: { r: 0, g: 255, b: 0 }, hsl: { h: 0.3333333333333333, s: 1, l: 0.5 } },
		{ rgb: { r: 0, g: 0, b: 255 }, hsl: { h: 0.6666666666666666, s: 1, l: 0.5 } }
	]

	testValues.forEach(({ rgb, hsl }) => {
		it(`with rgb = ${formatRgb(rgb)} should return ${formatHsl(hsl)}`, () => {
			const res = rgbToHsl(rgb)
			expect(res.h).toEqual(hsl.h)
			expect(res.s).toEqual(hsl.s)
			expect(res.l).toEqual(hsl.l)
		})
	})
})

describe('calculateLuminance', () => {
	const testValues = [
		{ rgb: { r: 255, g: 255, b: 255 }, luminance: 1 },
		{ rgb: { r: 0, g: 0, b: 0 }, luminance: 0 },
		{ rgb: { r: 255, g: 0, b: 0 }, luminance: 0.2126 },
		{ rgb: { r: 0, g: 255, b: 0 }, luminance: 0.7152 },
		{ rgb: { r: 0, g: 0, b: 255 }, luminance: 0.0722 }
	]

	testValues.forEach(({ rgb, luminance }) => {
		it(`with rgb = ${formatRgb(rgb)} should return ${luminance}`, () => {
			const res = calculateLuminance(rgb)
			expect(res).toEqual(luminance)
		})
	})
})

describe('getClosestColor', () => {
	const testValues = [
		{ hex: '#000000', luminance: 0, hexOut: '#000000' },
		{ hex: '#000000', luminance: 1, hexOut: '#ffffff' },
		{ hex: '#000000', luminance: 0.5, hexOut: '#bcbcbc' },
		{ hex: '#ff0000', luminance: 0.5, hexOut: '#ffa2a2' },
		{ hex: '#00ff00', luminance: 0.5, hexOut: '#00d900' },
		{ hex: '#0000ff', luminance: 0.5, hexOut: '#b5b5ff' }
	]

	testValues.forEach(({ hex, luminance, hexOut }) => {
		it(`with hex=${hex} and luminance target ${luminance} should return ${hexOut}`, () => {
			const res = getClosestColor(hex, luminance)
			expect(res).toEqual(hexOut)
		})
	})
})

describe('getClosestColorNewton', () => {
	const testValues = [
		{ hex: '#000000', luminance: 0, hexOut: '#000000' },
		{ hex: '#000000', luminance: 1, hexOut: '#ffffff' },
		{ hex: '#000000', luminance: 0.5, hexOut: '#bbbbbb' },
		{ hex: '#ff0000', luminance: 0.5, hexOut: '#ffa2a2' },
		{ hex: '#00ff00', luminance: 0.5, hexOut: '#00d900' },
		{ hex: '#0000ff', luminance: 0.5, hexOut: '#b4b4ff' }
	]

	testValues.forEach(({ hex, luminance, hexOut }) => {
		it(`with hex=${hex} and luminance target ${luminance} should return ${hexOut}`, () => {
			const res = getClosestColorNewton(hex, luminance)
			expect(res).toEqual(hexOut)
		})
	})
})
