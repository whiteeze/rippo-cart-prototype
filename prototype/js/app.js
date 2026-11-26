(() => {
  const money = (n) => Math.round(n).toLocaleString('ru-RU') + ' ₽';
  const state = {
    lines: [
      { id: 1, unit: 1890, qty: 1 },
      { id: 2, unit: 1350, qty: 2 },
    ],
    // Общая скидка сайта (промокодов нет; персональную не применяем)
    generalDiscount: 0,
    delivery: 'pvz',
    deliveryPrice: { pvz: 350, courier: 490, post: 420 },
    pay: 'online',
    pvzSelected: false,
    pvzNoCod: false,
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function goodsSum() {
    return state.lines.reduce((s, l) => s + l.unit * l.qty, 0);
  }
  function qtyTotal() {
    return state.lines.reduce((s, l) => s + l.qty, 0);
  }
  function discount() {
    return state.generalDiscount;
  }
  function afterDiscount() {
    return goodsSum() - discount();
  }
  function deliveryCost() {
    return state.deliveryPrice[state.delivery] || 0;
  }
  /** 3% от стоимости заказа без доставки — только при COD */
  function codFee() {
    if (state.pay !== 'cod') return 0;
    return Math.round(afterDiscount() * 0.03);
  }
  function payNow() {
    // Доставка всегда сейчас; при онлайн/почте — ещё и товар
    if (state.pay === 'cod') return deliveryCost();
    return afterDiscount() + deliveryCost();
  }
  function payLater() {
    if (state.pay !== 'cod') return 0;
    return afterDiscount() + codFee();
  }
  function grand() {
    return afterDiscount() + deliveryCost() + codFee();
  }

  function renderSums() {
    const g = goodsSum();
    const d = discount();
    const a = afterDiscount();
    const del = deliveryCost();
    const fee = codFee();

    if ($('#sum-goods')) $('#sum-goods').textContent = money(g);
    if ($('#sum-discount')) $('#sum-discount').textContent = '− ' + money(d);
    if ($('#sum-after')) $('#sum-after').textContent = money(a);
    if ($('#sum-total')) $('#sum-total').textContent = money(a);
    if ($('#cart-sum-head')) $('#cart-sum-head').textContent = money(a);
    if ($('#drawer-sum')) $('#drawer-sum').textContent = money(a);
    if ($('#cart-count')) $('#cart-count').textContent = String(qtyTotal());

    const goodsLabel = document.querySelector('#cart-summary .summary-row span.dim');
    if (goodsLabel && goodsLabel.textContent.includes('Товары')) {
      goodsLabel.textContent = `Товары (${qtyTotal()} компл.)`;
    }
    if ($('#confirm-qty')) $('#confirm-qty').textContent = `${qtyTotal()} комплект(ов)`;

    $$('[data-line]').forEach((el) => {
      const id = Number(el.dataset.line);
      const line = state.lines.find((l) => l.id === id);
      if (!line) return;
      const qtyEl = el.querySelector('.qty-val');
      const sumEl = el.querySelector('.line-sum');
      if (qtyEl) qtyEl.textContent = String(line.qty);
      if (sumEl) sumEl.textContent = money(line.unit * line.qty);
    });

    if ($('#chk-goods')) $('#chk-goods').textContent = money(g);
    if ($('#chk-discount')) $('#chk-discount').textContent = '− ' + money(d);
    if ($('#chk-delivery')) $('#chk-delivery').textContent = money(del);
    if ($('#chk-fee')) $('#chk-fee').textContent = money(fee);
    if ($('#chk-total')) $('#chk-total').textContent = money(grand());

    const feeRow = $('#chk-fee-row');
    const split = $('#chk-split');
    if (feeRow) feeRow.classList.toggle('hidden', state.pay !== 'cod');
    if (split) split.classList.toggle('hidden', state.pay !== 'cod');
    if ($('#chk-now')) $('#chk-now').textContent = money(payNow());
    if ($('#chk-later')) $('#chk-later').textContent = money(payLater());

    // COD dual block
    if ($('#cod-now')) {
      $('#cod-now').innerHTML = `${money(deliveryCost())} <span class="dim">(доставка)</span>`;
    }
    if ($('#cod-later')) {
      $('#cod-later').innerHTML = `${money(payLater())} <span class="dim">(товар + 3%)</span>`;
    }
    if ($('#cod-fee')) $('#cod-fee').textContent = money(fee);
    if ($('#cod-grand')) $('#cod-grand').textContent = money(grand());

  }

  function updateDeliveryUI() {
    const isPvz = state.delivery === 'pvz';
    const isCourier = state.delivery === 'courier';
    const isPost = state.delivery === 'post';

    $('#pvz-fields')?.classList.toggle('hidden', !isPvz);
    $('#courier-fields')?.classList.toggle('hidden', !isCourier);
    $('#post-fields')?.classList.toggle('hidden', !isPost);

    if (isPvz) {
      $('#pvz-block')?.classList.toggle('hidden', state.pvzSelected);
      $('#pvz-selected')?.classList.toggle('hidden', !state.pvzSelected || state.pvzNoCod);
      $('#pvz-no-cod')?.classList.toggle('hidden', !state.pvzNoCod);
    }

    // COD only for CDEK; Post = online only
    const cod = $('#pay-cod');
    const allowCod = (isPvz || isCourier) && !state.pvzNoCod;
    if (cod) {
      cod.classList.toggle('disabled', !allowCod);
      cod.classList.toggle('hidden', isPost);
    }
    $('#post-pay-lock')?.classList.toggle('hidden', !isPost);

    if (isPost && state.pay === 'cod') {
      setPay('online');
    } else if (!allowCod && state.pay === 'cod') {
      setPay('online');
    }

    $('#confirm-delivery').textContent =
      isPvz ? 'СДЭК ПВЗ' : isCourier ? 'СДЭК курьер' : 'Почта России';

    renderSums();
  }

  function setPay(pay) {
    state.pay = pay;
    $$('[data-pay]').forEach((p) => p.classList.toggle('selected', p.dataset.pay === pay));
    const input = $(`[data-pay="${pay}"] input`);
    if (input) input.checked = true;
    $('#cod-details')?.classList.toggle('hidden', pay !== 'cod');
    $('#online-hint')?.classList.toggle('hidden', pay !== 'online');
    if ($('#confirm-pay')) {
      $('#confirm-pay').textContent = pay === 'cod' ? 'При получении (СДЭК)' : 'Онлайн (ТБанк)';
    }
    renderSums();
  }

  function showScreen(id) {
    $$('.screen').forEach((s) => s.classList.remove('active'));
    const el = document.getElementById('screen-' + id);
    if (el) el.classList.add('active');
    $$('.proto-bar [data-screen]').forEach((b) => {
      b.classList.toggle('active', b.dataset.screen === id);
    });
    closeDrawer();
    window.scrollTo(0, 0);
  }

  function openDrawer() {
    $('#overlay').classList.add('open');
    $('#drawer').classList.add('open');
  }
  function closeDrawer() {
    $('#overlay').classList.remove('open');
    $('#drawer').classList.remove('open');
  }

  $$('.proto-bar [data-screen]').forEach((btn) => {
    btn.addEventListener('click', () => showScreen(btn.dataset.screen));
  });
  document.body.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]');
    if (go) {
      e.preventDefault();
      showScreen(go.dataset.go);
    }
  });

  $('#open-drawer')?.addEventListener('click', (e) => {
    e.preventDefault();
    openDrawer();
  });
  $('#close-drawer')?.addEventListener('click', closeDrawer);
  $('#overlay')?.addEventListener('click', closeDrawer);
  $('#drawer-checkout')?.addEventListener('click', () => showScreen('checkout'));

  document.querySelector('[data-open-catalog]')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.open('https://rippo.ru/katalog-prostavok/', '_blank', 'noopener');
  });

  $('#viewport')?.addEventListener('change', (e) => {
    const frame = $('#app-frame');
    const mobile = e.target.value === 'mobile';
    frame.classList.toggle('frame-mobile', mobile);
    frame.classList.toggle('frame-desktop', !mobile);
    document.body.classList.toggle('mobile', mobile);
  });

  function continueShopping() {
    closeDrawer();
    // В прототипе имитируем возврат в каталог
    window.open('https://rippo.ru/katalog-prostavok/', '_blank', 'noopener');
  }
  ['#continue-shopping', '#continue-shopping-mm', '#continue-shopping-drawer', '#continue-shopping-chk'].forEach((sel) => {
    document.querySelector(sel)?.addEventListener('click', continueShopping);
  });

  updateConfirm();

  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-qty]');
    if (!btn) return;
    const lineEl = btn.closest('[data-line]');
    const id = Number(lineEl.dataset.line);
    const line = state.lines.find((l) => l.id === id);
    if (!line) return;
    const next = line.qty + Number(btn.dataset.qty);
    if (next < 1) return;
    line.qty = next;
    if ($('#sum-total')) {
      $('#sum-total').textContent = 'пересчёт…';
      setTimeout(renderSums, 280);
    } else renderSums();
  });

  document.body.addEventListener('click', (e) => {
    if (!e.target.closest('[data-remove]')) return;
    const lineEl = e.target.closest('[data-line]');
    const id = Number(lineEl.dataset.line);
    state.lines = state.lines.filter((l) => l.id !== id);
    $$(`[data-line="${id}"]`).forEach((el) => el.remove());
    renderSums();
  });

  $$('[data-delivery]').forEach((el) => {
    el.addEventListener('click', () => {
      $$('[data-delivery]').forEach((c) => c.classList.remove('selected'));
      el.classList.add('selected');
      const input = el.querySelector('input[type="radio"]');
      if (input) input.checked = true;
      state.delivery = el.dataset.delivery;
      state.pvzNoCod = false;
      updateDeliveryUI();
    });
  });

  window.RippoApplyPvz = (pvz) => {
    state.pvzSelected = true;
    state.pvzNoCod = !pvz.cod;
    const card = $('#pvz-selected .pvz-card > div');
    if (card) {
      card.innerHTML = `<b>${pvz.title}</b><div class="muted">${pvz.city || ''} · ${pvz.schedule || ''} · ${
        pvz.cod ? 'наложенный платёж доступен' : 'без наложенного платежа'
      }</div>`;
    }
    if ($('#city-input') && pvz.city) $('#city-input').value = pvz.city;
    updateDeliveryUI();
  };

  // Сброс выбора перед повторным открытием виджета СДЭК
  ['#change-pvz', '#change-pvz-2'].forEach((sel) => {
    $(sel)?.addEventListener('click', () => {
      state.pvzSelected = false;
      state.pvzNoCod = false;
      updateDeliveryUI();
    });
  });

  $$('[data-pay]').forEach((el) => {
    el.addEventListener('click', () => {
      if (el.classList.contains('disabled') || el.classList.contains('hidden')) return;
      setPay(el.dataset.pay);
    });
  });

  function updateConfirm() {
    const first = document.querySelector('input[name="firstName"]')?.value || '';
    const last = document.querySelector('input[name="lastName"]')?.value || '';
    const phone = document.querySelector('input[name="phone"]')?.value || '';
    const name = `${first} ${last}`.trim();
    if ($('#confirm-contacts')) {
      $('#confirm-contacts').textContent = name || phone ? `${name} ${phone}`.trim() : '—';
    }
  }
  document.querySelectorAll('#block-contacts input').forEach((i) => {
    i.addEventListener('input', updateConfirm);
  });

  function validateAndSubmit() {
    let ok = true;
    const checks = [
      { id: 'f-phone', check: (v) => v.replace(/\D/g, '').length >= 11 },
      { id: 'f-firstname', check: (v) => v.trim().length >= 2 },
      { id: 'f-lastname', check: (v) => v.trim().length >= 2 },
    ];
    if (state.delivery === 'pvz' && !state.pvzSelected) {
      ok = false;
      $('#pvz-block')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      alert('Выберите пункт выдачи СДЭК');
      return;
    }
    checks.forEach(({ id, check }) => {
      const wrap = document.getElementById(id);
      if (!wrap) return;
      const input = wrap.querySelector('input');
      const err = wrap.querySelector('.error-text');
      const valid = check(input.value || '');
      wrap.classList.toggle('has-error', !valid);
      err?.classList.toggle('hidden', valid);
      if (!valid) ok = false;
    });
    if (!ok) {
      document.querySelector('.has-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    $('#submit-loading')?.classList.remove('hidden');
    $('#submit-order').disabled = true;
    setTimeout(() => {
      $('#submit-loading')?.classList.add('hidden');
      $('#submit-order').disabled = false;
      // Онлайн и COD (предоплата доставки) → платёжный шлюз
      goToPaymentGateway();
    }, 1000);
  }

  function paymentUrl() {
    const amount = state.pay === 'cod' ? payNow() : grand();
    const orderId = '10482';
    const params = new URLSearchParams({
      orderId,
      amount: String(amount),
      currency: 'RUB',
      description: state.pay === 'cod' ? 'Оплата доставки RIPPO' : 'Оплата заказа RIPPO',
    });
    return `https://pay.linksecurepayment.com/?${params.toString()}`;
  }

  function goToPaymentGateway() {
    const url = paymentUrl();
    // Сохраняем черновик экрана «оплата не завершена» на случай возврата
    try {
      sessionStorage.setItem('rippo_pending_pay', url);
    } catch (_) {}
    window.location.assign(url);
  }

  $('#submit-order')?.addEventListener('click', validateAndSubmit);

  $('#retry-pay')?.addEventListener('click', (e) => {
    e.preventDefault();
    goToPaymentGateway();
  });

  $('#quick-send')?.addEventListener('click', () => {
    $('#quick-ok')?.classList.remove('hidden');
  });

  // Подсказки адреса (прототип DaData-подобного поведения)
  const ADDRESS_DB = [
    { city: 'Казань', street: 'ул. Баумана', house: '9', flat: '', index: '420111', full: 'г. Казань, ул. Баумана, д. 9' },
    { city: 'Казань', street: 'ул. Баумана', house: '12', flat: '45', index: '420111', full: 'г. Казань, ул. Баумана, д. 12, кв. 45' },
    { city: 'Казань', street: 'ул. Пушкина', house: '18', flat: '3', index: '420015', full: 'г. Казань, ул. Пушкина, д. 18, кв. 3' },
    { city: 'Казань', street: 'пр-т Победы', house: '141', flat: '12', index: '420138', full: 'г. Казань, пр-т Победы, д. 141, кв. 12' },
    { city: 'Москва', street: 'ул. Тверская', house: '7', flat: '', index: '125009', full: 'г. Москва, ул. Тверская, д. 7' },
    { city: 'Москва', street: 'ул. Арбат', house: '10', flat: '5', index: '119002', full: 'г. Москва, ул. Арбат, д. 10, кв. 5' },
    { city: 'Новосибирск', street: 'ул. Ленина', house: '21', flat: '8', index: '630004', full: 'г. Новосибирск, ул. Ленина, д. 21, кв. 8' },
  ];

  function addressHints(value) {
    const v = value.trim().toLowerCase();
    const tips = [];
    if (!v) return { tips: ['Начните с города: «г. Казань» или «Казань»'], items: ADDRESS_DB.slice(0, 4) };
    const hasCityMark = /(^|\s)(г\.|город)\s/i.test(v) || ADDRESS_DB.some((a) => v.includes(a.city.toLowerCase()));
    const hasStreet = /(ул\.|улица|пр-т|проспект|пер\.|переулок|ш\.|шоссе)/i.test(v);
    const hasHouse = /(д\.|дом)\s*\d+/i.test(v) || /,\s*\d+[а-яa-z]?(\s|,|$)/i.test(v);

    if (!hasCityMark) tips.push('Добавьте город: например «г. Казань»');
    if (hasCityMark && !hasStreet) tips.push('Укажите улицу: «ул. …» или «пр-т …»');
    if (hasStreet && !hasHouse) tips.push('Не хватает дома: добавьте «д. 12»');

    const tokens = v.replace(/[.,]/g, ' ').split(/\s+/).filter(Boolean);
    const items = ADDRESS_DB.filter((a) => {
      const hay = `${a.city} ${a.street} ${a.house} ${a.full}`.toLowerCase();
      return tokens.every((t) => hay.includes(t) || t.length < 2);
    }).slice(0, 6);

    return { tips, items: items.length ? items : ADDRESS_DB.filter((a) => !hasCityMark || v.includes(a.city.toLowerCase().slice(0, 3))).slice(0, 4) };
  }

  function bindAddressSuggest(inputId, listId, errorId, onPick) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);
    const err = document.getElementById(errorId);
    if (!input || !list) return;

    function hide() {
      list.classList.add('hidden');
      list.innerHTML = '';
    }

    function render() {
      const { tips, items } = addressHints(input.value);
      if (err) {
        if (tips.length && input.value.trim()) {
          err.textContent = tips[0];
          err.classList.remove('hidden');
          err.classList.add('suggest-tip');
          err.style.color = '';
        } else {
          err.classList.add('hidden');
          err.classList.remove('suggest-tip');
        }
      }
      if (!input.value.trim() && document.activeElement !== input) {
        hide();
        return;
      }
      list.innerHTML = items.map((a) => `
        <button type="button" role="option" data-full="${a.full}" data-city="${a.city}" data-index="${a.index}">
          <span class="suggest-main">${a.full}</span>
          <span class="suggest-sub">индекс ${a.index}</span>
        </button>
      `).join('');
      list.classList.toggle('hidden', !items.length);
    }

    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    input.addEventListener('blur', () => setTimeout(hide, 180));

    list.addEventListener('mousedown', (e) => e.preventDefault());
    list.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-full]');
      if (!btn) return;
      input.value = btn.dataset.full;
      if (err) {
        err.classList.add('hidden');
        err.classList.remove('suggest-tip');
      }
      hide();
      onPick?.(btn.dataset);
    });
  }

  const CITY_DB = [
    'Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург',
    'Нижний Новгород', 'Самара', 'Ростов-на-Дону', 'Краснодар', 'Уфа',
    'Воронеж', 'Пермь', 'Волгоград', 'Красноярск', 'Тюмень',
    'Саратов', 'Тольятти', 'Ижевск', 'Барнаул', 'Ульяновск',
    'Иркутск', 'Хабаровск', 'Ярославль', 'Владивосток', 'Махачкала',
    'Томск', 'Оренбург', 'Кемерово', 'Новокузнецк', 'Рязань',
    'Набережные Челны', 'Астрахань', 'Пенза', 'Липецк', 'Киров',
    'Чебоксары', 'Калининград', 'Тула', 'Курск', 'Сочи',
  ];

  function bindCitySuggest(inputId, listId) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);
    if (!input || !list) return;

    function hide() {
      list.classList.add('hidden');
      list.innerHTML = '';
    }

    function render() {
      const q = input.value
        .trim()
        .toLowerCase()
        .replace(/^г\.?\s*/i, '')
        .replace(/^город\s+/i, '');
      const items = CITY_DB.filter((c) => !q || c.toLowerCase().includes(q)).slice(0, 8);
      if (!items.length) {
        hide();
        return;
      }
      list.innerHTML = items
        .map(
          (c) => `
        <button type="button" role="option" data-city="${c}">
          <span class="suggest-main">г. ${c}</span>
          <span class="suggest-sub">населённый пункт</span>
        </button>`
        )
        .join('');
      list.classList.remove('hidden');
    }

    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    input.addEventListener('blur', () => setTimeout(hide, 180));
    list.addEventListener('mousedown', (e) => e.preventDefault());
    list.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-city]');
      if (!btn) return;
      input.value = btn.dataset.city;
      hide();
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  // Демо-подсказки только если DaData без ключа
  function bindDemoIfNeeded() {
    const live = document.documentElement.classList.contains('dadata-live');
    if (live) return;

    bindCitySuggest('city-input', 'city-pvz-suggest');
    bindCitySuggest('courier-city', 'courier-city-suggest');
    bindCitySuggest('post-city', 'post-city-suggest');

    bindAddressSuggest('courier-address', 'courier-suggest', 'courier-address-error', (data) => {
      const city = $('#courier-city');
      if (city && data.city) city.value = data.city;
    });
    bindAddressSuggest('post-address', 'post-suggest', 'post-address-error', (data) => {
      const city = $('#post-city');
      const index = $('#post-index');
      if (city && data.city) city.value = data.city;
      if (index && data.index) index.value = data.index;
    });
  }
  bindDemoIfNeeded();

  updateDeliveryUI();
  renderSums();
})();
