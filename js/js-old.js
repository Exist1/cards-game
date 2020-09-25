"use strict";

window.addEventListener('load', function() {

	let attackTableTabs = document.querySelectorAll('.attackTable__tab'),
		textChance = document.querySelector('.attackTable__text_chance'),
		textDamage = document.querySelector('.attackTable__text_damage'),
		textTotal = document.querySelector('.attackTable__result'),
		randomBtn = document.querySelector('.attackTable__randomCube'),
		nameDataSelected = 'data-selected',
		nameDataResult = 'data-result',
		isActive = 'is-active',
		noActive = 'attackTable__item_no-active',
		isWarn = 'is-warning',
		requestURL = './js/attackTable.json', // 'https://github.com/Exist1/card-tanks/blob/master/attackTable.json',
		request = new XMLHttpRequest(),
		attCaching = attackTableTabs.length;

	request.open('GET', requestURL);
	request.responseType = 'json';
	request.send();

	request.onload = function() {
		let attackTable = request.response,
			miss = ['промах', 'мазила', 'рукожоп'],
			tabFirepower, tabProtection, tabTotal;

		for (let att = 0; att < attCaching; att++) {
			let tab = attackTableTabs[att],
				tabTitle = tab.querySelector('.attackTable__title'),
				tabItems = tab.querySelectorAll('.attackTable__item'),
				tiCaching = tabItems.length;

			for (let ti = 0; ti < tiCaching; ti++) {
				let item = tabItems[ti];

				item.addEventListener('click', function() {
					if (tab.classList.contains(isActive)) {
						if (!item.classList.contains(noActive)) {
							if (att === 0) {
								attackTableTabs[1].classList.add(isActive);

							} else if (att === 1) {
								tabFirepower = +attackTableTabs[0].getAttribute(nameDataSelected);

								textChance.setAttribute(nameDataResult, attackTable["firepower-" + tabFirepower][ti]["chance"] + '%');
								textDamage.setAttribute(nameDataResult, Math.min.apply(Math, attackTable["firepower-" + tabFirepower][ti]["protection-" + ti]));

								attackTableTabs[2].classList.add(isActive);

							} else {
								tabProtection = +attackTableTabs[1].getAttribute(nameDataSelected);
								tabTotal = attackTable["firepower-" + tabFirepower][tabProtection]["protection-" + tabProtection][ti];

								if (tabTotal > 0 && tabFirepower <= 13) {
									textTotal.textContent = miss[randomInteger(0, miss.length - 1)];

								} else {
									textTotal.textContent = tabTotal;
								};
							};

							att === 0 && ti === 14 ? tabTitle.textContent = 'пехота' : tabTitle.textContent = item.querySelector('span').textContent;
							tab.setAttribute(nameDataSelected, ti);
							changeActiveClass(ti, tabItems);
						};

					} else {
						tab.classList.add(isWarn);
						setTimeout(function() {
							tab.classList.remove(isWarn);
						}, 2000);
					};
				});
			};
		};

		randomBtn.addEventListener('click', function() {
			if (!randomBtn.parentElement.classList.contains(isActive)) {
				randomBtn.parentElement.classList.add(isWarn);
				setTimeout(function() {
					randomBtn.parentElement.classList.remove(isWarn);
				}, 2000);

			} else {
				changeActiveClass(randomInteger(0, ), elements);
			};
		});
	};


	/* Перебор активного класса, между элементами.
		@param {number} number - номер выбранного элемента.
		@param {object} elements - элементы, между которыми будет смена класса. */
	function changeActiveClass(number, elements) {
		let cacCaching = elements.length; // Кэширование длины массива элементов.

		for (let cac = 0; cac < cacCaching; cac++) {
			let el = elements[cac];

			el.classList.remove(isActive);

			if (number === cac) el.classList.add(isActive);
		};
	};

	/* Перебор активного класса, между элементами.
		@param {number} min - минимальное значение.
		@param {number} max - максимальное значение. */
	function randomInteger(min, max) {
		let rand = min + Math.random() * (max + 1 - min);
		return Math.floor(rand);
	};

	/* Показ предупреждения, если не выбран предыдущий этап. */
	function showWarning() {
		
	};


});