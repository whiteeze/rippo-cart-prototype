/**
 * Готовые плагины для CMS (как на внедрении):
 * 1) DaData Suggestions — адрес / город / индекс
 * 2) @cdek-it/widget — выбор ПВЗ СДЭК
 *
 * Без ключа DaData работают демо-подсказки из app.js.
 * Виджет СДЭК без servicePath открывает демо-список ПВЗ (формат ответа тот же).
 */
(() => {
  const TOKEN_KEY = 'rippo_dadata_token';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  window.RippoPlugins = {
    dadataReady: false,
    cdekWidget: null,
    getToken() {
      return (localStorage.getItem(TOKEN_KEY) || $('#dadata-token')?.value || '').trim();
    },
  };

  /* —— DaData —— */
  function initDadata() {
    const token = window.RippoPlugins.getToken();
    const hasLib = typeof window.Dadata?.createSuggestions === 'function';
    window.RippoPlugins.dadataReady = Boolean(token && hasLib);

    document.documentElement.classList.toggle('dadata-live', window.RippoPlugins.dadataReady);

    if (!window.RippoPlugins.dadataReady) {
      $$('.js-dadata-address, .js-dadata-city').forEach((el) => {
        el.dataset.dadata = 'demo';
      });
      return;
    }

    $$('.js-dadata-city').forEach((input) => {
      if (input.dataset.dadataBound === '1') return;
      input.dataset.dadataBound = '1';
      input.dataset.dadata = 'live';
      window.Dadata.createSuggestions(input, {
        token,
        type: 'address',
        hint: false,
        params: {
          from_bound: { value: 'city' },
          to_bound: { value: 'settlement' },
        },
        onSelect(suggestion) {
          const city =
            suggestion?.data?.city ||
            suggestion?.data?.settlement ||
            suggestion?.value ||
            '';
          input.value = city;
        },
      });
    });

    $$('.js-dadata-address').forEach((input) => {
      if (input.dataset.dadataBound === '1') return;
      input.dataset.dadataBound = '1';
      input.dataset.dadata = 'live';
      // скрыть демо-список рядом
      const demoList = input.parentElement?.querySelector('.suggest-list');
      if (demoList) demoList.classList.add('hidden');

      window.Dadata.createSuggestions(input, {
        token,
        type: 'address',
        hint: false,
        params: {
          from_bound: { value: 'street' },
          to_bound: { value: 'flat' },
        },
        onSelect(suggestion) {
          const data = suggestion?.data || {};
          input.value = suggestion?.value || input.value;

          const cityId = input.dataset.cityTarget;
          const indexId = input.dataset.indexTarget;
          if (cityId) {
            const cityEl = document.getElementById(cityId);
            if (cityEl) cityEl.value = data.city || data.settlement || cityEl.value;
          }
          if (indexId) {
            const indexEl = document.getElementById(indexId);
            if (indexEl && data.postal_code) indexEl.value = data.postal_code;
          }

          const err = input.parentElement?.querySelector('.error-text');
          if (err) {
            err.classList.add('hidden');
            err.classList.remove('suggest-tip');
          }
        },
      });
    });
  }

  const tokenInput = $('#dadata-token');
  if (tokenInput) {
    tokenInput.value = localStorage.getItem(TOKEN_KEY) || '';
    tokenInput.addEventListener('change', () => {
      localStorage.setItem(TOKEN_KEY, tokenInput.value.trim());
      // перезагрузка проще, чем destroy suggestions
      location.reload();
    });
  }

  /* —— ПВЗ на Яндекс.Карте —— */
  // coords: [lat, lon] — формат Яндекс.Карт
  const PVZ_BY_CITY = {
    'Санкт-Петербург': {
      center: [59.9343, 30.3351],
      points: [
        { street: 'Невский пр., 114', schedule: 'ежедневно 10:00–21:00', cod: true, coords: [59.9312, 30.3609] },
        { street: 'ул. Савушкина, 141', schedule: 'пн–сб 09:00–20:00', cod: true, coords: [59.9854, 30.2948] },
        { street: 'пр. Просвещения, 19', schedule: 'ежедневно 10:00–22:00', cod: false, coords: [60.0386, 30.3662] },
        { street: 'Московский пр., 222', schedule: 'ежедневно 09:00–21:00', cod: true, coords: [59.8512, 30.3218] },
        { street: 'ул. Ефимова, 3', schedule: 'пн–вс 10:00–22:00', cod: true, coords: [59.9268, 30.3195] },
        { street: 'пр. Большевиков, 18', schedule: 'пн–сб 10:00–20:00', cod: true, coords: [59.9134, 30.4702] },
        { street: 'ул. Ленсовета, 88', schedule: 'ежедневно 09:00–21:00', cod: false, coords: [59.8441, 30.3486] },
        { street: 'пр. Стачек, 47', schedule: 'пн–пт 10:00–19:00', cod: true, coords: [59.8756, 30.2614] },
        { street: 'ул. Комиссара Смирнова, 15', schedule: 'ежедневно 10:00–21:00', cod: true, coords: [59.9612, 30.3481] },
        { street: 'пр. Науки, 17', schedule: 'пн–сб 09:00–20:00', cod: true, coords: [60.0038, 30.3864] },
        { street: 'ул. Типанова, 21', schedule: 'ежедневно 10:00–22:00', cod: false, coords: [59.8524, 30.3491] },
        { street: 'Средний пр. В.О., 36', schedule: 'пн–пт 10:00–20:00', cod: true, coords: [59.9428, 30.2785] },
      ],
    },
    Москва: {
      center: [55.7558, 37.6173],
      points: [
        { street: 'ул. Тверская, 12', schedule: 'ежедневно 10:00–21:00', cod: true, coords: [55.7625, 37.6094] },
        { street: 'ул. Вавилова, 3', schedule: 'пн–пт 09:00–20:00', cod: true, coords: [55.7039, 37.5856] },
        { street: 'ш. Энтузиастов, 12к2', schedule: 'ежедневно 10:00–22:00', cod: false, coords: [55.7472, 37.7168] },
        { street: 'ул. Профсоюзная, 104', schedule: 'ежедневно 09:00–21:00', cod: true, coords: [55.6634, 37.5521] },
        { street: 'Ленинградский пр., 80', schedule: 'пн–вс 10:00–22:00', cod: true, coords: [55.8052, 37.5168] },
        { street: 'ул. Большая Черёмушкинская, 1', schedule: 'пн–сб 10:00–20:00', cod: true, coords: [55.6871, 37.5894] },
        { street: 'ш. Варшавское, 87', schedule: 'ежедневно 09:00–21:00', cod: false, coords: [55.6538, 37.6201] },
        { street: 'ул. Сущевский Вал, 5', schedule: 'пн–пт 10:00–19:00', cod: true, coords: [55.7924, 37.6265] },
        { street: 'пр-т Мира, 102', schedule: 'ежедневно 10:00–21:00', cod: true, coords: [55.8126, 37.6382] },
        { street: 'ул. Новый Арбат, 21', schedule: 'пн–вс 10:00–22:00', cod: true, coords: [55.7521, 37.5863] },
        { street: 'ул. Люблинская, 157', schedule: 'пн–сб 09:00–20:00', cod: false, coords: [55.6689, 37.7384] },
        { street: 'Зелёный пр., 62', schedule: 'ежедневно 10:00–21:00', cod: true, coords: [55.7518, 37.8142] },
      ],
    },
    Казань: {
      center: [55.7961, 49.1064],
      points: [
        { street: 'ул. Баумана, 9', schedule: 'пн–пт 10:00–20:00', cod: true, coords: [55.7896, 49.1168] },
        { street: 'ул. Рихарда Зорге, 11', schedule: 'ежедневно 09:00–21:00', cod: false, coords: [55.7832, 49.2145] },
        { street: 'пр-т Победы, 141', schedule: 'пн–сб 10:00–19:00', cod: true, coords: [55.8241, 49.1338] },
        { street: 'ул. Пушкина, 18', schedule: 'ежедневно 10:00–21:00', cod: true, coords: [55.7901, 49.1245] },
        { street: 'ул. Декабристов, 133', schedule: 'пн–пт 09:00–20:00', cod: true, coords: [55.8302, 49.0821] },
        { street: 'ул. Амирхана, 14', schedule: 'ежедневно 09:00–21:00', cod: true, coords: [55.8215, 49.1542] },
        { street: 'ул. Кул Гали, 13', schedule: 'пн–сб 10:00–20:00', cod: false, coords: [55.7648, 49.2315] },
        { street: 'ул. Чистопольская, 5', schedule: 'ежедневно 10:00–22:00', cod: true, coords: [55.8156, 49.1012] },
        { street: 'пр-т Ямашева, 97', schedule: 'пн–пт 10:00–19:00', cod: true, coords: [55.8371, 49.1184] },
        { street: 'ул. Эсперанто, 8', schedule: 'ежедневно 09:00–21:00', cod: true, coords: [55.7784, 49.1456] },
      ],
    },
    Новосибирск: {
      center: [55.0302, 82.9204],
      points: [
        { street: 'ул. Ленина, 21', schedule: 'пн–пт 10:00–19:00', cod: true, coords: [55.0301, 82.9204] },
        { street: 'ул. Гоголя, 15', schedule: 'ежедневно 10:00–21:00', cod: true, coords: [55.0412, 82.9221] },
        { street: 'Красный пр., 101', schedule: 'пн–сб 09:00–20:00', cod: false, coords: [55.0418, 82.9176] },
        { street: 'ул. Фрунзе, 238', schedule: 'ежедневно 09:00–21:00', cod: true, coords: [55.0415, 82.9502] },
        { street: 'ул. Бориса Богаткова, 264', schedule: 'пн–пт 10:00–20:00', cod: true, coords: [55.0184, 82.9571] },
        { street: 'ул. Станционная, 62', schedule: 'пн–сб 10:00–19:00', cod: true, coords: [54.9912, 82.8514] },
        { street: 'ул. Громова, 15', schedule: 'ежедневно 10:00–21:00', cod: false, coords: [54.9865, 82.9012] },
        { street: 'пр. Дзержинского, 36', schedule: 'пн–вс 09:00–21:00', cod: true, coords: [55.0521, 82.9124] },
      ],
    },
    Екатеринбург: {
      center: [56.8389, 60.6057],
      points: [
        { street: 'ул. Вайнера, 9', schedule: 'ежедневно 10:00–21:00', cod: true, coords: [56.8372, 60.5975] },
        { street: 'ул. Малышева, 36', schedule: 'пн–пт 09:00–20:00', cod: true, coords: [56.8356, 60.6124] },
        { street: 'ул. 8 Марта, 46', schedule: 'ежедневно 10:00–22:00', cod: false, coords: [56.8294, 60.6031] },
        { street: 'ул. Белинского, 86', schedule: 'пн–сб 10:00–20:00', cod: true, coords: [56.8245, 60.6251] },
        { street: 'ул. Крауля, 44', schedule: 'ежедневно 09:00–21:00', cod: true, coords: [56.8452, 60.5684] },
        { street: 'ул. Щербакова, 4', schedule: 'пн–пт 10:00–19:00', cod: true, coords: [56.8012, 60.5981] },
        { street: 'ул. Металлургов, 87', schedule: 'пн–сб 09:00–20:00', cod: false, coords: [56.8621, 60.5412] },
        { street: 'ул. Академика Бардина, 28', schedule: 'ежедневно 10:00–21:00', cod: true, coords: [56.7984, 60.6315] },
      ],
    },
  };

  let ymapInstance = null;
  let ymapsLoading = null;

  function normalizeCity(value) {
    return (value || '')
      .trim()
      .replace(/^г\.?\s*/i, '')
      .replace(/^город\s+/i, '');
  }

  function resolveCityKey(city) {
    const n = normalizeCity(city).toLowerCase();
    if (!n) return '';
    const keys = Object.keys(PVZ_BY_CITY);
    return (
      keys.find((k) => k.toLowerCase() === n) ||
      keys.find((k) => k.toLowerCase().includes(n) || n.includes(k.toLowerCase())) ||
      ''
    );
  }

  function getCityPack(city) {
    const key = resolveCityKey(city);
    if (key) return { cityName: key, ...PVZ_BY_CITY[key] };
    const cityName = normalizeCity(city) || 'Город';
    return {
      cityName,
      center: [55.75, 37.62],
      points: [
        { street: 'ул. Центральная, 1', schedule: 'пн–пт 10:00–19:00', cod: true, coords: [55.752, 37.62] },
        { street: 'ул. Советская, 25', schedule: 'ежедневно 09:00–21:00', cod: true, coords: [55.76, 37.63] },
        { street: 'пр. Мира, 10', schedule: 'пн–сб 10:00–20:00', cod: false, coords: [55.745, 37.61] },
      ],
    };
  }

  function loadYmaps() {
    if (window.ymaps) return Promise.resolve(window.ymaps);
    if (ymapsLoading) return ymapsLoading;
    ymapsLoading = new Promise((resolve, reject) => {
      const key = localStorage.getItem('rippo_yandex_maps_key') || '';
      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/2.1/?lang=ru_RU${key ? `&apikey=${encodeURIComponent(key)}` : ''}`;
      script.async = true;
      script.onload = () => {
        window.ymaps.ready(() => resolve(window.ymaps));
      };
      script.onerror = () => reject(new Error('Не удалось загрузить Яндекс.Карты'));
      document.head.appendChild(script);
    });
    return ymapsLoading;
  }

  function renderPvzList(pack) {
    const list = $('#cdek-pvz-list');
    const label = $('#cdek-city-label');
    const head = $('#cdek-modal-title');
    if (!list) return;

    if (label) label.textContent = `Пункты выдачи · ${pack.cityName}`;
    if (head) head.textContent = `ПВЗ на карте · ${pack.cityName}`;

    list.innerHTML = pack.points
      .map((p, i) => {
        const title = `${pack.cityName}, ${p.street}`;
        const codLabel = p.cod ? 'наложенный платёж доступен' : 'без наложенного платежа';
        return `<button type="button" class="cdek-pvz-option" data-idx="${i}" data-name="СДЭК, ${p.street}" data-city="${pack.cityName}" data-cod="${p.cod ? '1' : '0'}" data-schedule="${p.schedule}">
          <b>${title}</b>
          <span>${p.schedule} · ${codLabel}</span>
        </button>`;
      })
      .join('');
  }

  function selectPvz(pack, point) {
    applyPvzFromWidget({
      name: `СДЭК, ${point.street}`,
      city: pack.cityName,
      cod: point.cod,
      work_time: point.schedule,
    });
    closeCdekModal();
  }

  function renderYandexMap(pack) {
    const root = $('#cdek-map');
    if (!root) return;

    if (ymapInstance) {
      ymapInstance.destroy();
      ymapInstance = null;
    }
    root.innerHTML = '';

    loadYmaps()
      .then((ymaps) => {
        ymapInstance = new ymaps.Map(root, {
          center: pack.center,
          zoom: 11,
          controls: ['zoomControl', 'geolocationControl', 'fullscreenControl'],
        });

        const geoObjects = [];
        pack.points.forEach((p, i) => {
          const placemark = new ymaps.Placemark(
            p.coords,
            {
              balloonContentHeader: `СДЭК · ${p.street}`,
              balloonContentBody: `${p.schedule}<br>${p.cod ? 'Наложенный платёж доступен' : 'Без наложенного платежа'}<br><br><button type="button" id="ymap-pick-${i}" style="padding:8px 12px;cursor:pointer;font-weight:700">Выбрать этот ПВЗ</button>`,
              hintContent: p.street,
            },
            {
              // Метки в жёлтом акценте сайта RIPPO (#fdef39)
              preset: 'islands#yellowShoppingIcon',
              iconColor: '#fdef39',
            }
          );

          placemark.events.add('balloonopen', () => {
            setTimeout(() => {
              const btn = document.getElementById(`ymap-pick-${i}`);
              if (btn) {
                btn.onclick = () => selectPvz(pack, p);
              }
            }, 0);
          });

          placemark.events.add('click', () => {
            // подсветка в списке
            $$('#cdek-pvz-list .cdek-pvz-option').forEach((el) => {
              el.classList.toggle('selected', el.dataset.idx === String(i));
            });
          });

          ymapInstance.geoObjects.add(placemark);
          geoObjects.push(placemark);
        });

        if (geoObjects.length > 1) {
          ymapInstance.setBounds(ymapInstance.geoObjects.getBounds(), {
            checkZoomRange: true,
            zoomMargin: 40,
          });
        }

        setTimeout(() => ymapInstance.container.fitToViewport(), 50);
      })
      .catch((err) => {
        console.warn(err);
        root.innerHTML = `<div style="padding:24px;font-size:14px;color:#666">Не удалось загрузить Яндекс.Карты. Выберите ПВЗ из списка справа.<br><span style="font-size:12px">Для продакшена добавьте API-ключ Яндекс.Карт в localStorage: rippo_yandex_maps_key</span></div>`;
      });
  }

  function openCdekModal() {
    const modal = $('#cdek-modal');
    const overlay = $('#cdek-overlay');
    if (!modal || !overlay) return;

    const city = normalizeCity($('#city-input')?.value || '');
    if (!city) {
      alert('Сначала выберите город — затем откроется карта ПВЗ');
      $('#city-input')?.focus();
      return;
    }

    const pack = getCityPack(city);
    modal.hidden = false;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    renderPvzList(pack);
    renderYandexMap(pack);
  }

  function closeCdekModal() {
    $('#cdek-modal').hidden = true;
    $('#cdek-overlay')?.classList.remove('open');
    document.body.style.overflow = '';
    if (ymapInstance) {
      ymapInstance.destroy();
      ymapInstance = null;
    }
  }

  function applyPvzFromWidget(address) {
    const name =
      address?.name ||
      address?.address ||
      [address?.city, address?.address].filter(Boolean).join(', ') ||
      'ПВЗ СДЭК';
    const city = address?.city || normalizeCity($('#city-input')?.value || '');
    const cod =
      address?.haveCashless !== false &&
      address?.cod !== false &&
      address?.cod !== 0 &&
      address?.cod !== '0';

    if (typeof window.RippoApplyPvz === 'function') {
      window.RippoApplyPvz({
        title: name.includes('СДЭК') ? name : `СДЭК, ${name}`,
        city,
        cod: Boolean(cod),
        schedule: address?.work_time || address?.schedule || 'режим работы уточняйте в СДЭК',
      });
    }
  }

  $('#cdek-close')?.addEventListener('click', closeCdekModal);
  $('#cdek-overlay')?.addEventListener('click', closeCdekModal);

  $('#cdek-pvz-list')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.cdek-pvz-option');
    if (!btn) return;
    const city = btn.dataset.city;
    const pack = getCityPack(city);
    const point = pack.points[Number(btn.dataset.idx)] || {
      street: (btn.dataset.name || '').replace(/^СДЭК,\s*/, ''),
      schedule: btn.dataset.schedule,
      cod: btn.dataset.cod === '1',
    };
    selectPvz(pack, point);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#pick-pvz, #change-pvz, #change-pvz-2')) return;
    e.preventDefault();
    openCdekModal();
  });

  // init after DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDadata);
  } else {
    initDadata();
  }
})();
