"use strict";

document.addEventListener('DOMContentLoaded', function() {

	let jsonUrl = './js/config.json', // Ссылка на файл с конфигурацией игры.
		request = new XMLHttpRequest(), // Создание запроса к файлу.
		isActive = 'is-active', // Класс активации элемента.
		isError = 'is-error', // Класс ошибки выполнения пользователем условия.
		isCompleted = 'is-completed', // Класс завершения выбора первой техники игроком.
		isEnd = 'is-end', // Класс окончания переключения счётчика.
		screens = document.querySelectorAll('.screen'), // Все экраны (секции) игры.
		btnRestart = document.querySelectorAll('.screen__exit'), // Кнопки сброса данной игры на начало.
		startScreenInfo = document.querySelector('.start-screen__is-info'), // Кнопка переключения на экран информации о технике.
		startScreenNext = document.querySelector('.start-screen__is-next'), // Кнопка переключения на экран предварительных настроек игры.
		iSettingsSwitch = document.querySelectorAll('.initial-settings__switch'), // Переключатели месяца и года даты, и выбора процента надбавки ресурсов.
		iSettingsRandom = document.querySelector('.initial-settings__random'), // Кнопка включения рандомной даты.
		iSettingsPlayer = document.querySelectorAll('.initial-settings__player'), // Все поля для имени игрока.
		iSettingsBtn = document.querySelector('.initial-settings__btn'), // Кнопка переключения на следующий шаг первоначальной закупки.
		startArmyTitle = document.querySelector('.starting-army__title'), // Заголовок с именем игрока, который выбирает технику первый раз.
		startArmyDate = document.querySelector('.starting-army__date'), // Дата выбранная в предварительных настройках.
		startArmyTab = document.querySelectorAll('.starting-army__tab'), // Вкладки с техникой, для выбранной стороны игроком.
		startArmyResources = document.querySelector('.starting-army__resources'), // Баланс ресурсов.
		startArmyNextPlayer = document.querySelector('.starting-army__next-player'), // Кнопка переключения очереди первой закупки игроков.
		startArmyCancel = document.querySelector('.starting-army__cancel'), // Кнопка выключающая экран (секцию) подтверждения выбора первой техники.
		globalDate = document.querySelector('.global__date'), // Глобальная дата сражения.
		globalSubtitle = document.querySelector('.global__subtitle'), // Подзаголовок показывающий кто первый, а кто последний.
		globalParam = document.querySelectorAll('.global__param'), // Места для вывода имен очереди.
		globalAttack = document.querySelector('.global__attack'), // Кнопка прехода на стрельбу.
		attackTableBack = document.querySelector('.attack-table__back'), // Кнопка возврата на главный экран со стрельбы.
		attackList = document.querySelectorAll('.attack-table__list'), 
		attackRandomCube = document.querySelector('.attack-table__random-cube'), // Кнопка случайного выбора значения кубика.
		attackChance = document.querySelector('.attack-table__chance'), // Место указывающее какой шанс поражения противника.
		attackDamage = document.querySelector('.attack-table__max-damage'), // Место указывающее какой максимальный урон.
		attackResult = document.querySelector('.attack-table__result'),
		globalBtnShop = document.querySelectorAll('.global__shop'),
		tableSettings = {
			"month": ["X", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"], // Массив обозначения месяца на странице.
			"resources": {
				"step": 5, // Шаг переключения.
				"min": 25, // Минимальная процентная добавка.
				"max": 1000 // Максимальная процентная добавка.
			} // Настройки диапазона и шага ресурсов.
		}, // Таблица данных для предварительных настроек игры.
		miss = ['промах', 'мазила', 'рукожоп', 'мимо'],
		minNumber = 0, // Минимальное постоянное значение.
		minMonth = 4, // Минимальный месяц, если выбран минимальный год (41-ый).
		maxMonth = 5, // Максимальный месяц, если выбран последний год (45-ый).
		currentMonth = minMonth, // Текущий месяц.
		currentYear = minNumber, // Текущий год.
		currentResources = 100, // Текущий процент добавки ресурсов.
		counterPlayer = minNumber, // Количество играющих.
		currentFpower, currentArmor, currentCube, // Выбор огневой мощи, защищенности и что выпало на кубиках, в режиме "стрельба".
		currentFirst, currentSecond, currentLast, // Номера первого, второго и последнего игрока после жеребьевки.
		nextPlayer = true, // Есть ли следующий игрок.
		playerNotLast = true; // Игрорк не последний, если участвуют все три игрока.

	// Кеширование длины массивов элементов.
	let issCaching = iSettingsSwitch.length,
		brCaching = btnRestart.length,
		ispCaching = iSettingsPlayer.length,
		satCaching = startArmyTab.length,
		gpCaching = globalParam.length,
		alCaching = attackList.length,
		gbsCaching = globalBtnShop.length;

	// Получение данных из файла с конфигурацией игры.
	request.open('GET', jsonUrl);
	request.responseType = 'json';
	request.send();
	request.onload = function() {

		// Получение основыных параметров конфигурации.
		const isJSON = request.response, // Полный список всех параметров.
			isTECHNICS = isJSON.TECHNICS, // Параметр всей техники.
			isSHOOTING = isJSON.SHOOTING, // Параметр таблицы стрельбы.
			isRESOURCES = isJSON.RESOURCES, // Параметр таблицы ресурсов.
			isPROGRESS = isJSON.PROGRESS; // Параметр таблицы прогрес баров, в карточках техники.

		// Активация стартового экрана (секции).
		screens[0].classList.add(isActive);

		// Управление кнопкой "начать игру", расположенную на стартовом экране.
		startScreenNext.addEventListener('click', function() {
			switchSections(this);

			localStorage.clear(); // Очистка запомнившихся, в памяти браузера данных, с прошлой игры.
			clearInputPlayer();
		});

		// Управление переключателями, расположенных на экране предваррительных настроек игры.
		for (let iss = 0; iss < issCaching; iss++) {
			let elSwitch = iSettingsSwitch[iss],
				btnPlus = elSwitch.querySelector('.initial-settings__next'), // Кнопка увеличения числа даты.
				btnMinus = elSwitch.querySelector('.initial-settings__prev'), // Кнопка уменьшения числа даты.
				placeText = elSwitch.querySelector('.initial-settings__text span'), // Место вывода числа получившегося.
				boxMonth = iSettingsSwitch[0].querySelector('.initial-settings__text span'); // Блок месяца для корректировки, при изменении года.

			// Переключатель месяца даты.
			if (iss === 0) {
				placeText.textContent = tableSettings.month[currentMonth];

				btnPlus.addEventListener('click', function() {
					if (currentYear === Object.keys(isRESOURCES).length - 1) {
						currentMonth >= maxMonth ? currentMonth = maxMonth : currentMonth++;
						currentMonth > maxMonth && currentMonth < tableSettings.month.length - 1 ? btnMinus.classList.remove(isEnd) : btnPlus.classList.add(isEnd);

					} else {
						currentMonth >= tableSettings.month.length - 1 ? currentMonth = tableSettings.month.length - 1 : currentMonth++;
						currentMonth > 0 && currentMonth < tableSettings.month.length - 1 ? btnMinus.classList.remove(isEnd) : btnPlus.classList.add(isEnd);
					};

					placeText.textContent = tableSettings.month[currentMonth];
				});

				btnMinus.addEventListener('click', function() {
					if (currentYear === 0) {
						currentMonth <= minMonth ? currentMonth = minMonth : currentMonth--;
						currentMonth <= minMonth ? btnMinus.classList.add(isEnd) : btnPlus.classList.remove(isEnd);

					} else {
						currentMonth <= 1 ? currentMonth = 1 : currentMonth--;
						currentMonth <= 1 ? btnMinus.classList.add(isEnd) : btnPlus.classList.remove(isEnd);
					};

					placeText.textContent = tableSettings.month[currentMonth];
				});
			};

			// Переключатель года даты.
			if (iss === 1) {
				placeText.textContent = Object.keys(isRESOURCES)[currentYear];

				btnPlus.addEventListener('click', function() {
					if (currentYear === Object.keys(isRESOURCES).length - 2 && currentMonth > minMonth) {
						currentMonth = maxMonth;
						boxMonth.textContent = tableSettings.month[currentMonth];
						iSettingsSwitch[0].querySelector('.initial-settings__next').classList.add(isEnd);
					};

					currentYear >= Object.keys(isRESOURCES).length - 1 ? currentYear = Object.keys(isRESOURCES).length - 1 : currentYear++;
					currentYear > 0 && currentYear < Object.keys(isRESOURCES).length - 1 ? btnMinus.classList.remove(isEnd) : btnPlus.classList.add(isEnd);
					if (currentYear < Object.keys(isRESOURCES).length - 1 && currentMonth > 1) {
						iSettingsSwitch[0].querySelector('.initial-settings__prev').classList.remove(isEnd);
					};

					placeText.textContent = Object.keys(isRESOURCES)[currentYear];
				});

				btnMinus.addEventListener('click', function() {
					if (currentYear === 1 && currentMonth <= minMonth) {
						currentMonth = minMonth;
						boxMonth.textContent = tableSettings.month[currentMonth];
						iSettingsSwitch[0].querySelector('.initial-settings__prev').classList.add(isEnd);
					};

					currentYear <= 0 ? currentYear = 0 : currentYear--;
					currentYear <= 0 ? btnMinus.classList.add(isEnd) : btnPlus.classList.remove(isEnd);
					if (currentYear < Object.keys(isRESOURCES).length - 1 && currentMonth > 1) {
						iSettingsSwitch[0].querySelector('.initial-settings__next').classList.remove(isEnd);
					};

					placeText.textContent = Object.keys(isRESOURCES)[currentYear];
				});
			};

			// Переключатель ресурсов.
			if (iss === 2) {
				placeText.textContent = currentResources;

				btnPlus.addEventListener('click', function() {
					currentResources >= tableSettings.resources.max ? currentResources = tableSettings.resources.max : currentResources = currentResources + tableSettings.resources.step;
					currentResources >= 0 && currentResources < tableSettings.resources.max ? btnMinus.classList.remove(isEnd) : btnPlus.classList.add(isEnd);

					placeText.textContent = currentResources;
				});

				btnMinus.addEventListener('click', function() {
					currentResources <= tableSettings.resources.min ? currentResources = tableSettings.resources.min : currentResources = currentResources - tableSettings.resources.step;
					currentResources <= 25 ? btnMinus.classList.add(isEnd) : btnPlus.classList.remove(isEnd);

					placeText.textContent = currentResources;
				});
			};
		};

		// Управление кнопкой "выбрать случайную дату", расположенную на экране предваррительных настроек игры.
		iSettingsRandom.addEventListener('click', function() {
			let parentBtn = iSettingsRandom.parentElement, // Блок даты.
				placeMonth = parentBtn.querySelector('.switches__month > .initial-settings__text span'), // Место месяца.
				placeYear = parentBtn.querySelector('.switches__year > .initial-settings__text span'); // Место года.

			currentYear = randomInteger(0, Object.keys(isRESOURCES).length - 1);

			if (currentYear === 0) {
				currentMonth = randomInteger(minMonth, tableSettings.month.length - 1);

			} else if (currentYear === Object.keys(isRESOURCES).length - 1) {
				currentMonth = randomInteger(1, 5);

			} else {
				currentMonth = randomInteger(1, tableSettings.month.length - 1);
			};

			if (currentYear === 0 && currentMonth === minMonth || currentMonth === 1) {
				parentBtn.querySelector('.switches__month > .initial-settings__next').classList.remove(isEnd);
				parentBtn.querySelector('.switches__month > .initial-settings__prev').classList.add(isEnd);

			} else if (currentYear === Object.keys(isRESOURCES).length - 1 && currentMonth === maxMonth || currentMonth === tableSettings.month.length - 1) {
				parentBtn.querySelector('.switches__month > .initial-settings__next').classList.add(isEnd);
				parentBtn.querySelector('.switches__month > .initial-settings__prev').classList.remove(isEnd);

			} else {
				parentBtn.querySelector('.switches__month > .initial-settings__next').classList.remove(isEnd);
				parentBtn.querySelector('.switches__month > .initial-settings__prev').classList.remove(isEnd);
			};

			if (currentYear === 0) {
				parentBtn.querySelector('.switches__year > .initial-settings__next').classList.remove(isEnd);
				parentBtn.querySelector('.switches__year > .initial-settings__prev').classList.add(isEnd);

			} else if (currentYear === Object.keys(isRESOURCES).length - 1) {
				parentBtn.querySelector('.switches__year > .initial-settings__next').classList.add(isEnd);
				parentBtn.querySelector('.switches__year > .initial-settings__prev').classList.remove(isEnd);

			} else {
				parentBtn.querySelector('.switches__year > .initial-settings__next').classList.remove(isEnd);
				parentBtn.querySelector('.switches__year > .initial-settings__prev').classList.remove(isEnd);
			};

			placeMonth.textContent = tableSettings.month[currentMonth];
			placeYear.textContent = Object.keys(isRESOURCES)[currentYear];
		});

		// Управление кнопкой "старт", расположенную на экране предваррительных настроек игры.
		iSettingsBtn.addEventListener('click', function() {
			for (let isp = 0; isp < ispCaching; isp++) {
				let player = iSettingsPlayer[isp];

				// Если не заполнены два первых игрока, вывести предупреждение.
				if (player.value !== '') {
					if (isp === 0 || isp === 1) {
						player.parentElement.classList.remove(isError);
						player.parentElement.parentElement.classList.remove(isError);
					};

				} else {
					if (isp === 0 || isp === 1) {
						player.parentElement.classList.add(isError);
						player.parentElement.parentElement.classList.add(isError);
					};
				}
			};

			// Определение количества игроков, которые будут играть.
			if (iSettingsPlayer[0].value !== '' && iSettingsPlayer[1].value !== '' && iSettingsPlayer[2].value === '') {
				counterPlayer = 1;
				setLocalStorage();

			} else if (iSettingsPlayer[0].value !== '' && iSettingsPlayer[1].value !== '' && iSettingsPlayer[2].value !== '') {
				counterPlayer = 2;
				setLocalStorage();

			} else {
				counterPlayer = 0;
				localStorage.clear();
			};

			// Действия при правильном вводе имен игроков.
			if (counterPlayer === 1 || counterPlayer === 2) {
				let firstQueue = +localStorage.getItem('queue-0'), // Очередь первого игрока.
					secondQueue = +localStorage.getItem('queue-1'), // Очередь второго игрока.
					lastQueue = +localStorage.getItem('queue-2'); // Очередь последнего игрока.

				switchSections(this);
				generationVehicleCards();

				// Оформление экрана (секции) для первого игрока.
				startArmyDate.setAttribute('data-month', tableSettings.month[currentMonth]); // Подстановка месяца сражения.
				globalDate.setAttribute('data-month', tableSettings.month[currentMonth]); // Подстановка месяца сражения.
				startArmyDate.setAttribute('data-year', Object.keys(isRESOURCES)[currentYear]); // Подстановка года сражения.
				globalDate.setAttribute('data-year', Object.keys(isRESOURCES)[currentYear]); // Подстановка года сражения.

				// Установка имени игрока, кто первый в очереди.
				if (counterPlayer === 1) {
					if (firstQueue < secondQueue) {
						startArmyTitle.setAttribute('data-player', localStorage.getItem('player-0'));
						currentFirst = 0;
						currentLast = 1;

					} else {
						startArmyTitle.setAttribute('data-player', localStorage.getItem('player-1'));
						currentFirst = 1;
						currentLast = 0;
					};

				} else if (counterPlayer === 2) {
					if (firstQueue < secondQueue) {
						if (firstQueue < lastQueue) {
							startArmyTitle.setAttribute('data-player', localStorage.getItem('player-0'));
							currentFirst = 0;

							if (secondQueue < lastQueue) {
								currentSecond = 1;
								currentLast = 2;

							} else {
								currentSecond = 2;
								currentLast = 1;
							};

						} else {
							startArmyTitle.setAttribute('data-player', localStorage.getItem('player-2'));
							currentFirst = 2;

							if (secondQueue < firstQueue) {
								currentSecond = 1;
								currentLast = 0;

							} else {
								currentSecond = 0;
								currentLast = 1;
							};
						};

					} else {
						if (secondQueue < lastQueue) {
							startArmyTitle.setAttribute('data-player', localStorage.getItem('player-1'));
							currentFirst = 1;

							if (firstQueue < lastQueue) {
								currentSecond = 0;
								currentLast = 2;

							} else {
								currentSecond = 2;
								currentLast = 0;
							};

						} else {
							startArmyTitle.setAttribute('data-player', localStorage.getItem('player-2'));
							currentFirst = 2;

							if (firstQueue < secondQueue) {
								currentSecond = 0;
								currentLast = 1;

							} else {
								currentSecond = 1;
								currentLast = 0;
							};
						};
					};
				};

				startArmyResources.textContent = localStorage.getItem('money-' + currentFirst); // Подстановка ресурсов.
				
				changeActiveClass(+localStorage.getItem('country-' + currentFirst), startArmyTab); // Открытие вкладки с техникой.
			};
		});

		// Управление кнопкой "готово (ок)", расположенную на экране первого формирования армии.
		startArmyNextPlayer.addEventListener('click', function() {
			// Переход к подтверждению выбора и переход на следующего игрока.
			if (!screens[2].classList.contains(isCompleted)) {
				screens[2].classList.add(isCompleted);
				changeActiveClass(satCaching - 1, startArmyTab);
				if (!nextPlayer) screens[2].classList.add(isEnd);

			} else {
				if (!nextPlayer) {
					localStorage.setItem('money-' + currentLast, startArmyResources.textContent);
					switchSections(this);

					// Установка кто первый, а кто последний.
					globalSubtitle.setAttribute('data-first-player', localStorage.getItem('player-' + currentFirst));
					globalSubtitle.setAttribute('data-last-player', localStorage.getItem('player-' + currentLast));

					// Установка игроков.
					for (let gp = 0; gp < gpCaching; gp++) {
						let gparam = globalParam[gp],
							paramSvg = gparam.querySelector('.global__svg use'),
							paramText = gparam.querySelector('span'), 
							linkSvg = ['#germany', '#ussr', '#allies'],
							classCountry = ['global__param_germany', 'global__param_ussr', 'global__param_allies'];

						if (gp === 0) {
							gparam.classList.add(classCountry[localStorage.getItem('country-' + currentFirst)]);
							gparam.setAttribute('data-base', localStorage.getItem('base-' + currentFirst));
							paramSvg.setAttribute('xlink:href', linkSvg[localStorage.getItem('country-' + currentFirst)]);
							paramText.textContent = localStorage.getItem('player-' + currentFirst);

						} else if (gp === 1) {
							if (counterPlayer === 1) {
								gparam.classList.add(classCountry[localStorage.getItem('country-' + currentLast)]);
								gparam.setAttribute('data-base', localStorage.getItem('base-' + currentLast));
								paramSvg.setAttribute('xlink:href', linkSvg[localStorage.getItem('country-' + currentLast)]);
								paramText.textContent = localStorage.getItem('player-' + currentLast);

							} else if (counterPlayer === 2) {
								gparam.classList.add(classCountry[localStorage.getItem('country-' + currentSecond)]);
								gparam.setAttribute('data-base', localStorage.getItem('base-' + currentSecond));
								paramSvg.setAttribute('xlink:href', linkSvg[localStorage.getItem('country-' + currentSecond)]);
								paramText.textContent = localStorage.getItem('player-' + currentSecond);
							};

						} else {
							if (counterPlayer === 2) {
								gparam.parentElement.classList.add(isActive);
								gparam.classList.add(classCountry[localStorage.getItem('country-' + currentLast)]);
								gparam.setAttribute('data-base', localStorage.getItem('base-' + currentLast));
								paramSvg.setAttribute('xlink:href', linkSvg[classCountry[localStorage.getItem('country-' + currentLast)]]);
								paramText.textContent = localStorage.getItem('player-' + currentLast);
							};
						};
					};

				} else {
					if (counterPlayer === 1) {
						localStorage.setItem('money-' + currentFirst, startArmyResources.textContent);

						// Постановка информации начальной последнего игрока.
						screens[2].classList.remove(isCompleted);
						startArmyTitle.setAttribute('data-player', iSettingsPlayer[currentLast].value);
						startArmyResources.textContent = localStorage.getItem('money-' + currentLast);
						changeActiveClass(+localStorage.getItem('country-' + currentLast), startArmyTab);
						nextPlayer = false;
	
					} else if (counterPlayer === 2) {
						if (playerNotLast) {
							localStorage.setItem('money-' + currentFirst, startArmyResources.textContent);

							// Постановка информации начальной вторго игрока.
							screens[2].classList.remove(isCompleted);
							startArmyTitle.setAttribute('data-player', iSettingsPlayer[currentSecond].value);
							startArmyResources.textContent = localStorage.getItem('money-' + currentSecond);
							changeActiveClass(+localStorage.getItem('country-' + currentSecond), startArmyTab);
							playerNotLast = false;

						} else {
							localStorage.setItem('money-' + currentSecond, startArmyResources.textContent);

							// Постановка информации начальной последнего игрока.
							screens[2].classList.remove(isCompleted);
							startArmyTitle.setAttribute('data-player', iSettingsPlayer[currentLast].value);
							startArmyResources.textContent = localStorage.getItem('money-' + currentLast);
							changeActiveClass(+localStorage.getItem('country-' + currentLast), startArmyTab);
							nextPlayer = false;
						};	
					};
				};

				// Удаление карточек выбранных предыдущим игроком.
				startArmyTab[satCaching - 1].innerHTML = '';
			};
		});

		// Управление кнопкой "я передумал", расположенную на экране первого формирования армии.
		startArmyCancel.addEventListener('click', function() {
			screens[2].classList.remove(isCompleted);
			screens[2].classList.remove(isEnd);

			if (counterPlayer === 1) {
				nextPlayer ? changeActiveClass(+localStorage.getItem('country-' + currentFirst), startArmyTab) : changeActiveClass(+localStorage.getItem('country-' + currentLast), startArmyTab);

			} else if (counterPlayer === 2) {
				if (nextPlayer && playerNotLast) {
					changeActiveClass(+localStorage.getItem('country-' + currentFirst), startArmyTab);
				} else if (nextPlayer && !playerNotLast) {
					changeActiveClass(+localStorage.getItem('country-' + currentSecond), startArmyTab);
				} else if (!nextPlayer && !playerNotLast) {
					changeActiveClass(+localStorage.getItem('country-' + currentLast), startArmyTab);
				};
			};
			// changeActiveClass(+localStorage.getItem('side-' + currentPlayer) - 1, startArmyTab);
		});

		// Управление перезапуском игры.
		for (let br = 0; br < brCaching; br++) {
			let restart = btnRestart[br];

			restart.addEventListener('click', function() {
				localStorage.clear(); // Сброс данных сохранившихся в браузере.
				changeActiveClass(0, screens); // Переключение на стартовый экран.

				setTimeout(function() {
					// Сброс месяца.
					currentMonth = minMonth;
					document.querySelector('.switches__month > .initial-settings__next').classList.remove(isEnd);
					document.querySelector('.switches__month > .initial-settings__text span').textContent = tableSettings.month[currentMonth];
					document.querySelector('.switches__month > .initial-settings__prev').classList.add(isEnd);

					// Сброс года.
					currentYear = 0;
					document.querySelector('.switches__year > .initial-settings__next').classList.remove(isEnd);
					document.querySelector('.switches__year > .initial-settings__text span').textContent = Object.keys(isRESOURCES)[currentYear];
					document.querySelector('.switches__year > .initial-settings__prev').classList.add(isEnd);

					// Сброс бонуса ресурсов.
					currentResources = 100;
					document.querySelector('.switches__resources > .initial-settings__next').classList.remove(isEnd);
					document.querySelector('.switches__resources > .initial-settings__text span').textContent = currentResources;
					document.querySelector('.switches__resources > .initial-settings__prev').classList.remove(isEnd);

					nextPlayer = true;
					playerNotLast = true;
					screens[2].classList.remove(isCompleted);
					screens[2].classList.remove(isEnd);

					clearInputPlayer();

					for (let sat = 0; sat < satCaching; sat++) {
						startArmyTab[sat].innerHTML = '';
					};

					for (let gp = 0; gp < gpCaching; gp++) {
						let gparam = globalParam[gp],
							paramSvg = gparam.querySelector('.global__svg use'),
							paramText = gparam.querySelector('span');
	
						if (gp === 2) gparam.parentElement.classList.remove(isActive);
	
						gparam.className = 'screen__decor global__param';
						gparam.setAttribute('data-base', '?');
						paramSvg.setAttribute('xlink:href', '#');
						paramText.textContent = '';
					};
				}, 500);
			});
		};

		// Управление кнопкой "атаковать", расположенную на главном экране.
		globalAttack.addEventListener('click', function() {
			switchSections(this);
		});

		// Управление кнопкой "назад", расположенную на экране расчёта атаки на протиника.
		attackTableBack.addEventListener('click', function() {
			switchSections(this);
		});

		// Управление разделом "стрельба".
		for (let al = 0; al < alCaching; al++) {
			let list = attackList[al],
				btnList = list.querySelectorAll('.attack-table__buttons'),
				blCaching = btnList.length;

			for (let bl = 0; bl < blCaching; bl++) {
				let btn = btnList[bl],
					listTitle = btn.parentElement.parentElement.querySelector('.attack-table__title span');

				btn.addEventListener('click', function() {
					if (list.classList.contains(isActive)) {
						if (!btn.classList.contains('attack-table__buttons_close')) {
							changeActiveClass(bl, btnList);
							if (al !== 2) {
								attackList[al + 1].classList.add(isActive);
								attackList[al + 1].parentElement.classList.add(isActive);
							};

							listTitle.textContent = bl;

							if (al === 0) {
								currentFpower = bl;
								if (bl === 14) listTitle.textContent = 'пехота';

							} else if (al === 1) {
								currentArmor = bl;
								if (bl === 17) listTitle.textContent = bl + 5;

								attackChance.setAttribute('data-chance', isSHOOTING['firepower-' + currentFpower]['armor-' + currentArmor].chance);
								attackDamage.setAttribute('data-damage', Math.min.apply(Math, isSHOOTING['firepower-' + currentFpower]['armor-' + currentArmor]['cube']));

							} else {
								currentCube = bl;
								listTitle.textContent = bl + 2;

								let totalResult = isSHOOTING['firepower-' + currentFpower]['armor-' + currentArmor]['cube'][currentCube];

								if (totalResult > 0 && totalResult !== 66 && totalResult !== 77 && totalResult !== 99) {
									attackResult.textContent = miss[randomInteger(0, miss.length - 1)];

								} else if (totalResult === 66) {
									attackResult.textContent = 'пехота убита';

								} else if (totalResult === 77) {
									attackResult.textContent = 'убит противник';

								} else if (totalResult === 99) {
									attackResult.textContent = 'оба скопытились';

								} else {
									attackResult.textContent = totalResult;
								};
							};

						};

					} else {
						showErrorAttack(list);
					};
				});
			};
		};

		// Управление кнопкой "случайное число", расположенную на экране расчёта атаки на протиника.
		attackRandomCube.addEventListener('click', function() {
			if (attackRandomCube.parentElement.classList.contains(isActive)) {
				currentCube = randomInteger(0, 10);

				let totalResult = isSHOOTING['firepower-' + currentFpower]['armor-' + currentArmor]['cube'][currentCube];

				changeActiveClass(currentCube, attackRandomCube.parentElement.querySelectorAll('.attack-table__buttons'))
				attackRandomCube.parentElement.querySelector('.attack-table__title span').textContent = currentCube + 2;


				if (totalResult > 0 && totalResult !== 66 && totalResult !== 77 && totalResult !== 99) {
					attackResult.textContent = miss[randomInteger(0, miss.length - 1)];

				} else if (totalResult === 66) {
					attackResult.textContent = 'пехота убита';

				} else if (totalResult === 77) {
					attackResult.textContent = 'убит противник';

				} else if (totalResult === 99) {
					attackResult.textContent = 'оба скопытились';

				} else {
					attackResult.textContent = totalResult;
				};

			} else {
				showErrorAttack(attackRandomCube.parentElement.querySelector('.attack-table__list'));
			};
		});

		// Кнопки запуска магазина.
		for (let gbs = 0; gbs < globalBtnShop.length; gbs++) {
			let btnShop = globalBtnShop[gbs];

			btnShop.addEventListener('click', function() {
				for (let sat = 0; sat < satCaching; sat++) {
					startArmyTab[sat].innerHTML = '';
				};

				generationVehicleCards();

				screens[2].classList.remove(isCompleted);
				screens[2].classList.remove(isEnd);
				screens[2].classList.add('is-shop');

				changeActiveClass(+localStorage.getItem('country-' + gbs), startArmyTab);
				switchSections(this);
			});
		};

		/* Ошипка выбора варианта на стрельбе.
			@param {object} list - где была выбор, который еще не открыт. */
		function showErrorAttack(list) {
			list.classList.add(isError);

			setTimeout(function() {
				list.classList.remove(isError);
			}, 1500);
		};

		/* Запоминание в памяти браузера. */
		function setLocalStorage() {
			let totalResources = Math.round((isRESOURCES[Object.keys(isRESOURCES)[currentYear]][currentMonth]*currentResources)/100), // Получаемые ресурсы с учётом выбранного бонуса к ним.
				countryPositions = [0, 1, 2], // Доступные позиции для выбора страны.
				queuePositions = [2, 0, 1], // Доступные позиции для выбора очереди.
				basePositions = [1, 2, 3]; // Доступные позиции для выбора базы.

			// Дополнительно перемешиваем варианты.
			shuffle(countryPositions);
			shuffle(queuePositions);
			shuffle(basePositions);

			for (let sls = 0; sls <= counterPlayer; sls++) {
				let country = randomInteger(0, countryPositions.length - 1), // Какая страна будет, у первого игрока.
					queue = randomInteger(0, queuePositions.length - 1), // Какая позиция в очереди будет, у первого игрока.
					base = randomInteger(0, basePositions.length - 1); // Какая база старта будет, у первого игрока.

				// Имя (никнейм) играющего.
				localStorage.setItem('player-' + sls, iSettingsPlayer[sls].value);

				// Получаемые ресурсы с учётом бонуса выбранного.
				localStorage.setItem('money-' + sls, totalResources);

				// За какую страну будет играть.
				localStorage.setItem('country-' + sls, countryPositions[country]);
				countryPositions.splice(country, 1);

				// Какой будет в очереди.
				localStorage.setItem('queue-' + sls, queuePositions[queue]);
				queuePositions.splice(queue, 1);

				// На какой базе будет стартовать.
				localStorage.setItem('base-' + sls, basePositions[base]);
				basePositions.splice(base, 1);
			};
		};

		/* Перемешивание массива. */
		function shuffle(array) {
			for (let i = array.length - 1; i > 0; i--) {
				let j = Math.floor(Math.random() * (i + 1));
				[array[i], array[j]] = [array[j], array[i]];
			};
		};

		/* Очиистка полей для ввода имён при сбросе на начало. */
		function clearInputPlayer() {
			for (let cip = 0; cip < ispCaching; cip++) {
				iSettingsPlayer[cip].value = '';
			};
		};

		/* Генерация карточек техники. */
		function generationVehicleCards() {
			for (let it = 0; it < Object.keys(isTECHNICS).length; it++) {
				let side = Object.keys(isTECHNICS)[it]; // Сторона (страна), учавствующая в сражении.

				for (let ts = 0; ts < Object.keys(isTECHNICS[side]).length; ts++) {
					let nameTechnics = Object.keys(isTECHNICS[side])[ts], // Назание техники, у той или иной стороны.
						parameter = isTECHNICS[side][nameTechnics], // Выбор параметра техники.
						tabItem = document.createElement('li'), // Создание блока карточки техники.
						progressMobility = Math.round((isPROGRESS.mobility[parameter.speed]*100)/isPROGRESS.mobility[isPROGRESS.mobility.length - 1]), // Прогрес бар на "подвижность".
						progressFpower = Math.round((((parameter.range/6)*isPROGRESS.firepower[parameter.fpower])*100)/780), // Прогрес бар на "вооружение".
						progressArmor, // Прогрес бар на "живучесть".
						totalProductStart = (+parameter.dateStart.year*12) + +parameter.dateStart.month, // Перевод в месяца, дату начала производства техники.
						totalProductCurent = (+Object.keys(isRESOURCES)[currentYear]*12) + currentMonth, // Перевод в месяца, дату сражения.
						totalProductEnd = (+parameter.dateEnd.year*12) + +parameter.dateEnd.month, // Перевод в месяца, дату конца производства техники.
						typeItem, // Тип техники.
						productionItem, isOld; // Есть ли производство техники.

					// Корректировка парамтра.
					+parameter.armor === 22 ? progressArmor = Math.round((((parameter.hp/3)*isPROGRESS.armor[parameter.armor - 5])*100)/1100) : progressArmor = Math.round((((parameter.hp/3)*isPROGRESS.armor[parameter.armor])*100)/1100);

					// Общие классы карточки.
					tabItem.classList.add('screen__decor', 'starting-army__box');

					// Определение танков.
					if (parameter.type === 1 && parameter.weight === 1) typeItem = 'Лёгкий танк';
					if (parameter.type === 1 && parameter.weight === 2) typeItem = 'Средний танк';
					if (parameter.type === 1 && parameter.weight === 3) typeItem = 'Тяжёлый танк';

					// Определение ПТ-САУ.
					if (parameter.type === 2 && parameter.weight === 1) typeItem = 'Лёгкая ПТ-САУ';
					if (parameter.type === 2 && parameter.weight === 2) typeItem = 'Средняя ПТ-САУ';
					if (parameter.type === 2 && parameter.weight === 3) typeItem = 'Тяжёлая ПТ-САУ';

					// Определения выпускается ещё техника или нет.
					if (totalProductStart < totalProductCurent) {
						if (totalProductEnd >= (totalProductCurent - 5)) {
							if (totalProductEnd <= (totalProductCurent - 1)) {
								productionItem = 'starting-army__type_old';
								tabItem.classList.add('is-old');
							};
						};
					};

					// Html-разметка карточки. 
					tabItem.innerHTML = `
						<div class="starting-army__card">
							<picture class="starting-army__picture">
								<!-- <source srcset="" type="image/webp">  -->
								<img class="starting-army__image" src="${parameter.images}">
								<h3 class="starting-army__name">${nameTechnics}</h3>
								<p class="starting-army__cost">${parameter.cost}</p>
							</picture>
							<ul class="starting-army__progress">
								<li class="screen__decor starting-army__item" data-progress="Подвижность"><span class="starting-army__line" data-color="${progressMobility}" style="width: ${progressMobility}%;"></span></li>
								<li class="screen__decor starting-army__item" data-progress="Вооружение"><span class="starting-army__line" data-color="${progressFpower}" style="width: ${progressFpower}%;"></span></li>
								<li class="screen__decor starting-army__item" data-progress="Живучесть"><span class="starting-army__line" data-color="${progressArmor}" style="width: ${progressArmor}%;"></span></li>
							</ul>
							<p class="starting-army__type ${productionItem}">${typeItem}</p>
							<div class="starting-army__footer">
								<ul class="starting-army__params">
									<li class="starting-army__param" data-quantity="${parameter.speed}"><svg class="starting-army__svg"><use xlink:href="#speed"></use></svg></li>
									<li class="starting-army__param" data-quantity="${parameter.range}"><svg class="starting-army__svg"><use xlink:href="#range"></use></svg></li>
									<li class="starting-army__param" data-quantity="${parameter.hp}"><svg class="starting-army__svg"><use xlink:href="#hp"></use></svg></li>
									<li class="starting-army__param" data-quantity="${parameter.fpower}"><svg class="starting-army__svg" fill="#E8432A"><use xlink:href="#fpower"></use></svg></li>
									<li class="starting-army__param" data-quantity="${parameter.armor}"><svg class="starting-army__svg" fill="#E8432A"><use xlink:href="#armor"></use></svg></li>
								</ul>
								<div class="starting-army__counter">
									<button class="screen__button screen__button_action starting-army__btn starting-army__countMinus is-end"><span>-</span></button>
									<p class="starting-army__number">0</p>
									<button class="screen__button screen__button_action starting-army__btn starting-army__countPlus"><span>+</span></button>
								</div>
							</div>
						</div>
					`;

					// Установка карточки в блок - кто на вооружении.
					if (totalProductEnd >= totalProductCurent) {
						if (totalProductStart <= totalProductCurent) {
							startArmyTab[it].appendChild(tabItem);
						};
					};

					// Установка карточки в блок - кто снят с производства.
					if (totalProductStart < totalProductCurent) {
						if (totalProductEnd >= (totalProductCurent - 5)) {
							if (totalProductEnd <= (totalProductCurent - 1)) {
								startArmyTab[it].appendChild(tabItem);
							};
						};
					};

				};
			};

			let startArmyCounter = document.querySelectorAll('.starting-army__counter'), // Панель кнопок выбора количества техники.
				sacCaching = startArmyCounter.length;

			for (let sac = 0; sac < sacCaching; sac++) {
				let saCounter = startArmyCounter[sac],
					saPlus = saCounter.querySelector('.starting-army__countPlus'), // Кнопка увеличения количества.
					saMinus = saCounter.querySelector('.starting-army__countMinus'), // Кнопка уменьшения количества.
					saText = saCounter.querySelector('.starting-army__number'), // Текст количества выбранной техники.
					saCard = saCounter.parentElement.parentElement.parentElement, // Карточка техники.
					saPrice = +saCard.querySelector('.starting-army__cost').textContent, // Цена техники.
					clonedCard = false, // Была ли копирована карточка.
					isCloned, // Клонированая карточка.
					currentCount = 0, // Количество техники выбрано.
					countBuy; // Сколько раз можно купить ту или иную технику.

				saPlus.addEventListener('click', function() {
					// Блокировка кнопки, при невозможности покупки техники.
					countBuy = Math.floor(+startArmyResources.textContent/saPrice);

					if (countBuy <= 1) {
						saPlus.classList.add(isEnd);
						countBuy = 1;
					};

					if (!screens[2].classList.contains('is-shop') && +startArmyResources.textContent - saPrice > 0) {
						currentCount >= 999 ? currentCount = 999 : currentCount++;
						saText.textContent = currentCount;

						startArmyResources.textContent = +startArmyResources.textContent - saPrice;

						// Клонирование карточки.
						if (currentCount === 1 && !clonedCard) {
							isCloned = saCard.cloneNode(true);
							isCloned.classList.add('card-clone');
							isCloned.setAttribute('data-id', sac);

							startArmyTab[satCaching - 1].appendChild(isCloned);
							clonedCard = true;
						};

						// Установка количества копий.
						if (currentCount > 1) {
							document.querySelector('[data-id="' + sac +'"]').classList.add('not-one-card');
							document.querySelector('[data-id="' + sac +'"]').querySelector('.starting-army__picture').setAttribute('data-card-count', currentCount);

						} else if (currentCount > 0) {
							saMinus.classList.remove(isEnd);
						};
					};
				});

				saMinus.addEventListener('click', function() {
					if (currentCount <= 0) {
						currentCount = 0;

					} else {
						currentCount--;
						saText.textContent = currentCount;

						if (currentCount < 1) saMinus.classList.add(isEnd);

						if (!screens[2].classList.contains('is-shop')) {
							startArmyResources.textContent = +startArmyResources.textContent + saPrice;
						}

						countBuy = Math.floor(+startArmyResources.textContent/saPrice);
						if (countBuy > 0) saPlus.classList.remove(isEnd);

						// Удаление карточки.
						if (currentCount === 0 && clonedCard) {
							document.querySelector('[data-id="' + sac +'"]').remove();
							clonedCard = false;
						};

						// Удаление счётчика копий.
						if (currentCount === 1) {
							document.querySelector('[data-id="' + sac +'"]').classList.remove('not-one-card');
							document.querySelector('[data-id="' + sac +'"]').querySelector('.starting-army__picture').setAttribute('data-card-count', currentCount);
						};
					};
				});
			};
		};

		/* Получение рандомного числа из минимального и максимального значения.
			@param {number} min - минимальное значение.
			@param {number} max - максимальное значение. */
		function randomInteger(min, max) {
			let rand = min + Math.random() * (max + 1 - min);
			return Math.floor(rand);
		};

		/* Переключение экранов (секций).
			@param {object} el - эелемент, активируеммый функцию.*/
		function switchSections(el) {
			let numberSection = el.getAttribute('data-switch');

			if (numberSection !== '') changeActiveClass(+numberSection, screens);
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

	};
});