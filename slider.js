'use strict';
    var multiItemSlider = (function () {
      return function (selector, config) {
        var
          _mainElement = document.querySelector(selector), // основный элемент блока
          _sliderWrapper = _mainElement.querySelector('.slider__wrapper'), // обертка для .slider-item
          _sliderItems = _mainElement.querySelectorAll('.slider__item'), // элементы (.slider-item)
          _sliderControls = _mainElement.querySelectorAll('.slider__control'), // элементы управления
          _sliderControlUp = _mainElement.querySelector('.slider__control_up'), // кнопка "LEFT"
          _sliderControlRight = _mainElement.querySelector('.slider__control_down'), // кнопка "RIGHT"
          _wrapperHeight = parseFloat(getComputedStyle(_sliderWrapper).height), // ширина обёртки
          _itemHeight = parseFloat(getComputedStyle(_sliderItems[0]).height), // ширина одного элемента    
          _positionTopItem = 0, // позиция левого активного элемента
          _transform = 0, // значение транфсофрмации .slider_wrapper
          _step = _itemHeight / _wrapperHeight * 100, // величина шага (для трансформации)
          _items = [], // массив элементов
          _interval = 0,
          _config = {
            direction: 'down', // направление смены слайдов
            interval: 5000, // интервал между автоматической сменой слайдов
            pause: true // устанавливать ли паузу при поднесении курсора к слайдеру
          };

        for (var key in config) {
          if (key in _config) {
            _config[key] = config[key];
          }
        }

        // наполнение массива _items
        _sliderItems.forEach(function (item, index) {
          _items.push({ item: item, position: index, transform: 0 });
        });

        var position = {
          getItemMin: function () {
            var indexItem = 0;
            _items.forEach(function (item, index) {
              if (item.position < _items[indexItem].position) {
                indexItem = index;
              }
            });
            return indexItem;
          },
          getItemMax: function () {
            var indexItem = 0;
            _items.forEach(function (item, index) {
              if (item.position > _items[indexItem].position) {
                indexItem = index;
              }
            });
            return indexItem;
          },
          getMin: function () {
            return _items[position.getItemMin()].position;
          },
          getMax: function () {
            return _items[position.getItemMax()].position;
          }
        }

        var _transformItem = function (direction) {
          var nextItem;
          if (direction === 'down') {
            _positionTopItem++;
            if ((_positionTopItem + _wrapperHeight / _itemHeight - 1) > position.getMax()) {
              nextItem = position.getItemMin();
              _items[nextItem].position = position.getMax() + 1;
              _items[nextItem].transform += _items.length * 100;
              _items[nextItem].item.style.transform = 'translateY(' + _items[nextItem].transform + '%)';
            }
            _transform -= _step;
          }
          if (direction === 'up') {
            _positionTopItem--;
            if (_positionTopItem < position.getMin()) {
              nextItem = position.getItemMax();
              _items[nextItem].position = position.getMin() - 1;
              _items[nextItem].transform -= _items.length * 100;
              _items[nextItem].item.style.transform = 'translateY(' + _items[nextItem].transform + '%)';
            }
            _transform += _step;
          }
          _sliderWrapper.style.transform = 'translateY(' + _transform + '%)';
        }

        var _cycle = function (direction) {
          if (!_config.isCycling) {
            return;
          }
          _interval = setInterval(function () {
            _transformItem(direction);
          }, _config.interval);
        }

        // обработчик события click для кнопок "назад" и "вперед"
        var _controlClick = function (e) {
          if (this.classList.contains('slider__control')) {
            var direction = this.classList.contains('slider__control_down') ? 'down' : 'up';
            e.preventDefault();
            _transformItem(direction);
            clearInterval(_interval);
            _cycle(_config.direction);
          }         
        };

        var _setUpListeners = function () {
          // добавление к кнопкам "назад" и "вперед" обрботчика _controlClick для событя click
          _sliderControls.forEach(function (item) {
            item.addEventListener('click', _controlClick);
          });
          if (_config.pause && _config.isCycling) {
            _mainElement.addEventListener('mouseenter', function () {
              clearInterval(_interval);
            });
            _mainElement.addEventListener('mouseleave', function () {
              clearInterval(_interval);
              _cycle(_config.direction);
            });
          }
        }

        // инициализация
        _setUpListeners();
        _cycle(_config.direction);

        return {
          down: function () { // метод right
            _transformItem('down');
          },
          up: function () { // метод left
            _transformItem('up');
          },
          stop: function () { // метод stop
            _config.isCycling = false;
            clearInterval(_interval);
          },
          cycle: function () { // метод cycle 
            _config.isCycling = true;
            clearInterval(_interval);
            _cycle();
          }
        }

      }
    }());

    var slider = multiItemSlider('.slider', {
      isCycling: true
    })
