'use strict';

initMap();

async function initMap() {
    // Промис `ymaps3.ready` будет зарезолвлен, когда загрузятся все компоненты основного модуля API
    await ymaps3.ready;

    console.log(ymaps3)

    const {YMap, YMapDefaultSchemeLayer, YMapControls} = ymaps3;
    const {YMapZoomControl} = await ymaps3.import('@yandex/ymaps3-controls@0.0.1');

    // Иницилиазируем карту
    const map = new YMap(
        // Передаём ссылку на HTMLElement контейнера
        document.getElementById('map'),

        // Передаём параметры инициализации карты
        {
            location: {
                // Координаты центра карты
                center: [37.588144, 55.733842],

                // Уровень масштабирования
                zoom: 10
            },
            behaviors: ['drag', 'scrollZoom', 'pinchZoom', 'dblClick']
        }
    );
   
    console.log(YMapControls)

    // Добавляем слой для отображения схематической карты
    map.addChild(new YMapDefaultSchemeLayer());

    map.addChild( new YMapControls({position: 'right'}).addChild(new YMapZoomControl({})) );
}