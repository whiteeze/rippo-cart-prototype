# Figma — как закрыть пункт ТЗ за 15–20 минут

Нужно передать заказчику:

1. Ссылку на файл Figma с доступом **can view** (просмотр + inspect / экспорт).  
2. Файл `.fig`.  
3. PDF макетов из Figma (или уже готовый `../pdf/09-mockups-screens.pdf`).

## Быстрый путь (рекомендуется)

1. Откройте https://www.figma.com и войдите в аккаунт.  
2. **New design file** → назовите `RIPPO — корзина и оформление`.  
3. Установите плагин **html.to.design** (или **Figma to HTML** / импорт изображений).  
4. Импортируйте онлайн-прототип:  
   `https://whiteeze.github.io/rippo-cart-prototype/prototype/?v=20261127f`  
   Экраны: Корзина · Оформление · Mobile 390 · Состояния доставки · Успех.  
5. Либо перетащите PNG из этой папки на фреймы:
   - `01-desktop-cart.png`
   - `02-desktop-checkout-top.png`
   - `03-desktop-delivery-pay.png`
   - `04-desktop-cod.png`
   - `05-mobile-cart.png`
   - `06-mobile-checkout-delivery.png`
   - `07-desktop-delivery-states.png`
   - `08-desktop-success.png`
6. Разложите по страницам/секциям: **Desktop** / **Mobile 390**.  
7. Share → **Anyone with the link can view** (или пригласите email заказчика с правом **can view**).  
8. Скопируйте ссылку.  
9. Меню файла → **Save local copy** / экспорт `.fig` → положите в `exports/final-kit/figma/RIPPO-cart-checkout.fig`.  
10. File → Export frames → PDF **или** используйте уже собранный `09-mockups-screens.pdf`.

## Что написать в доступе

«Ссылка на Figma (просмотр параметров и экспорт): …  
Исходник .fig во вложении.  
PDF макетов — во вложении / экспорт из Figma.»

## Если нужна помощь агента

Войдите в Figma в браузере Cursor и напишите «продолжи Figma» — импортируем экраны и выложим ссылку + `.fig`.
