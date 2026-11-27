# RIPPO.ru — проектирование корзины и оформления заказа

Комплект материалов по ТЗ «корзина и оформление заказа» для интернет-магазина [RIPPO.ru](https://rippo.ru).

> По ТЗ **код на сайт не ставится**. Здесь — UX/UI-проект: аудит, сценарии, макеты, кликабельный прототип и спецификации для внедрения на стороне заказчика.

## Ссылки для заказчика

- Репозиторий: https://github.com/whiteeze/rippo-cart-prototype
- Онлайн-просмотр: https://whiteeze.github.io/rippo-cart-prototype/
- Прототип напрямую: https://whiteeze.github.io/rippo-cart-prototype/prototype/

## Как открыть локально

1. Откройте `index.html` в браузере — навигация по всему комплекту.
2. Кликабельный прототип: `prototype/index.html`.
3. Документы для печати в PDF: файлы в `docs/` → Ctrl+P → «Сохранить как PDF».

## Состав сдачи

| Материал | Файл |
|---|---|
| Краткий UX-отчёт | `docs/01-ux-report.html` |
| Вопросы заказчику | `docs/02-questions.html` |
| Схема сценария | `docs/03-user-flow.html` |
| Описание поведения | `docs/04-behavior.html` |
| Таблица полей и текстов | `docs/05-fields-table.html` |
| Сценарии приёмки | `docs/06-acceptance.html` |
| Материалы для реализации | `docs/07-design-specs.html` |
| Wireframes + hi-fi макеты + прототип | `prototype/index.html` |

## Порядок согласования (из ТЗ)

1. **Сейчас:** аудит + схема + вопросы → согласовать логику и суммы.
2. Затем: финальные правки макетов по замечаниям.
3. После приёмки: программирование делает заказчик.

## Стиль RIPPO (токены)

- Жёлтый акцент: `#FDEF39`
- Фон страницы: `#F7F7FB`
- Текст: `#1A1A1A`
- Шрифт: Montserrat
- Зелёный CTA (звонок): `#2F9E44`

## Финальный комплект (`exports/final-kit/`)

После согласования макета:

| Что | Где |
|---|---|
| PDF документов 01–08 | `exports/final-kit/pdf/` |
| PDF макетов экранов | `exports/final-kit/pdf/09-mockups-screens.pdf` |
| PNG экранов | `exports/final-kit/mockups/` |
| Инструкция Figma + ассеты | `exports/final-kit/figma/` |
| Текст письма заказчику | `exports/final-kit/DELIVERY-LETTER.txt` |

## Figma

По ТЗ нужно передать: ссылку can view, исходник `.fig`, PDF макетов.

1. Hi-fi уже в HTML-прототипе (desktop + mobile).
2. PNG для импорта лежат в `exports/final-kit/figma/`.
3. Пошагово: `exports/final-kit/figma/README-FIGMA.md` (html.to.design или импорт PNG → Share can view → Save .fig).

Без входа в аккаунт Figma ссылку и `.fig` создать нельзя — после логина можно доимпортировать экраны за один проход.