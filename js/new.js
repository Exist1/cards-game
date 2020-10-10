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
		globalAttack = document.querySelectorAll('.global__attack'), // Кнопки прехода на стрельбу.
		globalTechnics = document.querySelectorAll('.global__technics'), // Кнопки прехода на стрельбу.
		globalBtnShop = document.querySelectorAll('.global__shop'),
		globalPrestigePoints = document.querySelectorAll('.global__prestige-points'), // Награды.
		shootingWrap = document.querySelector('.shooting__wrap'), // Раздел стрельбы.
		shootingArticle = document.querySelectorAll('.shooting__article'), // Разделы выбора параметра для атаки.
		btnBack = document.querySelectorAll('.shooting__back'), // Кнопка назад в разделе стрельбы.
		shootingText = document.querySelectorAll('.shooting__text'), // Место информации шанса и саксимального урона.
		shootingResult = document.querySelector('.shooting__result'), // Место итогово результата стрельбы.
		shootingRandom = document.querySelector('.shooting__random'), // Кнопка выбора случайного числа кубика.
		shootingBtn = document.querySelectorAll('.shooting__btn'), // Кнопки переключения шага выбора параметров стрельбы.
		infoTab = document.querySelectorAll('.info__tab'), // Все параметры сортировки в разделе информации.
		infoList = document.querySelector('.info__list'), // Список всей техники в разделе информации.
		tableSettings = {
			"month": ["X", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"], // Массив обозначения месяца на странице.
			"resources": {
				"step": 5, // Шаг переключения.
				"min": 25, // Минимальная процентная добавка.
				"max": 1000 // Максимальная процентная добавка.
			} // Настройки диапазона и шага ресурсов.
		}, // Таблица данных для предварительных настроек игры.
		miss = ['промах', 'мазила', 'рукожоп', 'мимо', 'каак, карл?'],
		minNumber = 0, // Минимальное постоянное значение.
		minMonth = 4, // Минимальный месяц, если выбран минимальный год (41-ый).
		maxMonth = 5, // Максимальный месяц, если выбран последний год (45-ый).
		currentMonth = minMonth, // Текущий месяц.
		currentYear = minNumber, // Текущий год.
		currentResources = 100, // Текущий процент добавки ресурсов.
		counterPlayer = minNumber, // Количество играющих.
		currentFpower = '', // Выбор огневой мощи.
		currentArmor = '', // Выбор защищенности.
		currentCube = '', // Выбор что выпало на кубиках, в режиме "стрельба".
		currentFirst, currentSecond, currentLast, // Номера первого, второго и последнего игрока после жеребьевки.
		nextPlayer = true, // Есть ли следующий игрок.
		playerNotLast = true, // Игрорк не последний, если участвуют все три игрока.
		numberShop, // Номер игрока, зашедшего в магазин.
		classStep = 'shooting__step-', // Класс шага.
		counterStep = 0, // Счётчик шага.
		currentInfoTab = 0, // Номер выбранного пункта сортировки таблицы.
		targetAttr = 'data-sort'; // Ориентировочное название атрибута для сортировки списка.

	// Кеширование длины массивов элементов.
	let issCaching = iSettingsSwitch.length,
		brCaching = btnRestart.length,
		ispCaching = iSettingsPlayer.length,
		satCaching = startArmyTab.length,
		gpCaching = globalParam.length,
		gbsCaching = globalBtnShop.length,
		gppCaching = globalPrestigePoints.length,
		saCaching = shootingArticle.length,
		sbCaching = shootingBtn.length,
		gaCaching = globalAttack.length,
		gtCaching = globalTechnics.length,
		bbCaching = btnBack.length,
		itCaching = infoTab.length;

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

		// Управление кнопкой "информация", расположенную на стартовом экране.
		startScreenInfo.addEventListener('click', function() {
			screens[0].classList.toggle('is-info');
		});

		// Управление кнопкой "начать игру", расположенную на стартовом экране.
		startScreenNext.addEventListener('click', function() {
			switchSections(this);

			localStorage.clear(); // Очистка запомнившихся, в памяти браузера данных, с прошлой игры.
			clearInputPlayer();

			shootingWrap.className = 'screen__wrap shooting__wrap shooting__step-0';
			counterStep = 0;
			changeActiveClass(counterStep, shootingArticle);

			for (let sa = 0; sa < saCaching; sa++) {
				let shArticle = shootingArticle[sa],
					articleTitle = shArticle.querySelector('.shooting__title span'), // Место вывода результата выбранного.
					articleItem = shArticle.querySelectorAll('.shooting__item'); // Кнопки выбора параметра для атаки.

				articleTitle.textContent = '?';

				for (let ai = 0; ai < articleItem.length; ai++) {
					let aItem = articleItem[ai];

					aItem.classList.remove(isActive);
				};
			};

			shootingBtn[0].classList.add(isEnd);
			shootingBtn[1].classList.add(isEnd);

			shootingText[0].setAttribute('data-info', 0);
			shootingText[1].setAttribute('data-info', 0);

			shootingResult.style.color = '#fbfbfb';
			shootingResult.textContent = '?';

			currentFpower = '';
			currentArmor = '';
			currentCube = '';
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
				generationVehicleCards(false);

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

				// Определение наград.
				for (let gpp = 0; gpp < gppCaching; gpp++) {
					let prestigePoint = globalPrestigePoints[gpp],
					perCircle = Math.round(isRESOURCES[Object.keys(isRESOURCES)[currentYear]][currentMonth]/25), // Расчёт за круг.
					perFlag = Math.round(isRESOURCES[Object.keys(isRESOURCES)[currentYear]][currentMonth]/50); // Расчёт за флаг.

					gpp === 0 ? prestigePoint.textContent = perCircle : prestigePoint.textContent = perFlag;
				};
			};
		});

		// Управление кнопкой "готово (ок)", расположенную на экране первого формирования армии.
		startArmyNextPlayer.addEventListener('click', function() {
			// Переход к подтверждению выбора и переход на следующего игрока.
			if (!screens[2].classList.contains(isCompleted)) {
				screens[2].classList.add(isCompleted);
				changeActiveClass(satCaching - 1, startArmyTab);
				if (!nextPlayer || screens[2].classList.contains('is-shop')) screens[2].classList.add(isEnd);

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
								paramSvg.setAttribute('xlink:href', linkSvg[localStorage.getItem('country-' + currentLast)]);
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

			if (!screens[2].classList.contains('is-shop')) {
				if (counterPlayer === 1) {
					if (nextPlayer) {
						changeActiveClass(+localStorage.getItem('country-' + currentFirst), startArmyTab);
					} else {
						changeActiveClass(+localStorage.getItem('country-' + currentLast), startArmyTab);
					};
	
				} else if (counterPlayer === 2) {
					if (nextPlayer && playerNotLast) {
						changeActiveClass(+localStorage.getItem('country-' + currentFirst), startArmyTab);
					} else if (nextPlayer && !playerNotLast) {
						changeActiveClass(+localStorage.getItem('country-' + currentSecond), startArmyTab);
					} else if (!nextPlayer && !playerNotLast) {
						changeActiveClass(+localStorage.getItem('country-' + currentLast), startArmyTab);
					};
				};

			} else {
				changeActiveClass(+localStorage.getItem('country-' + numberShop), startArmyTab);
			};
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
					screens[2].className = 'screen starting-army';

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

					shootingWrap.className = 'screen__wrap shooting__wrap shooting__step-0';
					counterStep = 0;
					changeActiveClass(counterStep, shootingArticle);

					for (let sa = 0; sa < saCaching; sa++) {
						let shArticle = shootingArticle[sa],
							articleTitle = shArticle.querySelector('.shooting__title span'), // Место вывода результата выбранного.
							articleItem = shArticle.querySelectorAll('.shooting__item'); // Кнопки выбора параметра для атаки.

						articleTitle.textContent = '?';

						for (let ai = 0; ai < articleItem.length; ai++) {
							let aItem = articleItem[ai];

							aItem.classList.remove(isActive);
						};
					};

					shootingBtn[0].classList.add(isEnd);
					shootingBtn[1].classList.add(isEnd);

					shootingText[0].setAttribute('data-info', 0);
					shootingText[1].setAttribute('data-info', 0);

					shootingResult.style.color = '#fbfbfb';
					shootingResult.textContent = '?';

					currentFpower = '';
					currentArmor = '';
					currentCube = '';
				}, 500);
			});
		};

		// Управление кнопкой "атаковать", расположенную на стартовом и главном экране.
		for (let ga = 0; ga < gaCaching; ga++) {
			let btnAtack = globalAttack[ga];

			btnAtack.addEventListener('click', function() {
				switchSections(this);
				ga === 0 ? btnBack[0].setAttribute('data-switch', 0) : btnBack[0].setAttribute('data-switch', 3);
			});
		};

		// Управление кнопкой "техника", расположенную на стартовом и главном экране.
		for (let gt = 0; gt < gtCaching; gt++) {
			let btnTechnics = globalTechnics[gt];

			btnTechnics.addEventListener('click', function() {
				generationVehicleCards(true);
				switchSections(this);
				gt === 0 ? btnBack[1].setAttribute('data-switch', 0) : btnBack[1].setAttribute('data-switch', 3);
			});
		};

		// Управление кнопкой "назад", расположенную в разделе "стрельба" и информационном.
		for (let bb = 0; bb < bbCaching; bb++) {
			let back = btnBack[bb];

			back.addEventListener('click', function() {
				switchSections(this);
			});
		};

		// Управление кнопками переключения шага выбора в разделе "стрельба".
		for (let sb = 0; sb < sbCaching; sb++) {
			let shBtn = shootingBtn[sb];

			shBtn.addEventListener('click', function() {
				if (!shBtn.classList.contains(isEnd)) {
					if (shBtn.classList.contains('shooting__btn_left')) { // Кнопка переключения шага назад.
						counterStep <= 0 ? counterStep = 0 : counterStep--;

						if (counterStep === 0) {
							shBtn.classList.add(isEnd);

							if (shootingWrap.classList.contains(classStep + '1') && currentArmor === undefined) shootingBtn[1].classList.remove(isEnd);

						} else if (shootingWrap.classList.contains(classStep + '2') && counterStep === 1) {
							shootingBtn[1].classList.remove(isEnd);
						};

					} else if (shBtn.classList.contains('shooting__btn_right')) { // Кнопка переключения шага вперёд.
						shootingWrap.classList.add(classStep + (counterStep + 1));

						if (shootingWrap.classList.contains(classStep + '1') && currentArmor === undefined || shootingWrap.classList.contains(classStep + '2') && counterStep === 1) {
							shBtn.classList.add(isEnd);
							shootingBtn[0].classList.remove(isEnd);

						};

						if (shootingWrap.classList.contains(classStep + '2') && counterStep === 0) shootingBtn[0].classList.remove(isEnd);

						counterStep >= 2 ? counterStep = 2 : counterStep++;
					};
	
					changeActiveClass(counterStep, shootingArticle);
				};
			});
		};

		// Управление разделом "стрельба".
		for (let sa = 0; sa < saCaching; sa++) {
			let shArticle = shootingArticle[sa],
				articleTitle = shArticle.querySelector('.shooting__title span'), // Место вывода результата выбранного.
				articleItem = shArticle.querySelectorAll('.shooting__item'); // Кнопки выбора параметра для атаки.

			for (let ai = 0; ai < articleItem.length; ai++) {
				let aItem = articleItem[ai];

				aItem.addEventListener('click', function() {
					if (!aItem.classList.contains('shooting__item_null')) {
						articleTitle.textContent = aItem.querySelector('span').textContent;

						if (sa === 0) {
							shootingBtn[0].classList.remove(isEnd);

							if (shootingWrap.classList.contains(classStep + '1') && currentArmor === '') shootingBtn[1].classList.add(isEnd);

							currentFpower = ai;

							if (ai === 0) articleTitle.textContent = 'ПЕХОТА'; // Корректировка значения.

							// Обновление информации.
							if (currentArmor !== '') shootingUpdate(true);

							// Обновление результата.
							if (currentCube !== '') shootingUpdate(false);

						} else if (sa === 1) {
							if (shootingWrap.classList.contains(classStep + '2') && counterStep === 1) shootingBtn[1].classList.add(isEnd);

							currentArmor = ai;

							if (ai === 17) articleTitle.textContent = '22'; // Корректировка значения.

							// Подстановка информации.
							shootingUpdate(true);

							// Обновление результата.
							if (currentCube !== '') shootingUpdate(false);

						} else {
							currentCube = ai;

							// Подстановка результата.
							shootingUpdate(false);
						};

						changeActiveClass(ai, articleItem);

						// Переключение на следующий шаг.
						if (sa !== 2) {
							shootingWrap.classList.add(classStep + (sa + 1));
							counterStep = sa + 1;
							changeActiveClass(counterStep, shootingArticle);
						};
					};
				});
			};
		};

		// Управление кнопкой "случайное число", расположенную в разделе "стрельба".
		shootingRandom.addEventListener('click', function() {
			let blockParent = shootingRandom.parentElement; // Родительский блок кнопки.

			currentCube = randomInteger(0, 10);

			blockParent.parentElement.querySelector('.shooting__title span').textContent = blockParent.querySelectorAll('.shooting__item span')[currentCube].textContent;

			changeActiveClass(currentCube, blockParent.querySelectorAll('.shooting__item'));
			shootingUpdate(false);
		});

		// Кнопки запуска магазина.
		for (let gbs = 0; gbs < gbsCaching; gbs++) {
			let btnShop = globalBtnShop[gbs],
				listNameCountry = ['Германии', 'СССР', 'Союзников'];

			btnShop.addEventListener('click', function() {
				for (let sat = 0; sat < satCaching; sat++) {
					startArmyTab[sat].innerHTML = '';
				};

				generationVehicleCards(false);

				screens[2].className = 'screen starting-army';
				screens[2].classList.add('is-shop');

				if (gbs === 0) {
					numberShop = currentFirst;
					startArmyTitle.setAttribute('data-player', localStorage.getItem('player-' + currentFirst));
					startArmyTitle.setAttribute('data-name-country', listNameCountry[localStorage.getItem('country-' + currentFirst)]);
					changeActiveClass(+localStorage.getItem('country-' + currentFirst), startArmyTab);

				} else if (gbs === 1) {
					if (counterPlayer === 1) {
						numberShop = currentLast;
						startArmyTitle.setAttribute('data-player', localStorage.getItem('player-' + currentLast));
						startArmyTitle.setAttribute('data-name-country', listNameCountry[localStorage.getItem('country-' + currentLast)]);
						changeActiveClass(+localStorage.getItem('country-' + currentLast), startArmyTab);

					} else if (counterPlayer === 2) {
						numberShop = currentSecond;
						startArmyTitle.setAttribute('data-player', localStorage.getItem('player-' + currentSecond));
						startArmyTitle.setAttribute('data-name-country', listNameCountry[localStorage.getItem('country-' + currentSecond)]);
						changeActiveClass(+localStorage.getItem('country-' + currentSecond), startArmyTab);
					};

				} else {
					if (counterPlayer === 2) {
						numberShop = currentLast;
						startArmyTitle.setAttribute('data-player', localStorage.getItem('player-' + currentLast));
						startArmyTitle.setAttribute('data-name-country', listNameCountry[localStorage.getItem('country-' + currentLast)]);
						changeActiveClass(+localStorage.getItem('country-' + currentLast), startArmyTab);
					};
				};

				startArmyResources.textContent = '0';

				switchSections(this);
			});
		};

		// Управление параметрами соортировки, в разделе информации.
		for (let it = 0; it < itCaching; it++) {
			let tab = infoTab[it],
				icheck = tab.querySelectorAll('.info__checkbox'), // Все пункты параметра.
				icCaching = icheck.length,
				randomNumber = randomInteger(0, icCaching - 1); // Рандомный номер.

			if (it < 3) {
				icheck[randomNumber].checked = true; // Рандомный выбор пункта параметра.
				infoList.classList.add(icheck[randomNumber].getAttribute('name')); // Назначение классов списку, для сорттировки.
			};

			for (let ic = 0; ic < icCaching; ic++) {
				let itemCheck = icheck[ic],
					parentBox = itemCheck.parentElement, // Блок в котором находится чекбокс.
					listChildren, // Список всей техники в списке.
					lcCaching;

				itemCheck.addEventListener('click', function() {
					showMessageSort();

					if (it < 3) {
						infoList.classList.toggle(itemCheck.getAttribute('name'));

					} else if (it > 2) {
						if (it !== currentInfoTab) {
							if (infoTab[currentInfoTab].classList.contains('is-up')) infoTab[currentInfoTab].classList.remove('is-up');
							if (infoTab[currentInfoTab].classList.contains('is-down')) infoTab[currentInfoTab].classList.remove('is-down');
							currentInfoTab = it;
						};

						if (!parentBox.classList.contains('is-up')) {
							listChildren = infoList.children;
							lcCaching = listChildren.length;

							parentBox.classList.add('is-up');

							for (let lc = 0; lc < lcCaching; lc++) {
								let item = listChildren[lc];

								item.style.order = +item.getAttribute(itemCheck.getAttribute('data-sort'));
							};

						} else {
							parentBox.classList.toggle('is-down');

							for (let lc = 0; lc < lcCaching; lc++) {
								let item = listChildren[lc];

								parentBox.classList.contains('is-down') ? item.style.order = '-' + +item.getAttribute(itemCheck.getAttribute('data-sort')) : item.style.order = +item.getAttribute(itemCheck.getAttribute('data-sort'));
							};
						};
					};
				});
			};
		};



		/* Подстановка (обновление) информации (результата) о стрельбе.
			@param {boolean} isInfo - работаем с информационным блоком или нет. */
		function shootingUpdate(isInfo) {
			if (isInfo) {
				let maxDamage = Math.min.apply(Math, isSHOOTING['firepower-' + currentFpower]['armor-' + currentArmor]['cube']), // Максимальный урон.
					attrInfo = 'data-info'; // Атрибут лдя информации.

				shootingText[0].setAttribute(attrInfo, isSHOOTING['firepower-' + currentFpower]['armor-' + currentArmor].chance); // Шанс пораженя.

				if (maxDamage === -99) {
					shootingText[1].setAttribute(attrInfo, 'оба убиты');

				}	else {
					shootingText[1].setAttribute(attrInfo, maxDamage);
				};

			} else {
				let totalResult = isSHOOTING['firepower-' + currentFpower]['armor-' + currentArmor]['cube'][currentCube]; // Полученный результат стрельбы.

				// Цветовая коррекция значения.
				if (totalResult === 0 || totalResult === -66) {
					shootingResult.style.color = '#E8432A';

				} else if (totalResult === -1 || totalResult === -77) {
					shootingResult.style.color = '#3ECF6E';

				} else if (totalResult === -2 || totalResult === -3 || totalResult === -4 || totalResult === -5 || totalResult === -99) {
					shootingResult.style.color = '#EBEB2C';

				} else if (totalResult === 1) {
					shootingResult.style.color = '#757373';
				}

				// Коррекция подставляемого значения.
				if (totalResult === -66) {
					shootingResult.textContent = 'вы убиты';

				} else if (totalResult === -77) {
					shootingResult.textContent = 'враг убит';

				} else if (totalResult === -99) {
					shootingResult.textContent = 'оба убиты';

				} else if (totalResult === 1) {
					shootingResult.textContent = miss[randomInteger(0, miss.length - 1)];

				} else {
					shootingResult.textContent = totalResult;
				};
			};
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

		/* Сообщение о сортировке или не выборе пареметров для сортировки. */
		function showMessageSort() {
			let message = document.querySelector('.info__message'), // Блок сообщения.
				icheck = document.querySelectorAll('.info__checkbox'); // Позиции сортировки.

			for (let i = 0; i < 8; i++) {
				setTimeout(function() {
					if (icheck[0].checked === false && icheck[1].checked === false && icheck[2].checked === false && icheck[3].checked === false && icheck[4].checked === false && icheck[5].checked === false && icheck[6].checked === false && icheck[7].checked === false) {
						message.classList.add(isError);
						message.classList.add(isActive);

					} else {
						message.classList.remove(isError);
						message.classList.add(isActive);

						setTimeout(function() {
							message.classList.remove(isActive);
						}, 800);
					};
				}, 200);
			};
		};

		/* Генерация карточек техники. 
			@param {boolean} isInfo - генерация будет произведена в раздел информации или нет. */
		function generationVehicleCards(isInfo) {
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
						viewItem, // Вид техники.
						productionItem, // Есть ли производство техники.
						sumLetters, sumSpecifications, sumQualities; // Сумма всех символов в названии, характеристик и качеств техники.

					// Корректировка парамтра.
					+parameter.armor === 22 ? progressArmor = Math.round((((parameter.hp/3)*isPROGRESS.armor[parameter.armor - 5])*100)/1100) : progressArmor = Math.round((((parameter.hp/3)*isPROGRESS.armor[parameter.armor])*100)/1100);

					// Общие классы карточки.
					!isInfo ? tabItem.className = 'screen__decor starting-army__box' : tabItem.className = 'screen__decor info__item';

					if (isInfo) {
						// Определение классов страны, для раздла информации.
						if (it === 0) {
							tabItem.classList.add('info__item_germany');

						} else if (it === 1) {
							tabItem.classList.add('info__item_ussr');

						} else {
							tabItem.classList.add('info__item_allies');
						};

						// Определение по типу техники.
						if (parameter.weight === 1) {
							tabItem.classList.add('info__item_light');

						} else if (parameter.weight === 2) {
							tabItem.classList.add('info__item_middle');

						} else {
							tabItem.classList.add('info__item_heavy');
						};
					};

					// Определение танков.
					if (parameter.type === 1) {
						!isInfo ? viewItem = 'starting-army__card_tank' : tabItem.classList.add('info__item_tank');

						if (parameter.weight === 1) {
							typeItem = 'Лёгкий танк';

						} else if (parameter.weight === 2) {
							typeItem = 'Средний танк';

						} else if (parameter.weight === 3) {
							typeItem = 'Тяжёлый танк';
						};
					};

					// Определение ПТ-САУ.
					if (parameter.type === 2) {
						!isInfo ? viewItem = 'starting-army__card_pt-sau' : tabItem.classList.add('info__item_pt-sau');

						if (parameter.weight === 1) {
							typeItem = 'Лёгкая ПТ-САУ';

						} else if (parameter.weight === 2) {
							typeItem = 'Средняя ПТ-САУ';

						} else if (parameter.weight === 3) {
							typeItem = 'Тяжёлая ПТ-САУ';
						};
					};

					// Определения выпускается ещё техника или нет.
					if (!isInfo) {
						if (totalProductStart < totalProductCurent) {
							if (totalProductEnd >= (totalProductCurent - 5)) {
								if (totalProductEnd <= (totalProductCurent - 1)) {
									productionItem = 'starting-army__type_old';
									tabItem.classList.add('is-old');
								};
							};
						};
					};

					if (isInfo) {
						sumLetters = sumLettersNames(nameTechnics);
						sumSpecifications = parameter.speed + parameter.range + parameter.hp + parameter.fpower + parameter.armor;
						sumQualities = progressMobility + progressFpower + progressArmor;

						tabItem.setAttribute(targetAttr + '-name', sumLetters);
						tabItem.setAttribute(targetAttr + '-class', parameter.weight);
						tabItem.setAttribute(targetAttr + '-specifications', sumSpecifications);
						tabItem.setAttribute(targetAttr + '-quality', sumQualities);
						tabItem.setAttribute(targetAttr + '-price', parameter.cost);
					};

					// Html-разметка карточки.
					if (!isInfo) {
						tabItem.innerHTML = `
							<div class="starting-army__card ${viewItem}">
								<picture class="starting-army__picture">
									<source srcset="${parameter.images}.webp" type="image/webp">
									<img class="starting-army__image" src="${parameter.images}.png">
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

					} else {
						tabItem.innerHTML = `
							<picture class="info__path info__picture">
								<source srcset="${parameter.images}.webp" type="image/webp">
								<img class="info__image" src="${parameter.images}.png">

								<h3 class="info__color info__name">${nameTechnics}</h3>
							</picture>

							<p class="info__path info__color info__class">${typeItem}</p>

							<ul class="info__path info__characteristics">
								<li class="info__param" data-param="${parameter.speed}"><svg class="info__svg"><use xlink:href="#speed"></use></svg></li>
								<li class="info__param" data-param="${parameter.range}"><svg class="info__svg"><use xlink:href="#range"></use></svg></li>
								<li class="info__param" data-param="${parameter.hp}"><svg class="info__svg"><use xlink:href="#hp"></use></svg></li>
								<li class="info__param" data-param="${parameter.fpower}"><svg class="info__svg" fill="#E8432A"><use xlink:href="#fpower"></use></svg></li>
								<li class="info__param" data-param="${parameter.armor}"><svg class="info__svg" fill="#E8432A"><use xlink:href="#armor"></use></svg></li>
							</ul>

							<ul class="info__path info__quality">
								<li class="screen__decor info__property" data-name="Подвижность"><span class="info__line" data-width="${progressMobility}" style="width: ${progressMobility}%;"></span></li>
								<li class="screen__decor info__property" data-name="Вооружение"><span class="info__line" data-width="${progressFpower}" style="width: ${progressFpower}%;"></span></li>
								<li class="screen__decor info__property" data-name="Живучесть"><span class="info__line" data-width="${progressArmor}" style="width: ${progressArmor}%;"></span></li>
							</ul>

							<p class="info__path info__color info__price">${parameter.cost}</p>
						`;
					};

					if (!isInfo) {
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

					} else {
						infoList.appendChild(tabItem);
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

					if (!screens[2].classList.contains('is-shop') && countBuy <= 1) {
						saPlus.classList.add(isEnd);
						countBuy = 1;
					};

					if (!screens[2].classList.contains('is-shop') && +startArmyResources.textContent - saPrice > 0 || screens[2].classList.contains('is-shop')) {
						currentCount >= 999 ? currentCount = 999 : currentCount++;
						saText.textContent = currentCount;

						!screens[2].classList.contains('is-shop') ? startArmyResources.textContent = +startArmyResources.textContent - saPrice : startArmyResources.textContent = +startArmyResources.textContent + saPrice;

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

						!screens[2].classList.contains('is-shop') ? startArmyResources.textContent = +startArmyResources.textContent + saPrice : startArmyResources.textContent = +startArmyResources.textContent - saPrice;

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

		/* Определение суммы всех символов в названии техники.
			@param {string} name - получаемое название техники.
			@returns {number} - возвращаем сумму всех символов назания. */
		function sumLettersNames(name) {
			let listSymbols = {
					'а': 1, 'a': 1,
					'б': 2, 'b': 2,
					'в': 3, 'c': 3,
					'г': 4, 'd': 4,
					'д': 5, 'e': 5,
					'е': 6, 'f': 6,
					'ё': 7, 'g': 7,
					'ж': 8, 'h': 8,
					'з': 9, 'i': 9,
					'и': 10, 'j': 10,
					'й': 11, 'k': 11,
					'к': 12, 'l': 12,
					'л': 13, 'm': 13,
					'м': 14, 'n': 14,
					'н': 15, 'o': 15,
					'о': 16, 'p': 16,
					'п': 17, 'q': 17,
					'р': 18, 'r': 18,
					'с': 19, 's': 19,
					'т': 20, 't': 20,
					'у': 21, 'u': 21,
					'ф': 22, 'v': 22,
					'х': 23, 'w': 23,
					'ц': 24, 'x': 24,
					'ч': 25, 'y': 25,
					'ш': 26, 'z': 26,
					'щ': 27, 'ъ': 28,
					'ы': 29, 'ь': 30,
					'э': 31, 'ю': 32,
					'я': 33, '1': 1,
					'2': 2, '3': 3,
					'4': 4, '5': 5,
					'6': 6, '7': 7,
					'8': 8, '9': 9,
					'0': 0, ' ': 0,
					'-': 0, '(': 0,
					')': 0
				}, // Список сумм у символов.
				totalSum = 0; // Сумма всех символов.

			for (let n = 0; n < name.length; n++) {
				totalSum = listSymbols[name[0].toLowerCase()];
			};

			return totalSum;
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