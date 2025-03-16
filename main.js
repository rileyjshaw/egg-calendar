function hash11(n) {
	return fract(Math.sin(n) * 43758.5453123);
}
function fract(x) {
	return x - Math.floor(x);
}

const simplex = new SimplexNoise();
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
let time = 0;

const months = [
	'JANUARY ',
	'FEBRUARY ',
	'MARCH ',
	'APRIL ',
	'MAY ',
	'JUNE ',
	'JULY ',
	'AUGUST ',
	'SEPTEMBER ',
	'OCTOBER ',
	'NOVEMBER ',
	'DECEMBER ',
];

function getCookedEggPoint(i, numPoints, time, eggIndex) {
	const angle = (i / numPoints) * Math.PI * 2;
	const wobbleSpeed = 0.5;
	const wobbleAmount = 0.5;
	const noise =
		simplex.noise3D(Math.cos(angle) + time * wobbleSpeed, Math.sin(angle) + time * wobbleSpeed, eggIndex * 1000) *
		wobbleAmount;
	const radius = 30 + noise * 20;
	return {
		x: Math.cos(angle) * radius,
		y: Math.sin(angle) * radius,
	};
}

function createCookedEggPath(time, eggIndex) {
	const points = 24;
	let path = [];

	const lastPoint = getCookedEggPoint(points - 1, points, time, eggIndex);
	const firstPoint = getCookedEggPoint(0, points, time, eggIndex);

	const startPoint = {
		x: (lastPoint.x + firstPoint.x) / 2,
		y: (lastPoint.y + firstPoint.y) / 2,
	};

	path.push(`M ${startPoint.x},${startPoint.y}`);

	for (let i = 0; i < points; i++) {
		const currentPoint = getCookedEggPoint(i, points, time, eggIndex);
		const nextPoint = getCookedEggPoint((i + 1) % points, points, time, eggIndex);

		const midPoint = {
			x: (currentPoint.x + nextPoint.x) / 2,
			y: (currentPoint.y + nextPoint.y) / 2,
		};

		path.push(`Q ${currentPoint.x},${currentPoint.y} ${midPoint.x},${midPoint.y}`);
	}

	return path.join(' ');
}

// Source: https://youtu.be/36BJ4PKkbcQ
function createEggPath(R, h, d, r) {
	let path = 'M ' + R + ' ' + 0 + ' ';
	path += ' A ' + R + ' ' + R + ' 0 0 1 ' + -R + ' ' + 0 + ' ';
	path += ' A ' + (2 * R + d) + ' ' + (2 * R + d) + ' 0 0 1 ';
	path += R + d - ((2 * R + d) * (d + R)) / (2 * R + d - r) + ' ' + (-(2 * R + d) * h) / (2 * R + d - r) + ' ';
	path += ' A ' + r + ' ' + r + ' 0 0 1 ';
	path += -R - d + ((2 * R + d) * (d + R)) / (2 * R + d - r) + ' ' + (-(2 * R + d) * h) / (2 * R + d - r) + ' ';
	path += ' A ' + (2 * R + d) + ' ' + (2 * R + d) + ' 0 0 1 ';
	path += R + ' ' + 0 + ' ';
	return path;
}

function animate() {
	time += 0.005;
	const selectedYear = parseInt(document.querySelector('.selected').textContent);
	let monthLimit = currentMonth;
	if (selectedYear > currentYear) {
		monthLimit = 0;
	} else if (selectedYear < currentYear) {
		monthLimit = 12;
	}

	for (let i = 1; i <= 12; i++) {
		const path = document.getElementById(`actual-text-path-${i}`);

		if (i <= monthLimit) {
			const cookedEggPath = createCookedEggPath(time, i + selectedYear - 2020, selectedYear);
			path.setAttribute('d', cookedEggPath);
		}
	}
	requestAnimationFrame(animate);
}

function setYear(selectedYear) {
	document.querySelector('.selected').scrollIntoView({
		behavior: 'smooth',
		block: 'nearest',
		inline: 'center',
	});

	const eggs = Array.from(document.querySelectorAll('.egg'));
	eggs.forEach((egg, index) => {
		const i = index + 1;
		const link = egg.querySelector('a');
		const path = egg.querySelector('.actual-text-path');

		if (selectedYear > currentYear || (selectedYear === currentYear && i > currentMonth)) {
			// Future month.
			link.classList.add('future');
			link.removeAttribute('href');
			let m = 50; // Size, adjust as needed
			let R = Math.floor(m * (hash11(selectedYear + i) * 0.05 + 0.35));
			let h = Math.floor((0.8 + hash11(selectedYear + 12 * i) * 0.8) * R);
			let d = Math.floor((0.25 + hash11(selectedYear + 12 * 12 * i) * 0.45) * R);
			let r = d + 2 * R - Math.sqrt((d + R) * (d + R) + h * h);
			const eggPath = createEggPath(R, h, d, r);
			path.setAttribute('d', eggPath);
		} else {
			// Past or current month.
			link.setAttribute('href', `/${selectedYear}/${String(i).padStart(2, '0')}`);
			link.classList.remove('future');
		}
	});
}

document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('tspan').forEach((textContent, index) => {
		textContent.textContent = months[index].repeat(20);
	});

	const header = document.querySelector('header');
	const yearButtons = [];
	for (let year = 1991; year <= 2050; ++year) {
		const button = document.createElement('button');
		button.textContent = year;
		button.classList.add(`year-${year}`);
		if (year === currentYear) {
			button.classList.add('selected');
		}
		button.addEventListener('click', () => {
			yearButtons.forEach(btn => btn.classList.remove('selected'));
			button.classList.add('selected');
			const selectedYear = parseInt(button.textContent);
			setYear(selectedYear);
		});
		header.appendChild(button);
		yearButtons.push(button);
	}

	setYear(currentYear);
	animate();

	let resizeTimeout;
	window.addEventListener('resize', () => {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(() => {
			document.querySelector('.selected').scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
				inline: 'center',
			});
		}, 150);
	});
});
