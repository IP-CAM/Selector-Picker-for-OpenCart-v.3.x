/**
 * Selector Picker - модуль для выбора CSS-селекторов элементов на веб-странице
 * 
 * Этот модуль позволяет открыть любую веб-страницу в модальном окне,
 * выбрать элемент на странице и получить его CSS-селектор.
 * 
 * @version 1.0.0
 * @author Tom Opencart
 * @license MIT
 */

// Создаем глобальный объект для модуля
window.SelectorPicker = window.SelectorPicker || {};

// Используем IIFE для изоляции кода
(function(SelectorPicker, $) {
    'use strict';
    
    /**
     * Инициализация модуля
     */
    SelectorPicker.init = function(options) {
        // Настройки по умолчанию
        var settings = $.extend({
            modalId: 'selector-picker-modal',
            iframeId: 'selector-picker-iframe',
            loaderId: 'selector-picker-loading',
            urlInputId: 'selector-picker-url',
            selectorInputId: 'selector-picker-result',
            openButtonId: 'selector-picker-open',
            modalTitle: 'Выбор элемента на странице',
            modalSize: 'lg',
            modalWidth: '90%',
            modalHeight: '90%',
            loadingText: 'Загрузка страницы...',
            instructionText: 'Наведите курсор на элемент, рядом с которым вы хотите разместить контент, и кликните по нему. Селектор элемента будет автоматически добавлен в поле селектора.',
            cancelButtonText: 'Отмена',
            selectButtonText: 'Выбрать элемент',
            successMessage: 'Селектор "{selector}" успешно выбран!',
            errorMessages: {
                noUrl: 'Пожалуйста, введите URL страницы',
                jqueryNotDefined: 'jQuery не определен',
                bootstrapNotDefined: 'Bootstrap не определен',
                iframeNotFound: 'Элемент iframe не найден',
                sameOriginPolicy: 'Из-за ограничений безопасности браузера (Same-Origin Policy), невозможно получить доступ к содержимому страницы с другого домена. Пожалуйста, попробуйте использовать страницу с того же домена.'
            }
        }, options);
        
        // Сохраняем настройки
        SelectorPicker.settings = settings;
        
        // Создаем модальное окно, если его еще нет
        if ($('#' + settings.modalId).length === 0) {
            createModal(settings);
        }
        
        // Настраиваем обработчики событий
        setupEventHandlers(settings);
        
        console.log('SelectorPicker initialized with settings:', settings);
    };
    
    /**
     * Создание модального окна
     */
    function createModal(settings) {
        var modalHtml = 
            '<div class="modal fade" id="' + settings.modalId + '" tabindex="-1" role="dialog" aria-labelledby="' + settings.modalId + '-title">' +
            '  <div class="modal-dialog modal-' + settings.modalSize + '" role="document" style="width: ' + settings.modalWidth + '; height: ' + settings.modalHeight + ';">' +
            '    <div class="modal-content" style="height: 90vh;">' +
            '      <div class="modal-header">' +
            '        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
            '        <h4 class="modal-title" id="' + settings.modalId + '-title">' + settings.modalTitle + '</h4>' +
            '      </div>' +
            '      <div class="modal-body" style="padding: 0; height: calc(100% - 120px);">' +
            '        <div id="' + settings.loaderId + '" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; z-index: 1000;">' +
            '          <i class="fa fa-spinner fa-spin fa-3x"></i>' +
            '          <p>' + settings.loadingText + '</p>' +
            '        </div>' +
            '        <div class="alert alert-info">' +
            '          <p><strong>Инструкция:</strong> ' + settings.instructionText + '</p>' +
            '        </div>' +
            '        <iframe id="' + settings.iframeId + '" style="width: 100%; height: calc(100% - 80px); border: none;"></iframe>' +
            '      </div>' +
            '      <div class="modal-footer">' +
            '        <button type="button" class="btn btn-default" data-dismiss="modal">' + settings.cancelButtonText + '</button>' +
            '        <button type="button" class="btn btn-primary" id="' + settings.modalId + '-select-btn" disabled>' + settings.selectButtonText + '</button>' +
            '      </div>' +
            '    </div>' +
            '  </div>' +
            '</div>';
        
        $('body').append(modalHtml);
        console.log('Modal created with ID:', settings.modalId);
    }
    
    /**
     * Настройка обработчиков событий
     */
    function setupEventHandlers(settings) {
        // Обработчик для кнопки открытия селектора
        $('#' + settings.openButtonId).off('click').on('click', function() {
            SelectorPicker.open();
        });
        
        // Удаляем старые обработчики сообщений
        window.removeEventListener('message', SelectorPicker.messageHandler);
        
        // Добавляем новый обработчик сообщений
        SelectorPicker.messageHandler = function(event) {
            if (event.data && event.data.type === 'selector') {
                var selector = event.data.selector;
                console.log('Selected element:', selector);
                
                // Заполняем поле с селектором
                $('#' + settings.selectorInputId).val(selector);
                
                // Закрываем модальное окно
                $('#' + settings.modalId).modal('hide');
                
                // Показываем уведомление об успешном выборе (только если селектор не пустой)
                if (selector && selector.trim() !== '') {
                    alert(settings.successMessage.replace('{selector}', selector));
                }
                
                // Вызываем callback, если он определен
                if (typeof settings.onSelect === 'function') {
                    settings.onSelect(selector);
                }
            } else if (event.data && event.data.type === 'cancel') {
                // Закрываем модальное окно при отмене
                $('#' + settings.modalId).modal('hide');
            }
        };
        
        window.addEventListener('message', SelectorPicker.messageHandler);
    }
    
    /**
     * Открытие модального окна с селектором
     */
    SelectorPicker.open = function(url) {
        var settings = SelectorPicker.settings;
        
        console.log('SelectorPicker.open called');
        
        // Проверяем, доступен ли jQuery
        if (typeof $ === 'undefined') {
            console.error(settings.errorMessages.jqueryNotDefined);
            alert(settings.errorMessages.jqueryNotDefined);
            return;
        }
        
        // Проверяем, доступен ли Bootstrap
        if (typeof $.fn.modal === 'undefined') {
            console.error(settings.errorMessages.bootstrapNotDefined);
            alert(settings.errorMessages.bootstrapNotDefined);
            return;
        }
        
        // Очищаем предыдущее значение селектора
        $('#' + settings.selectorInputId).val('');
        
        // Если URL не передан, берем его из поля ввода
        if (!url) {
            url = $('#' + settings.urlInputId).val();
        }
        
        console.log('URL value:', url);
        
        if (!url) {
            alert(settings.errorMessages.noUrl);
            return;
        }
        
        // Валидация URL
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
            $('#' + settings.urlInputId).val(url);
            console.log('Updated URL:', url);
        }
        
        // Показываем модальное окно с индикатором загрузки
        $('#' + settings.iframeId).attr('src', 'about:blank');
        
        try {
            $('#' + settings.modalId).modal('show');
            console.log('Modal shown');
            
            // Загружаем iframe только после открытия модального окна
            setTimeout(function() {
                // Показываем индикатор загрузки
                $('#' + settings.loaderId).show();
                
                // Устанавливаем обработчик загрузки перед установкой src
                $('#' + settings.iframeId).off('load').on('load', function() {
                    console.log('Iframe loaded');
                    // Скрываем индикатор загрузки
                    $('#' + settings.loaderId).hide();
                    // Инициализируем селектор
                    SelectorPicker.initPicker();
                });
                
                // Устанавливаем src для iframe
                $('#' + settings.iframeId).attr('src', url);
                console.log('Set iframe src to:', url);
            }, 500);
        } catch (e) {
            console.error('Error showing modal:', e);
            alert('Error showing modal: ' + e.message);
        }
    };
    
    /**
     * Инициализация селектора в iframe
     */
    SelectorPicker.initPicker = function() {
        var settings = SelectorPicker.settings;
        
        try {
            console.log('Initializing selector picker...');
            var iframe = document.getElementById(settings.iframeId);
            
            if (!iframe) {
                console.error(settings.errorMessages.iframeNotFound);
                alert(settings.errorMessages.iframeNotFound);
                return;
            }
            
            var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            var iframeWin = iframe.contentWindow;
            
            // Проверяем, можем ли мы получить доступ к содержимому iframe (Same-Origin Policy)
            if (!iframeDoc || !iframeWin) {
                throw new Error(settings.errorMessages.sameOriginPolicy);
            }
            
            // Пробуем получить доступ к body, чтобы убедиться, что у нас есть доступ
            if (!iframeDoc.body) {
                throw new Error(settings.errorMessages.sameOriginPolicy);
            }
            
            console.log('Successfully accessed iframe content');
            
            // Добавляем CSS для подсветки элементов при наведении
            var style = iframeDoc.createElement('style');
            style.textContent = '.sp-selector-hover {' +
                '    outline: 3px solid #ff5722 !important;' +
                '    background-color: rgba(255, 87, 34, 0.1) !important;' +
                '    position: relative;' +
                '    z-index: 9998;' +
                '}' +
                '' +
                '/* Фиксированный выбор */' +
                '.sp-selector-fixed {' +
                '    outline: 3px solid #4caf50 !important;' +
                '    background-color: rgba(76, 175, 80, 0.1) !important;' +
                '    position: relative;' +
                '    z-index: 9998;' +
                '}' +
                '' +
                '/* Фиксированная панель с информацией о селекторе */' +
                '#sp-selector-tooltip {' +
                '    position: fixed;' +
                '    top: 10px;' +
                '    right: 10px;' +
                '    background: rgba(0, 0, 0, 0.8);' +
                '    color: #fff;' +
                '    padding: 10px 15px;' +
                '    border-radius: 4px;' +
                '    font-family: monospace;' +
                '    font-size: 14px;' +
                '    max-width: 300px;' +
                '    word-break: break-all;' +
                '    z-index: 10000;' +
                '    box-shadow: 0 2px 10px rgba(0,0,0,0.2);' +
                '}' +
                '#sp-selector-tooltip .selector {' +
                '    font-weight: bold;' +
                '    color: #4caf50;' +
                '}' +
                '#sp-selector-tooltip .element-type {' +
                '    color: #2196f3;' +
                '}' +
                '#sp-selector-tooltip .instructions {' +
                '    margin-top: 8px;' +
                '    font-size: 12px;' +
                '    color: #ffeb3b;' +
                '}' +
                '#sp-selector-tooltip .btn {' +
                '    margin-top: 8px;' +
                '    background: #4caf50;' +
                '    color: white;' +
                '    border: none;' +
                '    padding: 5px 10px;' +
                '    border-radius: 3px;' +
                '    cursor: pointer;' +
                '}' +
                '#sp-selector-tooltip .btn:hover {' +
                '    background: #388e3c;' +
                '}';
            iframeDoc.head.appendChild(style);
            
            // Добавляем скрипт для обработки выбора элемента
            var script = document.createElement('script');
            script.text = 'console.log("Script execution started in iframe");\n' +
                'try {\n' +
                '    // Переменные\n' +
                '    var currentElement = null;\n' +
                '    var selectedElement = null;\n' +
                '    var currentSelector = null;\n' +
                '    var selectorFixed = false;\n' +
                '    \n' +
                '    // Создаем панель с информацией о селекторе\n' +
                '    console.log("Creating tooltip panel");\n' +
                '    var tooltipDiv = document.createElement("div");\n' +
                '    tooltipDiv.id = "sp-selector-tooltip";\n' +
                '    tooltipDiv.innerHTML = \'<div class="tooltip-content">\' +\n' +
                '        \'<div><span class="element-type">Элемент:</span> <span id="element-type-value">Наведите на элемент</span></div>\' +\n' +
                '        \'<div><span class="selector">Селектор:</span> <span id="selector-value">Наведите на элемент</span></div>\' +\n' +
                '        \'<div class="instructions">Кликните на элемент, чтобы выбрать его, или нажмите ESC для отмены</div>\' +\n' +
                '        \'<button id="select-btn" class="btn">Использовать текущий селектор</button>\' +\n' +
                '        \'</div>\';\n' +
                '    document.body.appendChild(tooltipDiv);\n' +
                '    console.log("Tooltip panel created and appended to body");\n' +
                '    \n' +
                '    // Обработчик кнопки выбора селектора\n' +
                '    document.getElementById("select-btn").addEventListener("click", function() {\n' +
                '        if (currentSelector) {\n' +
                '            // Отправляем сообщение родительскому окну\n' +
                '            window.parent.postMessage({\n' +
                '                type: "selector",\n' +
                '                selector: currentSelector\n' +
                '            }, "*");\n' +
                '        }\n' +
                '    });\n' +
                '    \n' +
                '    // Обработчик клавиши ESC\n' +
                '    document.addEventListener("keydown", function(e) {\n' +
                '        if (e.key === "Escape") {\n' +
                '            window.parent.postMessage({\n' +
                '                type: "cancel"\n' +
                '            }, "*");\n' +
                '        }\n' +
                '    });\n' +
                '    \n' +
                '    // Добавляем обработчики событий для всех элементов\n' +
                '    document.addEventListener("mouseover", function(e) {\n' +
                '        // Если выбор зафиксирован, не меняем подсветку\n' +
                '        if (selectorFixed) return;\n' +
                '        \n' +
                '        if (currentElement) {\n' +
                '            currentElement.classList.remove("sp-selector-hover");\n' +
                '        }\n' +
                '        \n' +
                '        currentElement = e.target;\n' +
                '        \n' +
                '        // Не выделяем панель с информацией\n' +
                '        if (currentElement.id === "sp-selector-tooltip" || (currentElement.closest && currentElement.closest("#sp-selector-tooltip"))) {\n' +
                '            return;\n' +
                '        }\n' +
                '        \n' +
                '        // Генерируем селектор\n' +
                '        currentSelector = getSelector(currentElement);\n' +
                '        currentElement.classList.add("sp-selector-hover");\n' +
                '        \n' +
                '        // Обновляем информацию в панели\n' +
                '        document.getElementById("element-type-value").textContent = currentElement.tagName.toLowerCase();\n' +
                '        document.getElementById("selector-value").textContent = currentSelector;\n' +
                '        \n' +
                '        // Предотвращаем стандартное поведение\n' +
                '        e.stopPropagation();\n' +
                '    });\n' +
                '    \n' +
                '    document.addEventListener("click", function(e) {\n' +
                '        // Предотвращаем стандартное поведение\n' +
                '        e.preventDefault();\n' +
                '        e.stopPropagation();\n' +
                '        \n' +
                '        // Не обрабатываем клики по панели с информацией\n' +
                '        if (e.target.id === "sp-selector-tooltip" || (e.target.closest && e.target.closest("#sp-selector-tooltip"))) {\n' +
                '            return;\n' +
                '        }\n' +
                '        \n' +
                '        // Выбираем элемент\n' +
                '        selectedElement = e.target;\n' +
                '        \n' +
                '        // Генерируем селектор\n' +
                '        var selector = getSelector(selectedElement);\n' +
                '        currentSelector = selector;\n' +
                '        \n' +
                '        // Обновляем информацию в панели\n' +
                '        document.getElementById("element-type-value").textContent = selectedElement.tagName.toLowerCase();\n' +
                '        document.getElementById("selector-value").textContent = selector;\n' +
                '        \n' +
                '        // Фиксируем выбор\n' +
                '        selectorFixed = true;\n' +
                '        \n' +
                '        // Добавляем класс для фиксированного выбора\n' +
                '        if (currentElement) {\n' +
                '            currentElement.classList.add("sp-selector-fixed");\n' +
                '        }\n' +
                '        \n' +
                '        // Обновляем текст кнопки\n' +
                '        document.getElementById("select-btn").textContent = "Использовать этот селектор";\n' +
                '        \n' +
                '        // Добавляем кнопку для отмены фиксации\n' +
                '        var cancelBtn = document.getElementById("cancel-selection-btn");\n' +
                '        if (!cancelBtn) {\n' +
                '            cancelBtn = document.createElement("button");\n' +
                '            cancelBtn.id = "cancel-selection-btn";\n' +
                '            cancelBtn.className = "btn";\n' +
                '            cancelBtn.style.marginLeft = "10px";\n' +
                '            cancelBtn.style.background = "#f44336";\n' +
                '            cancelBtn.textContent = "Отменить выбор";\n' +
                '            document.getElementById("select-btn").parentNode.appendChild(cancelBtn);\n' +
                '            \n' +
                '            // Добавляем обработчик для кнопки отмены\n' +
                '            cancelBtn.addEventListener("click", function() {\n' +
                '                selectorFixed = false;\n' +
                '                if (currentElement) {\n' +
                '                    currentElement.classList.remove("sp-selector-fixed");\n' +
                '                }\n' +
                '                this.remove();\n' +
                '                document.getElementById("select-btn").textContent = "Использовать текущий селектор";\n' +
                '            });\n' +
                '        }\n' +
                '        \n' +
                '        return false;\n' +
                '    });\n' +
                '    \n' +
                '    // Генерация селектора для элемента\n' +
                '    function getSelector(element) {\n' +
                '        // Пробуем получить ID\n' +
                '        if (element.id) {\n' +
                '            return "#" + element.id;\n' +
                '        }\n' +
                '        \n' +
                '        // Пробуем получить уникальный класс\n' +
                '        if (element.classList && element.classList.length > 0) {\n' +
                '            for (var i = 0; i < element.classList.length; i++) {\n' +
                '                var className = element.classList[i];\n' +
                '                if (className && document.getElementsByClassName(className).length === 1) {\n' +
                '                    return "." + className;\n' +
                '                }\n' +
                '            }\n' +
                '        }\n' +
                '        \n' +
                '        // Генерация селектора по пути в DOM\n' +
                '        var path = [];\n' +
                '        var current = element;\n' +
                '        while (current && current.nodeType === 1) {\n' +
                '            var selector = current.nodeName.toLowerCase();\n' +
                '            if (current.id) {\n' +
                '                selector += "#" + current.id;\n' +
                '                path.unshift(selector);\n' +
                '                break;\n' +
                '            } else {\n' +
                '                var sibling = current;\n' +
                '                var nth = 1;\n' +
                '                while (sibling = sibling.previousElementSibling) {\n' +
                '                    if (sibling.nodeName.toLowerCase() === selector) nth++;\n' +
                '                }\n' +
                '                if (nth !== 1) selector += ":nth-of-type(" + nth + ")";\n' +
                '            }\n' +
                '            path.unshift(selector);\n' +
                '            current = current.parentNode;\n' +
                '        }\n' +
                '        return path.join(" > ");\n' +
                '    }\n' +
                '    \n' +
                '    console.log("All event handlers set up in iframe");\n' +
                '} catch(err) {\n' +
                '    console.error("Error in iframe script:", err);\n' +
                '    alert("Error in iframe script: " + err.message);\n' +
                '}';
            
            iframeDoc.body.appendChild(script);
            
            console.log('Selector picker initialized');
        } catch (e) {
            console.error('Error initializing selector picker:', e);
            
            // Показываем сообщение об ошибке
            var errorMessage = 'Ошибка при инициализации выбора селектора. ';
            
            // Проверяем, является ли это ошибкой Same-Origin Policy
            if (e.message.indexOf('Same-Origin Policy') !== -1) {
                errorMessage += settings.errorMessages.sameOriginPolicy;
            } else {
                errorMessage += e.message;
            }
            
            alert(errorMessage);
            
            // Закрываем модальное окно
            $('#' + settings.modalId).modal('hide');
        }
    };
    
})(window.SelectorPicker, jQuery);
