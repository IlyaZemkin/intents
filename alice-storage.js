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

        if (url) {
            button.url = url;
        }

        return button;
    }

    function make_response(
        options = {
            text: "",
            tts: false,
            state: {},
            buttons: [],
            directives: {},
            card: {}
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
        return make_response({
            text: `Извините, я вас не понял. Переформулируйте свой запрос. ${methodName}`,
            text: text,
            tts: text
        });
    }

    function GeolocationCallback(event, state) {
        if (event.session.location) {
            let location = event.session.location;
            let newState = state;
            newState.location = location;

            city = maps.getCityName(location);

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

    function ChoiceEvent(event, state) {
        let value = request.nlu.intents.choice_event.slots.event.value;

        let newState = state;

        newState.eventType = value;

        switch (value) {
            case "cinema":

                //Отбираем афишу

                return make_response({
                    text: "На какой фильм?",
                    //выводим афишу в виде кнопок, ниже пример
                    buttons: [
                        button("Аватар", false, false, true),
                        button("Звездные войны", false, false, true),
                        button("Star Track", false, false, true),
                    ],
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

        eventTypeName = state.eventName;        

        return make_response({
            text: text,
            state: state,
            buttons: [
                button(`Расскажи о ${eventTypeName}`),
                button("Покажи расписание")
            ],
        });
    }

    function AboutEvent(event, state) {
        // switch(event.request.intents.about_event.slots.eventname.value) {
        //     case 'avatar':
                text = 'Бывший морпех Джейк Салли прикован к инвалидному креслу. Несмотря на немощное тело, Джейк в душе по-прежнему остается воином. Он получает задание совершить путешествие в несколько световых лет к базе землян на планете Пандора, где корпорации добывают редкий минерал, имеющий огромное значение для выхода Земли из энергетического кризиса.';
                tts = 'Бывший морпех Джейк Салли прикован к инвалидному креслу. Несмотря на немощное тело, Джейк в душе по-прежнему остается воином. Он получает задание совершить путешествие в несколько световых лет к базе землян на планете Пандора, где корпорации добывают редкий минерал, имеющий огромное значение для выхода Земли из энергетического кризиса.';
                return make_response({
                    text: text,
                    tts: tts,
                    state: state,
                    card: {
                        type: "ImageGallery",
                        items: [
                            { image_id: '997614/8fd63b6c168a70fb3750'},
                            {image_id: '965417/0bcddb51fa03cebf37dc'}
                        ],
                    }
                })
        //     break;
        // }
    }

    intents = request.nlu.intents;
    let state = event.state[STATE_REQUEST_KEY] || {};
    let response;

    if (event.session.new) {
        return welcome(event);
    } 
    else if (event.session.location && intents.set_city) {
        return GeolocationCallback(event, state);
    } 
    else if (Object.keys(intents).length > 0) {
        if (intents.choice_event) {
            response = ChoiceEvent(event, state);
        }

        if (intents.about_event) {
            response = AboutEvent(event, state);
        }

        if(intents.set_event_name) {
            response = SetEventName(event, state);
        }

        return response;
    } else {
        let directiveType = event.request.type;
        return fallback(event, `Общий сброс. ${directiveType}`);
    }
};