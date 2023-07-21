# @waku-objects/luminance

[![Tests](https://github.com/logos-innovation-lab/luminance/actions/workflows/test.yml/badge.svg)](https://github.com/logos-innovation-lab/luminance/actions/workflows/test.yml)
[![](https://img.shields.io/badge/made%20by-Logos%20Innovation%20Lab-blue.svg?style=flat-square)](https://github.com/logos-innovation-lab)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
![](https://img.shields.io/badge/pnpm-%3E%3D7.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D16.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/runs%20in-browser%20%7C%20node%20%7C%20webworker%20%7C%20electron-orange)

> Library for calculating color luminance and getting corresponding luminance colors

**Warning: This project is in beta state. There might (and most probably will) be changes in the future to its API and working. Also, no guarantees can be made about its stability, efficiency, and security at this stage.**

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [License](#license)

## Install

```sh
pnpm install @waku-objects/luminance --save
```

## Usage

```typescript
import { calculateLuminance, getClosestColor } from '@waku-objects/luminance'

// Calculate luminance of a color (luminance is between 0 and 1)
calculateLuminance('#acacac') // supports hex
calculateLuminance({ r: 200, g: 200, b: 200 }) // and RGB

// Finds a color with the same hue that would fullfil target luminance
getClosestColor('#ff0000', 0.5) // returns #ffa2a2
getClosestColor({ r: 255, g: 0, b: 9 }, 0.5) // returns #ffa2a2
```

List of all functions and interfaces:

```typescript
interface RGB {
	r: number
	g: number
	b: number
}
interface HSL {
	h: number
	s: number
	l: number
}
export interface HUE {
	p: number
	q: number
	t: number
}

// Utility conversion functions
function hexToRgb(hex: string): RGB
function rgbToHex({ r, g, b }: RGB): string
function hslToRgb({ h, s, l }: HSL): RGB
function rgbToHsl({ r, g, b }: RGB): HSL

// Calculate luminance
function calculateLuminance(rgbOrHex: RGB | string): number

// Find color with same hue that would be closest to a targetLuminance (uses bisection algorithm with at most 100 iterations)
function getClosestColor(
	hex: string,
	targetLuminance: number,
	targetPrecision?: number,
	maxSteps?: number
): string

function getClosestColorBisection(
	hex: string,
	targetLuminance: number,
	targetPrecision?: number,
	maxSteps?: number
): string

// Implementation with newton itterative method, better results than bisection for more than 100 iterations
function getClosestColorNewton(
	hex: string,
	targetLuminance: number,
	targetPrecision?: number,
	maxSteps?: number
): string
```

## License

[MIT](./LICENSE)
