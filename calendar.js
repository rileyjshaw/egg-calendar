const pathNameWithoutTrailingSlash = window.location.pathname.replace(/\/$/, '');
const pathParts = pathNameWithoutTrailingSlash.split('/');
const year = parseInt(pathParts[pathParts.length - 2], 10);
const month = parseInt(pathParts[pathParts.length - 1], 10) - 1; // JavaScript months are 0-indexed
document.title = new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' });

(() => {
	fetch('./days.json')
		.then(r => r.json())
		.catch(() => [])
		.then(monthEvents => {
			const container = document.querySelector('.calendar');

			// Calculate the first day of the month (0 = Sunday, 1 = Monday, etc.)
			const firstDay = new Date(year, month, 1).getDay();
			// Get the number of days in the month
			const daysInMonth = new Date(year, month + 1, 0).getDate();

			// Add empty divs for days before the 1st of the month
			for (let i = 0; i < firstDay; i++) {
				const emptyDay = document.createElement('div');
				emptyDay.className = 'day empty';
				container.append(emptyDay);
			}

			// Create the days of the month
			for (let i = 0; i < daysInMonth; i++) {
				const day = document.createElement('div');
				day.className = 'day';

				const dayEvents = monthEvents[i] || [];

				// If no events, just show the day number
				(dayEvents.length ? dayEvents : [i + 1]).forEach(event => {
					const div = document.createElement('div');
					div.className = 'wrapper';
					const p = document.createElement('p');
					p.textContent = event;
					div.append(p);
					day.append(div);
				});

				container.append(day);
			}

			const ps = Array.from(document.querySelectorAll('p'));

			let debounceRef = null;
			function rescale() {
				if (debounceRef === null) {
					ps.forEach(p => {
						p.style.transform = 'none';
						p.className = '';
					});
				} else clearTimeout(debounceRef);
				debounceRef = setTimeout(rescaleInner, 100);
			}

			function rescaleInner() {
				ps.forEach(p => {
					const { parentElement: container } = p;

					const { height: h0, width: w0 } = p.getBoundingClientRect();
					const { height: h1, width: w1 } = container.getBoundingClientRect();

					p.style.transform = `scale(${w1 / w0}, ${h1 / h0})`;
					p.className = 'show';
				});
				debounceRef = null;
			}

			window.addEventListener('resize', rescale);
			rescale();
		});
})();
