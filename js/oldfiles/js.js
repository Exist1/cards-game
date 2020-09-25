"use strict";

document.addEventListener('DOMContentLoaded', function() {

	let requestURL = './js/config.json', // https://github.com/Exist1/card-tanks/blob/master/js/config.json
		request = new XMLHttpRequest(),
		sections = document.querySelectorAll('.screen'),
		startGameSwitches = document.querySelectorAll('.initial-settings__switch'),
		btnRandomDate = document.querySelector('.initial-settings__random'),
		playerInputs = document.querySelectorAll('.initial-settings__player'),
		armyStartTitle = document.querySelector('.starting-army__title'),
		armyStartDate = document.querySelector('.starting-army__date'),
		armyTabs = document.querySelectorAll('.starting-army__tab'),
		isActive = 'is-active',
		isError = 'is-error',
		minMonth = 3, // Минимальный месяц при минимальном годе.
		listSettings = {
			"months": ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
			"resources": {
				"step": 5,
				"min": 25,
				"max": 1000
			}
		},
		currentMonth = minMonth,
		currentYear = 0,
		currentResources = 100,
		currentPlayer = 0,
		switchSections = true;

	const ssCaching = sections.length,
		sgsCaching = startGameSwitches.length,
		pisCaching = playerInputs.length

	request.open('GET', requestURL);
	request.responseType = 'json';
	request.send();

	request.onload = function() {
		const isConfig = request.response,
			isTechnics = isConfig.TECHNICS,
			isShooting = isConfig.SHOOTING,
			isResources = isConfig.RESOURCES,
			isProgress = isConfig.PROGRESS;

		// Управление секциями.
		for (let ss = 0; ss < ssCaching; ss++) {
			let section = sections[ss],
				btnNextSection = section.querySelectorAll('[data-switch]');

			let bnsCaching = btnNextSection.length;

			if (ss === 0) section.classList.add(isActive);

			// Управление кнопками переключения на другие секции.
			for (let bns = 0; bns < bnsCaching; bns++) {
				let btnNext = btnNextSection[bns];

				btnNext.addEventListener('click', function() {
					let numberSection = btnNext.getAttribute('data-switch');

					if (numberSection !== "" && switchSections) changeActiveClass(+numberSection, sections);

					if (ss === 0) {
						if (bns === 1) {
							switchSections = false;
							localStorage.clear();
						};

					} else if (ss === 1) {
						let playerSide = randomInteger(1, 3);

						for (let pis = 0; pis < pisCaching; pis++) {
							let player = playerInputs[pis],
								playerMoney = Math.round((isResources[Object.keys(isResources)[currentYear].toString()][currentMonth]*currentResources)/100);

							if (player.value === "" && pis !== pisCaching - 1) {
								player.parentElement.parentElement.classList.add(isError);
								player.parentElement.classList.add(isError);

							} else if (player.value !== "" && pis !== pisCaching - 1) {
								player.parentElement.parentElement.classList.remove(isError);
								player.parentElement.classList.remove(isError);

								if (playerInputs[0].value && playerInputs[1].value !== "") {
									switchSections = true;
									changeActiveClass(+numberSection, sections);
									changeActiveClass(+localStorage.getItem('side-' + currentPlayer) - 1, armyTabs);
								};
							};

							if (player.value !== "") {
								localStorage.setItem('player-' + pis, player.value);
								localStorage.setItem('money-' + pis, playerMoney);

								if (playerSide === 1) {
									localStorage.setItem('side-0', playerSide);
									localStorage.setItem('side-1', playerSide + 2);

									if (playerInputs[2].value !== "") localStorage.setItem('side-2', playerSide + 1);

								} else if (playerSide === 2) {
									localStorage.setItem('side-0', playerSide);
									localStorage.setItem('side-1', playerSide + 1);

									if (playerInputs[2].value !== "") localStorage.setItem('side-2', playerSide - 1);

								} else if (playerSide === 3) {
									localStorage.setItem('side-0', playerSide);
									localStorage.setItem('side-1', playerSide - 2);

									if (playerInputs[2].value !== "") localStorage.setItem('side-2', playerSide - 1);
								};
							};
						};

						generationVehicleCards(true, armyTabs);
						armyStartTitle.setAttribute('data-player', localStorage.getItem('player-' + currentPlayer));
						armyStartDate.setAttribute('data-month', listSettings.months[currentMonth]);
						armyStartDate.setAttribute('data-year', Object.keys(isResources)[currentYear]);
					};
				});
			};
		};

		// Управление датой и коэфициентом выдаваемых ресурсов.
		for (let sgs = 0; sgs < sgsCaching; sgs++) {
			let sgSwitch = startGameSwitches[sgs],
				btnPlus = sgSwitch.querySelector('.initial-settings__next'),
				sgText = sgSwitch.querySelector('.initial-settings__text span'),
				btnMinus = sgSwitch.querySelector('.initial-settings__prev');
	
			// Расстановка значений по умолчанию.
			if (sgs === 0) {
				sgText.textContent = listSettings.months[currentMonth];
	
			} else if (sgs === 1) {
				sgText.textContent = Object.keys(isResources)[currentYear];
	
			} else {
				sgText.textContent = currentResources;
			};
	
			btnPlus.addEventListener('click', function() {
				if (sgs === 0) {
					if (currentYear === Object.keys(isResources).length - 1) {
						currentMonth >= minMonth ? currentMonth = minMonth : currentMonth++;
					} else {
						currentMonth >= listSettings.months.length - 1 ? currentMonth = listSettings.months.length - 1 : currentMonth++;
					};
					
					sgText.textContent = listSettings.months[currentMonth];
	
				} else if (sgs === 1) {
					if (currentYear === Object.keys(isResources).length - 2 && currentMonth > minMonth) {
						currentMonth = minMonth;
						startGameSwitches[0].querySelector('.initial-settings__text span').textContent = listSettings.months[minMonth];
					};
	
					currentYear >= Object.keys(isResources).length - 1 ? currentYear = Object.keys(isResources).length - 1 : currentYear++;
					sgText.textContent = Object.keys(isResources)[currentYear];
	
				} else {
					currentResources >= listSettings.resources.max ? currentResources = listSettings.resources.max : currentResources = currentResources + listSettings.resources.step;
	
					sgText.textContent = currentResources;
				};
			});
	
			btnMinus.addEventListener('click', function() {
				if (sgs === 0) {
					if (currentYear === 0) {
						currentMonth <= listSettings.months.length - 9 ? currentMonth = listSettings.months.length - 9 : currentMonth--;
					} else {
						currentMonth <= 0 ? currentMonth = 0 : currentMonth--;
					};
					
					sgText.textContent = listSettings.months[currentMonth];
	
				} else if (sgs === 1) {
					if (currentYear === 1 && currentMonth < listSettings.months.length - 9) {
						currentMonth = listSettings.months.length - 9;
						startGameSwitches[0].querySelector('.initial-settings__text span').textContent = listSettings.months[listSettings.months.length - 9];
					};
	
					currentYear <= 0 ? currentYear = 0 : currentYear--;
					sgText.textContent = Object.keys(isResources)[currentYear];
	
				} else {
					currentResources <= listSettings.resources.min ? currentResources = listSettings.resources.min : currentResources = currentResources - listSettings.resources.step;
	
					sgText.textContent = currentResources; 
				};
			});
		};
	
		// Постановка рандомной даты сражения.
		btnRandomDate.addEventListener('click', function() {
			currentYear = randomInteger(0, Object.keys(isResources).length - 1);
	
			if (currentYear === 0) {
				currentMonth = randomInteger(minMonth, listSettings.months.length - 1);
	
			} else if (currentYear === Object.keys(isResources).length - 1) {
				currentMonth = randomInteger(0, minMonth);
	
			} else {
				currentMonth = randomInteger(0, listSettings.months.length - 1);
			};
	
			startGameSwitches[0].querySelector('.initial-settings__text span').textContent = listSettings.months[currentMonth];
			startGameSwitches[1].querySelector('.initial-settings__text span').textContent = Object.keys(isResources)[currentYear];
		});


		/* Генерация карточек техники.
			@param {boolean} outProduction - генерация карточек, которые сняты с производства.
			@param {object} placeCards - место вставки сгенерированных карточек техники. */
		function generationVehicleCards(outProduction, placeCards) {
			let minStartMonth = currentMonth,
				minStartYear = currentYear;

			// Получение даты, на 5 месяцев ранее, выбранной даты.
			if (outProduction) {
				if (currentMonth - 5 < 0) {
					if (currentYear === 0) {
						currentMonth <= minMonth ? minStartMonth = minMonth : minStartMonth = listSettings.months.length + (currentMonth - 5);
						minStartYear = 0;
					} else {
						minStartMonth = listSettings.months.length + (currentMonth - 5);
						minStartYear = currentYear - 1;
					};

				} else {
					minStartMonth = currentMonth - 5;
				};
			};

			for (let lss = 0; lss < Object.keys(isTechnics).length; lss++) {
				let side = Object.keys(isTechnics)[lss]; // Определение стороны техники.

				for (let ts = 0; ts < Object.keys(isTechnics[side]).length; ts++) {
					let technics = Object.keys(isTechnics[side])[ts], // Имя техники, выбранной стороны.
						parameter = isTechnics[side][technics], // Выбор параметра техники.
						tabItem = document.createElement('li'), // Создание блока карточки техники.
						progressMobility = Math.round((isProgress.mobility[parameter.speed]*100)/isProgress.mobility[isProgress.mobility.length - 1]), // Прогрес бар на "подвижность".
						progressFpower = Math.round((((parameter.range/6)*isProgress.firepower[parameter.fpower])*100)/780), // Прогрес бар на "вооружение".
						progressArmor = Math.round((((parameter.hp/3)*isProgress.armor[parameter.armor])*100)/1100); // Прогрес бар на "живучесть".

					if (parameter.dateStart.month >= minStartMonth + 1 && parameter.dateStart.year >= +Object.keys(isResources)[minStartYear]) {
						// Общие классы карточки.
						tabItem.classList.add('screen__decor', 'starting-army__box');

						// Разбор по типу техники.
						// if (parameter.type === 1) {
						// 	tabItem.classList.add('army-formation__item_tank');
						// } else if (parameter.type === 2) {
						// 	tabItem.classList.add('army-formation__item_pt-sau');
						// };

						// Html-разметка карточки. 
						tabItem.innerHTML = `
							<div class="starting-army__card">
								<picture class="starting-army__picture">
									<!-- <source srcset="" type="image/webp"> -->
									<img class="starting-army__image" src="${parameter.images}">
									<h3 class="starting-army__name">${technics}</h3>
									<p class="starting-army__cost">${parameter.cost}</p>
								</picture>
								<ul class="starting-army__progress">
									<li class="screen__decor starting-army__item" data-progress="Подвижность"><span class="starting-army__line starting-army__line_speed" style="width: ${progressMobility}%;"></span></li>
									<li class="screen__decor starting-army__item" data-progress="Вооружение"><span class="starting-army__line starting-army__line_power" style="width: ${progressFpower}%;"></span></li>
									<li class="screen__decor starting-army__item" data-progress="Живучесть"><span class="starting-army__line starting-army__line_hp" style="width: ${progressArmor}%;"></span></li>
								</ul>
								<p class="starting-army__type">%type%</p>
								<div class="starting-army__footer">
									<ul class="starting-army__params">
										<li class="starting-army__param" data-quantity="${parameter.speed}"><svg class="starting-army__svg"><use xlink:href="#speed"></use></svg></li>
										<li class="starting-army__param" data-quantity="${parameter.range}"><svg class="starting-army__svg"><use xlink:href="#range"></use></svg></li>
										<li class="starting-army__param" data-quantity="${parameter.hp}"><svg class="starting-army__svg"><use xlink:href="#hp"></use></svg></li>
										<li class="starting-army__param" data-quantity="${parameter.fpower}"><svg class="starting-army__svg"><use xlink:href="#fpower"></use></svg></li>
										<li class="starting-army__param" data-quantity="${parameter.armor}"><svg class="starting-army__svg"><use xlink:href="#armor"></use></svg></li>
									</ul>
									<div class="starting-army__counter">
										<button class="screen__button screen__button_action starting-army__btn starting-army__countMinus is-end"><span>-</span></button>
										<p class="starting-army__number">0</p>
										<button class="screen__button screen__button_action starting-army__btn starting-army__countPlus"><span>+</span></button>
									</div>
								</div>
							</div>
						`;

						placeCards[lss].appendChild(tabItem);
					};
				};
			};
		};

	};


	/* Получение рандомного числа из минимального и максимального значения.
		@param {number} min - минимальное значение.
		@param {number} max - максимальное значение. */
	function randomInteger(min, max) {
		let rand = min + Math.random() * (max + 1 - min);
		return Math.floor(rand);
	};

	/* Ленивая загрузка изображений в секции.
		@param {object} section - секция (раздел) где нужно прогрузить картинки. */
	function lazyLoad(section) {
		let images = section.querySelectorAll('[data-src]'),
			isCaching = images.length;

		for (let is = 0; is < isCaching; is++) {
			let image = images[is],
				imageUrl = image.getAttribute('data-src');

			image.style.backgroundImage = "url('" + imageUrl + "')";
			image.removeAttribute('data-src');
		};
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

});