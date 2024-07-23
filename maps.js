module.exports = {
    externalsType: 'script',
    externals: {
        ymaps3: ['https://api-maps.yandex.ru/v3/?apikey=832af240-411d-4bf2-90b1-9bce0eeaa3b8&lang=ru_RU', 'ymaps3']
    }
};

module.exports.maps = async (event, context) => {
    async function getCityName(loc) {
        await ymaps3.ready;
        let map;

        const {
            YMap
        } = ymaps3;

        try {
            document.write('<div id="map" style="display:none"></div>');
            obMap = document.getElementById('map');
            map = new _this.ymap(
                // Передаём ссылку на HTMLElement контейнера
                obMap,
                // Передаём параметры инициализации карты
                {
                    location: {
                        center: [loc.lon, loc.lat], // Координаты центра картs
                        zoom: 12, // Уровень масштабирования
                    },
                }
            );
        }
        catch(e) {
            map = e;
        }
        

        return map;
    }
}