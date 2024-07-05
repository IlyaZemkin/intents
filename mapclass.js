import { markersGeoJsonSource } from "./common";

class MyMap {
    constructor(
        options = {
            container: "map", //контейнер карты, указатель на идентификатор
            points: {}, //отметки на карте
            cluster: false, //кластеризация карты
            center: [45.035469, 38.975309], //центр карты
            zoom: 10, // приближение 1-12
            behaviors: [], // события 'drag', 'scrollZoom', 'pinchZoom', 'dblClick'
            styles: {}, //настройка стилей
        }
    ) {
        this.points = options.points || {};
        this.cluster = options.cluster || false;
        this.center = options.center || [38.975309, 45.035469];
        this.zoom = options.zoom || 10;
        this.behaviors = options.behaviors || [
            "drag",
            "scrollZoom",
            "pinchZoom",
            "dblClick",
        ];
        this.styles = options.styles || {};
        this.container = options.container;
        this.isCluster = options.isCluster || false;
    }

    async Init() {
        await this.InitCore();
        this.InitMap();
        this.SetSchema();
        this.SetTools();

        if (this.isCluster) this.SetCluster();
        else this.SetMarkers();
    }

    async InitCore() {
        //асинхронный метод
        await ymaps3.ready; //ожтдание подключения ядра карт
        const {
            YMap,
            YMapDefaultSchemeLayer,
            YMapFeatureDataSource,
            YMapControls,
            YMapMarker,
            YMapLayer,
            YMapDefaultFeaturesLayer,
        } = ymaps3;
        const { YMapZoomControl } = await ymaps3.import(
            "@yandex/ymaps3-controls@0.0.1"
        );
        const { YMapDefaultMarker } = await ymaps3.import(
            "@yandex/ymaps3-markers@0.0.1"
        );
        const { Feature, YMapClusterer, clusterByGrid } = await ymaps3.import(
            "@yandex/ymaps3-clusterer@0.0.1"
        );

        this.ymap = YMap;
        this.ymapDefaultSchemeLayer = YMapDefaultSchemeLayer;
        this.ymapControls = YMapControls;
        this.ymapZoomControl = YMapZoomControl;
        this.ymapMarker = YMapMarker;
        this.ymapFeatureDataSource = YMapFeatureDataSource;
        this.ymapDefaultFeaturesLayer = YMapDefaultFeaturesLayer;
        this.ymapDefaultMarker = YMapDefaultMarker;
        this.Feature = Feature;
        this.ymapLayer = YMapLayer;
        this.ymapClusterer = YMapClusterer;
        this.clusterByGrid = clusterByGrid;
    }

    InitMap() {
        let _this = this;
        _this.obMap = document.getElementById(_this.container);

        _this.map = new _this.ymap(
            // Передаём ссылку на HTMLElement контейнера
            _this.obMap,

            // Передаём параметры инициализации карты
            {
                location: {
                    center: _this.center, // Координаты центра картs
                    zoom: _this.zoom, // Уровень масштабирования
                },
                behaviors: _this.behaviors,
            },
            [
                // Добавление схемы слоев карты
                new _this.ymapDefaultSchemeLayer({}),
                // добавление геообъектов на карту
                new _this.ymapDefaultFeaturesLayer({}),
            ]
        );
    }

    SetSchema() {
        const layer = new this.ymapDefaultSchemeLayer({
            customization: [
                // Делаем прозрачными все геометрии водных объектов.
                {
                    tags: {
                        all: ["water"],
                    },
                    elements: "geometry",
                    stylers: [
                        {
                            opacity: 0,
                        },
                    ],
                },
                // Меняем цвет подписей для всех POI и узлов сети общественного транспорта.
                {
                    tags: {
                        any: ["poi", "transit_location"],
                    },
                    elements: "label.text.fill",
                    stylers: [
                        {
                            color: "#0000DD",
                        },
                    ],
                },
            ],
        });
        this.map.addChild(layer);
    }

    SetTools() {
        this.map.addChild(
            new this.ymapControls({ position: "right" }).addChild(
                new this.ymapZoomControl({})
            )
        );
    }

    SetMarkers() {
        let _this = this;
        if (this.points.length > 0) {
            console.log(this.points);
            this.points.forEach((markerSource) => {
                const marker = new _this.ymapDefaultMarker(markerSource);
                _this.map.addChild(marker);
            });
        }
    }

    SetCluster() {
        let _this = this;
        let points = [];

        _this.map.addChild(new _this.ymapDefaultSchemeLayer({}))
        .addChild(new _this.ymapFeatureDataSource({id: 'clusterer-source'}))
        .addChild(new _this.ymapLayer({source: 'clusterer-source', type: 'markers', zIndex: 1800}));

        const contentPin = document.createElement('div');
          
        //contentPin.innerHTML = '<img src="../pin.svg" class="pin">';

        function circle(count) {
            const circle = document.createElement('div');
            circle.classList.add('circle');
            circle.innerHTML = `
                <div class="circle-content">
                    <span class="circle-text">${count}</span>
                </div>
            `;
            return circle;
        }

        this.points.forEach((item, index) => {
            points.push({
                type: "Feature",
                id: index.toString,
                geometry: {
                    type: "Point",
                    coordinates: item.coordinates,
                    title: item.title,
                    subtitle: item.subtitle,
                    color: item.color,
                },
            });
        });

        const marker = (feature) =>
            new _this.ymapMarker(
                {
                    coordinates: feature.geometry.coordinates,
                    source: "clusterer-source",
                },
                contentPin.cloneNode(true)
            );

        const cluster = (coordinates, features) =>
            new _this.ymapMarker(
                {
                    coordinates,
                    source: "clusterer-source",
                },
                circle(features.length).cloneNode(true)
            );

        const clusterer = new this.ymapClusterer({
            method: _this.clusterByGrid({ gridSize: 128 }),
            features: points,
            marker,
            cluster,
        });
        this.map.addChild(clusterer);
    }
}

const map = new MyMap({
    container: "map",
    points: markersGeoJsonSource,
    isCluster: true,
});
map.Init();