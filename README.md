# Selector Picker для OpenCart 3

Расширение для выбора CSS-селекторов элементов на веб-странице. 
Позволяет открыть любую веб-страницу в модальном окне, выбрать элемент на странице и получить его CSS-селектор.

## Содержание

- [Установка](#установка)
- [Использование](#использование)
- [API](#api)
- [Настройка](#настройка)
- [События](#события)
- [Примеры](#примеры)
- [Ограничения](#ограничения)
- [Лицензия](#лицензия)

## Установка

1. Скопируйте файлы из папки `extra` в соответствующую директорию вашего проекта.
2. Подключите файлы в ваш шаблон:

```html
<link rel="stylesheet" href="view/javascript/selector_picker.css">
<script src="view/javascript/selector_picker.js"></script>
```

## Использование

### Базовое использование

```html
<!-- HTML-разметка -->
<div class="form-group">
  <label>URL страницы:</label>
  <div class="input-group">
    <input type="text" id="page-url" class="form-control" placeholder="https://example.com">
    <span class="input-group-btn">
      <button type="button" id="open-selector-btn" class="btn btn-primary">Открыть</button>
    </span>
  </div>
</div>

<div class="form-group">
  <label>CSS-селектор:</label>
  <input type="text" id="css-selector" class="form-control" readonly>
</div>

<script>
// Инициализация модуля
$(document).ready(function() {
  // Инициализация с настройками по умолчанию
  SelectorPicker.init({
    urlInputId: 'page-url',
    selectorInputId: 'css-selector',
    openButtonId: 'open-selector-btn'
  });
});
</script>
```

### Программное открытие селектора

```javascript
// Открытие селектора с указанным URL
SelectorPicker.open('https://example.com');
```

## API

### Методы

#### `SelectorPicker.init(options)`

Инициализирует Расширение с указанными настройками.

```javascript
SelectorPicker.init({
  // Настройки
});
```

#### `SelectorPicker.open(url)`

Открывает модальное окно с селектором для указанного URL.

```javascript
SelectorPicker.open('https://example.com');
```

## Настройка

При инициализации модуля можно передать объект с настройками:

```javascript
SelectorPicker.init({
  // ID элементов
  modalId: 'selector-picker-modal',
  iframeId: 'selector-picker-iframe',
  loaderId: 'selector-picker-loading',
  urlInputId: 'selector-picker-url',
  selectorInputId: 'selector-picker-result',
  openButtonId: 'selector-picker-open',
  
  // Тексты
  modalTitle: 'Выбор элемента на странице',
  modalSize: 'lg',
  modalWidth: '90%',
  modalHeight: '90%',
  loadingText: 'Загрузка страницы...',
  instructionText: 'Наведите курсор на элемент и кликните по нему.',
  cancelButtonText: 'Отмена',
  selectButtonText: 'Выбрать элемент',
  successMessage: 'Селектор "{selector}" успешно выбран!',
  
  // Сообщения об ошибках
  errorMessages: {
    noUrl: 'Пожалуйста, введите URL страницы',
    jqueryNotDefined: 'jQuery не определен',
    bootstrapNotDefined: 'Bootstrap не определен',
    iframeNotFound: 'Элемент iframe не найден',
    sameOriginPolicy: 'Из-за ограничений безопасности браузера...'
  },
  
  // Callback-функции
  onSelect: function(selector) {
    console.log('Выбран селектор:', selector);
  }
});
```

## События

Расширение отправляет сообщения через `window.postMessage` при выборе селектора или отмене выбора:

```javascript
// При выборе селектора
{
  type: 'selector',
  selector: '#example-id'
}

// При отмене выбора
{
  type: 'cancel'
}
```

## Примеры

### Пример 1: Базовое использование

```html
<div class="form-group">
  <label>URL страницы:</label>
  <input type="text" id="my-url" class="form-control" value="https://example.com">
  <button type="button" id="my-button" class="btn btn-primary">Выбрать элемент</button>
</div>

<div class="form-group">
  <label>Результат:</label>
  <input type="text" id="my-result" class="form-control" readonly>
</div>

<script>
$(document).ready(function() {
  SelectorPicker.init({
    urlInputId: 'my-url',
    selectorInputId: 'my-result',
    openButtonId: 'my-button'
  });
});
</script>
```

### Пример 2: Программное открытие с callback-функцией

```javascript
SelectorPicker.init({
  selectorInputId: 'my-result',
  onSelect: function(selector) {
    // Делаем что-то с выбранным селектором
    console.log('Выбран селектор:', selector);
    
    // Например, отправляем AJAX-запрос
    $.ajax({
      url: 'index.php?route=extension/module/my_module/save_selector',
      type: 'POST',
      data: { selector: selector },
      success: function(response) {
        console.log('Селектор сохранен:', response);
      }
    });
  }
});

// Открываем селектор программно
$('#my-custom-button').on('click', function() {
  SelectorPicker.open('https://example.com');
});
```

## Ограничения

1. **Same-Origin Policy**: Из-за ограничений безопасности браузера, невозможно получить доступ к содержимому iframe с другого домена. Используйте страницы с того же домена или настройте CORS.

2. **Зависимости**: Расширение требует jQuery и Bootstrap для работы.

3. **Совместимость с браузерами**: Расширение тестировался в современных браузерах (Chrome, Firefox, Edge). В старых браузерах могут быть проблемы.

## Лицензия

MIT License
