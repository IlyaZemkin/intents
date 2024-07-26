module.exports.handler = async (event, context) => {
    const { version, session, request } = event;
    const GEOLOCATION_ALLOWED = "Geolocation.Allowed";
    const GEOLOCATION_REJECTED = "Geolocation.Rejected";
    const STATE_REQUEST_KEY = "session";
    const STATE_RESPONSE_KEY = "session_state";

    //Хранение пользовательских запросов
    let city = getState("city"); //город
    let eventType = getState("eventType"); //тип события
    let eventName = getState("eventName"); //название события
    let location = getState("location"); //местоположение
    let intents = event.request.nlu.intents;

    let sheet = {

    };

    function getState(name) {
        let state = context._data.state ? context._data.state.session : false;
        return state[name] ? state[name] : false;
    }

    function button(title, payload = false, url = false, hide = false) {
        let button = {
            title: title,
            hide: hide,
        };

        if (payload) {
            button.payload = payload;
        }
        else button.payload = {};

        if (url) {
            button.url = url;
        }

        button.type = 'ButtonPressed';

        return button;
    }

    function make_response(
        options = {
            text: "",
            tts: false,
            state: {},
            buttons: [],
            directives: {},
            card: {},
            hints: {}
        }
    ) {
        if (options.text.length == 0) {
            options.text = "Задайте свой вопрос";
        }

        let response = {
            response: {
                text: options.text,
            },
            version: "1.0",
        };

        if(options.tts) {
            response.response.tts = options.tts;
        }

        if (options.buttons) {
            response.response.buttons = options.buttons;
        }

        if (options.directives) {
            response.response.directives = options.directives;
        }

        if (options.state) {
            response[STATE_RESPONSE_KEY] = options.state;
        }

        if(options.card) {
            response.response.card = options.card;
        }

        if(options.hints) {
            response.response.hints = options.hints;
        }

        return response;
    }

    function welcome(event) {
        if (location) {
            return make_response({
                text: "Куда вы хотели бы сходить?",
                buttons: [
                    button("В кино", false, false, true),
                    button("В театр", false, false, true),
                    button("На концерт", false, false, true),
                ],
            });
        } else {
            return make_response({
                text: "Вас приветсвуте помощник по подбору мероприятий.",
                directives: {
                    request_geolocation: {},
                },
            });
        }
    }

    function fallback(event, methodName) {
        text = `Извините, я вас не понял. Переформулируйте свой запрос. ${methodName}`;
        return make_response({
            text: text,
            //tts: '<audio-voice id="997614/8fd63b6c168a70fb3750" medium />',
            tts: text
        });
    }

    async function getCityName(loc) {
        var url = "http://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address";
        var token = "7b2755b3e17759a5541088f65d7b111701408985";
        var query = { lat: loc.lat, lon: loc.lon, count: 1, ratius: 100 };
        
        var options = {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": "Token " + token
            },
            body: JSON.stringify(query)
        }
        
        result = await fetch(url, options);
        return await result.text();
    }

    async function GeolocationCallback(event, state) {
        if (event.session.location) {
            let location = event.session.location;
            let newState = state;

            newState.location = location;
            city = await getCityName(location);
            suggestion = JSON.parse(city).suggestions[0];
            newState.city = {
                title: suggestion.data.city,
                code: suggestion.data.region_iso_code
            };

            return make_response({
                text: "Куда вы хотели бы сходить?",
                buttons: [
                    button("В кино", false, false, true),
                    button("В театр", false, false, true),
                    button("На концерт", false, false, true),
                ],
                state: newState,
            });
        } else {
            let text = `К сожалению, мне не удалось получить ваши координаты. 
            Для дальнейшей работы навыка, требуется разрешить доступ к геопозиции.`;
            return make_response({
                text: text,
                directives: {
                    request_geolocation: {},
                },
            });
        }
    }

    function AboutType(event, state) {
        eventType = intent.slots.event.value;
        text = "На какое время?";
        return make_response({ text: text, tts: text, state: state });
    }

    async function getListFilms() {
        let url = 'https://kudago.com/public-api/v1.4/movies/?lang=&fields=&expand=&order_by=&text_format=&ids=&location=krd&premiering_in_location=&actual_since=&actual_until=';
    
        var options = {
            method: "GET",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        }
        
        result = await fetch(url, options);
        return await result.text();
    }

    async function ChoiceEvent(event, state) {
        let value = request.nlu.intents.choice_event.slots.event.value;

        let sListFilms = await getListFilms();
        let listFilms = JSON.parse(sListFilms);
        let arBtns = [];

        if(listFilms.results) {
            listFilms.results.forEach(item => {
                arBtns.push(button(item.title, false, false, true));
            });
        }
        
        let newState = state;

        newState.eventType = value;

        switch (value) {
            case "cinema":

                //Отбираем афишу

                return make_response({
                    text: "На какой фильм?",
                    //выводим афишу в виде кнопок, ниже пример
                    buttons: arBtns,
                    state: newState,
                });
                break;

            case "piece":
                return make_response({
                    text: "На какой спектакль?",
                    state: newState,
                });
                break;

            case "concert":
                return make_response({
                    text: "На какой концерт вы хотели бы сходить?",
                    state: newState,
                });
                break;

            default:
                return false;
                break;
        }
    }

    function SetEventName(event, state) {
        let eventTypeName;
        text = 'Вот что я могу вам предложить';

        state.eventName = event.request.nlu.tokens;
        state.eventCode = request.nlu.intents.set_event_name.slots.eventname.value;

        eventTypeName = state.eventName;        

        return make_response({
            text: text,
            tts: text,
            state: state,
            buttons: [
                button(`Расскажи о ${eventTypeName}`),
                button("Покажи расписание")
            ],
        });
    }

    async function AboutEvent(event, state) {
        let schedule = await GetSchedule(state.eventName[0]);

        state.schedule = JSON.parse(schedule);


        // switch(event.request.intents.about_event.slots.eventname.value) {
        //     case 'avatar':
                text = state.schedule.docs[0].description;
                
                return make_response({
                    text: text,
                    tts: text,
                    state: state,
                    // card: {
                    //     type: "BigImage",
                    //     image_id: '997614/8fd63b6c168a70fb3750',
                    //     description: text
                    // }
                })
        //     break;
        // }
    }

    async function GetSchedule(query) {
        //var url = 'https://kudago.com/public-api/v1.4/movies/1705/showings/?lang=&fields=&expand=&order_by=&location=&actual_since=1444385206&actual_until=1455495406&place=&is_free=';


        var url = "https://api.kinopoisk.dev/v1.4/movie/search?page=1&limit=1&query=" + query;
        var token = "KDBWWCN-SFXM43X-GB814A7-Y89XAV7";
        
        var options = {
            method: "GET",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-API-KEY": token
            }
        }
        
        result = await fetch(url, options);
        return await result.text();
    }

    async function SetSchedule(event, state) {
        let schedule = await GetSchedule(state.eventName[0]);

        state.schedule = JSON.parse(schedule);

        return make_response({
            text: 'text',
            state: state
        })
    }

    intents = request.nlu.intents;
    let state = event.state[STATE_REQUEST_KEY] || {};
    let response;

    if (event.session.new) {
        return welcome(event);
    } 
    else if (event.session.location && intents.set_city) {
        return await GeolocationCallback(event, state);
    } 
    else if (Object.keys(intents).length > 0) {
        if (intents.choice_event) {
            response = await ChoiceEvent(event, state);
        }

        if (intents.about_event) {
            response = await AboutEvent(event, state);
        }

        if(intents.set_event_name) {
            response = SetEventName(event, state);
        }

        if(intents.show_schedule) {
            response = await SetSchedule(event, state);
        }

        return response;
    } 
    else if(request.type === 'ButtonPressed' && Object.keys(intents).length == 0) {
        return make_response({text: 'test'});
    }
    
    else {
        let directiveType = event.request.type;
        return fallback(event, `Общий сброс. ${directiveType}`);
    }
};