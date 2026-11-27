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
    const empty = state.lines.length === 0;
    const qty = qtyTotal();

    if ($('#sum-goods')) $('#sum-goods').textContent = money(g);
    if ($('#sum-discount')) $('#sum-discount').textContent = '− ' + money(d);
    if ($('#sum-after')) $('#sum-after').textContent = money(a);
    if ($('#sum-total')) $('#sum-total').textContent = money(a);
    $$('#cart-sum-head, .apdPriceJs, .header__sticky-counter > .cart-total-text').forEach((el) => {
      el.textContent = money(a);
    });
    if ($('#drawer-sum')) $('#drawer-sum').textContent = money(a);
    if ($('#drawer-goods')) $('#drawer-goods').textContent = money(g);
    if ($('#drawer-discount')) $('#drawer-discount').textContent = '− ' + money(d);
    if ($('#drawer-empty')) $('#drawer-empty').hidden = !empty;
    // Все счётчики корзины (шапка + sticky)
    $$('.cart-total-counter, #cart-count').forEach((el) => {
      el.textContent = String(qty);
    });

    // Нулевую скидку скрываем — не выглядит как заглушка
    $$('#sum-discount, #chk-discount, #drawer-discount').forEach((el) => {
      const row = el.closest('.summary-row, tr');
      if (row) row.classList.toggle('hidden', d <= 0);
    });
    $$('#sum-after').forEach((el) => {
      el.closest('.summary-row')?.classList.toggle('hidden', d <= 0);
    });

    const goodsLabel = document.querySelector('#cart-summary .summary-row span.dim');
    if (goodsLabel && /Товары/.test(goodsLabel.textContent)) {
      goodsLabel.textContent = `Товары (${qty} компл.)`;
    }
    if ($('#confirm-qty')) $('#confirm-qty').textContent = `${qty} комплект(ов)`;

    $$('[data-line]').forEach((el) => {
      const id = Number(el.dataset.line);
      const line = state.lines.find((l) => l.id === id);
      if (!line) {
        el.hidden = true;
        return;
      }
      el.hidden = false;
      const qtyEl = el.querySelector('.qty-val');
      const sumEl = el.querySelector('.line-sum');
      if (qtyEl) {
        if (qtyEl.tagName === 'INPUT') qtyEl.value = String(line.qty);
        else qtyEl.textContent = String(line.qty);
      }
      if (sumEl) sumEl.textContent = money(line.unit * line.qty);
    });

    // Пустая корзина
    $('#cart-empty')?.toggleAttribute('hidden', !empty);
    $$('.cart__list').forEach((list) => list.classList.toggle('is-empty', empty));
    const checkoutBtns = $$('#cart-summary [data-go="checkout"], #screen-cart [data-go="checkout"], #drawer-checkout');
    checkoutBtns.forEach((btn) => {
      btn.disabled = empty;
      btn.classList.toggle('is-disabled', empty);
      btn.setAttribute('aria-disabled', empty ? 'true' : 'false');
    });
    $('#cart-summary')?.classList.toggle('cart-summary--empty', empty);

    if ($('#chk-goods')) $('#chk-goods').textContent = money(g);
    if ($('#chk-discount')) $('#chk-discount').textContent = '− ' + money(d);
    if ($('#chk-delivery')) $('#chk-delivery').textContent = money(del);
    if ($('#chk-fee')) $('#chk-fee').textContent = money(fee);
    if ($('#chk-total')) $('#chk-total').textContent = money(grand());

    const feeRow = $('#chk-fee-row');
    const split = $('#chk-split');
    if (feeRow) feeRow.classList.toggle('hidden', state.pay !== 'cod');
    if (split) split.classList.toggle('hidden', state.pay !== 'cod');
    if ($('#chk-now')) {
      $('#chk-now').innerHTML = `${money(payNow())} <span class="dim">(доставка)</span>`;
    }
    if ($('#chk-later')) {
      $('#chk-later').innerHTML = `${money(payLater())} <span class="dim">(товар + комиссия)</span>`;
    }

    // COD dual block
    if ($('#cod-goods')) $('#cod-goods').textContent = money(g);
    if ($('#cod-del')) $('#cod-del').textContent = money(del);
    if ($('#cod-now')) {
      $('#cod-now').innerHTML = `${money(deliveryCost())} <span class="dim">(доставка)</span>`;
    }
    if ($('#cod-later')) {
      $('#cod-later').innerHTML = `${money(payLater())} <span class="dim">(товар + комиссия)</span>`;
    }
    if ($('#cod-fee')) $('#cod-fee').textContent = money(fee);
    if ($('#cod-grand')) $('#cod-grand').textContent = money(grand());
  }

  function updateDeliveryUI() {
    const isPvz = state.delivery === 'pvz';
    const isCourier = state.delivery === 'courier';
    const isPost = state.delivery === 'post';

    $('#addr-pvz')?.classList.toggle('hidden', !isPvz);
    $('#addr-door')?.classList.toggle('hidden', isPvz);
    $('#pvz-fields')?.classList.toggle('hidden', !isPvz);
    $('#courier-fields')?.classList.toggle('hidden', !isCourier);
    $('#post-fields')?.classList.toggle('hidden', !isPost);
    $('#f-index')?.classList.toggle('hidden', !isPost);

    const title = $('#address-step-title');
    if (title) {
      title.textContent = isPvz
        ? 'Населённый пункт и пункт выдачи'
        : isPost
          ? 'Адрес для Почты России'
          : 'Адрес доставки до двери';
    }

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

    if ($('#confirm-delivery')) {
      $('#confirm-delivery').textContent =
        isPvz ? 'СДЭК ПВЗ' : isCourier ? 'СДЭК курьер' : 'Почта России';
    }

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
    closeMobileCatalog();
    window.scrollTo(0, 0);
  }

  function isMobileViewport() {
    return document.body.classList.contains('mobile');
  }
  function openDrawer() {
    // Mobile 390 — без выезжающей карточки, только экран корзины
    if (isMobileViewport()) {
      showScreen('cart');
      return;
    }
    $('#overlay').classList.add('open');
    $('#drawer').classList.add('open');
  }
  function closeDrawer() {
    $('#overlay')?.classList.remove('open');
    $('#drawer')?.classList.remove('open');
  }

  $$('.proto-bar [data-screen]').forEach((btn) => {
    btn.addEventListener('click', () => showScreen(btn.dataset.screen));
  });
  document.body.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]');
    if (!go) return;
    if (go.disabled || go.getAttribute('aria-disabled') === 'true' || go.classList.contains('is-disabled')) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    showScreen(go.dataset.go);
  });

  $('#open-drawer')?.addEventListener('click', (e) => {
    e.preventDefault();
    openDrawer();
  });
  $('#close-drawer')?.addEventListener('click', closeDrawer);
  $('#drawer-clear')?.addEventListener('click', () => {
    state.lines = [];
    $$('[data-line]').forEach((el) => el.remove());
    renderSums();
  });
  $('#overlay')?.addEventListener('click', closeDrawer);
  $('#drawer-checkout')?.addEventListener('click', (e) => {
    if (!state.lines.length) {
      e.preventDefault();
      return;
    }
    showScreen('checkout');
  });

  document.querySelector('[data-open-catalog]')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.open('https://rippo.ru/katalog-prostavok/', '_blank', 'noopener');
  });

  const realPhone = window.matchMedia('(max-width: 600px)');
  function applyViewport(mobile) {
    const shell = $('#site-shell') || $('#app-frame');
    shell.classList.toggle('frame-mobile', mobile);
    shell.classList.toggle('frame-desktop', !mobile);
    document.body.classList.toggle('mobile', mobile);
    document.body.classList.toggle('real-phone', mobile && realPhone.matches);
    const sel = $('#viewport');
    if (sel) sel.value = mobile ? 'mobile' : 'desktop';
    if (mobile) closeDrawer();
  }
  // На настоящем телефоне сразу включаем мобильную версию (без рамки)
  if (realPhone.matches) applyViewport(true);

  $('#viewport')?.addEventListener('change', (e) => {
    const mobile = e.target.value === 'mobile';
    applyViewport(mobile);
    closeMobileCatalog();
  });

  function goCartOrDrawer(e) {
    e.preventDefault();
    if (isMobileViewport()) showScreen('cart');
    else openDrawer();
  }
  $('#open-drawer-mobile')?.addEventListener('click', goCartOrDrawer);
  document.querySelector('.js-cart-trigger')?.addEventListener('click', (e) => {
    if (e.currentTarget.id === 'open-drawer-mobile') return;
    goCartOrDrawer(e);
  });

  /* —— Mobile catalog menu (как на rippo.ru) —— */
  function openMobileCatalog() {
    const menu = $('#mobile-menu-links');
    if (!menu) return;
    menu.hidden = false;
    menu.classList.add('open');
    $('#mobile-menu-toggle')?.setAttribute('aria-expanded', 'true');
  }
  function closeMobileCatalog() {
    const menu = $('#mobile-menu-links');
    if (!menu) return;
    menu.classList.remove('open');
    menu.hidden = true;
    $('#mobile-menu-toggle')?.setAttribute('aria-expanded', 'false');
  }

  $('#mobile-menu-toggle')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const menu = $('#mobile-menu-links');
    if (menu?.classList.contains('open')) closeMobileCatalog();
    else openMobileCatalog();
  });
  document.addEventListener('click', (e) => {
    const menu = $('#mobile-menu-links');
    if (!menu?.classList.contains('open')) return;
    if (e.target.closest('#mobile-menu-links') || e.target.closest('#mobile-menu-toggle')) return;
    closeMobileCatalog();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileCatalog();
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
    if (state.delivery === 'pvz') {
      const city = ($('#city-input')?.value || '').trim();
      if (!city) {
        alert('Укажите населённый пункт');
        $('#city-input')?.focus();
        return;
      }
      if (!state.pvzSelected) {
        $('#pvz-block')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        alert('Выберите пункт выдачи СДЭК на карте');
        return;
      }
    }
    if (state.delivery !== 'pvz') {
      const addr = ($('#checkout-address-main')?.value || '').trim();
      const street = ($('#door-street')?.value || '').trim();
      if (!addr && !street) {
        alert('Укажите адрес доставки');
        $('#checkout-address-main')?.focus();
        return;
      }
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
    const nameInput = $('#screen-quick input[data-quick="name"]');
    const phoneInput = $('#screen-quick input[data-quick="phone"]');
    const nameOk = (nameInput?.value || '').trim().length >= 2;
    const phoneOk = (phoneInput?.value || '').replace(/\D/g, '').length >= 11;
    $('#quick-name-field')?.classList.toggle('has-error', !nameOk);
    $('#quick-phone-field')?.classList.toggle('has-error', !phoneOk);
    if (!nameOk || !phoneOk) {
      $('#quick-ok')?.classList.add('hidden');
      return;
    }
    $('#quick-ok')?.classList.remove('hidden');
  });

  // Callback / консультация — заглушка модалки прототипа
  function openCallbackStub(e) {
    if (e) e.preventDefault();
    const modal = $('#callback-stub');
    const overlay = $('#callback-stub-overlay');
    if (!modal) return;
    modal.hidden = false;
    if (overlay) overlay.hidden = false;
    requestAnimationFrame(() => {
      modal.classList.add('open');
      overlay?.classList.add('open');
    });
  }
  function closeCallbackStub() {
    const modal = $('#callback-stub');
    const overlay = $('#callback-stub-overlay');
    modal?.classList.remove('open');
    overlay?.classList.remove('open');
    setTimeout(() => {
      if (modal && !modal.classList.contains('open')) modal.hidden = true;
      if (overlay && !overlay.classList.contains('open')) overlay.hidden = true;
    }, 200);
  }
  document.body.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-fancybox], [href="#callBack"], [href="#callback-footer"], .hf92j3dks8-btn1, .callback_a');
    if (!trigger) return;
    if (trigger.matches('a[href^="tel:"]')) return;
    openCallbackStub(e);
  });
  $('#callback-stub-close')?.addEventListener('click', closeCallbackStub);
  $('#callback-stub-overlay')?.addEventListener('click', closeCallbackStub);

  // «Мобильная корзина» в proto-bar = Mobile 390 + экран корзины
  $('#goto-mobile-cart')?.addEventListener('click', () => {
    applyViewport(true);
    showScreen('cart');
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

  function fillDoorAddressFields(data) {
    const map = {
      'door-city': data.city,
      'door-street': data.street,
      'door-house': data.house,
      'door-apart': data.flat,
      'post-index': data.index,
      'courier-city': data.city,
      'post-city': data.city,
    };
    Object.entries(map).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el && val != null) el.value = val;
    });
    if (data.city) {
      const region = $('#door-region');
      if (region && !region.value) region.value = data.city === 'Москва' ? 'г. Москва' : data.city === 'Казань' ? 'Респ. Татарстан' : '';
    }
    const hint = $('#address-autofill-hint');
    if (hint) {
      hint.textContent = `Адрес подставлен: ${data.city}, ${data.street}, д. ${data.house}${data.flat ? ', кв. ' + data.flat : ''}. При необходимости поправьте поля ниже.`;
      hint.classList.add('field-hint--ok');
    }
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
        <button type="button" role="option"
          data-full="${a.full}" data-city="${a.city}" data-index="${a.index}"
          data-street="${a.street}" data-house="${a.house}" data-flat="${a.flat || ''}">
          <span class="suggest-main">${a.full}</span>
          <span class="suggest-sub">индекс ${a.index} · поля заполнятся автоматически</span>
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

    bindAddressSuggest('checkout-address-main', 'checkout-address-suggest', 'checkout-address-error', (data) => {
      fillDoorAddressFields(data);
    });
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
