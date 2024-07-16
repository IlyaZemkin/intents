module.exports.handler = async (event, context) => {
    const {version, session, request} = event;
    const GEOLOCATION_ALLOWED = 'Geolocation.Allowed';
    const GEOLOCATION_REJECTED = 'Geolocation.Rejected';
    const STATE_REQUEST_KEY = 'session';
    const STATE_RESPONSE_KEY = 'session_state';


    //Хранение пользовательских запросов
    let city = getState('city');            //город
    let eventType = getState('eventType');  //тип события
    let eventName = getState('eventName');  //название события
    let location = getState('location');    //местоположение
    let intents = event.request.nlu.intents;
    

    function getState(name) {
        let state = context._data.state ? context._data.state.session : false; 
        return state[name] ? state[name] : false;
    }

    function button(title, payload = false, url = false, hide = false) {
        let button = {
            title: title,
            hide: hide
        }

        if(payload) {
            button.payload = payload;
        }

        if(url) {
            button.url = url;
        }

        return button;
    }

    function make_response(options = {
        text: '',
        state: {},
        buttons: [],
        directives: {},
        card: {}
    }) {
        if(options.text.length == 0) {
            options.text = 'Задайте свой вопрос';
        }

        let response = {
            response: {
                text: options.text
            },
            version: '1.0'
        };

        if(options.buttons) {
            response.response.buttons = options.buttons;
        }

        if(options.directives) {
            response.response.directives = options.directives;
        }

        if(options.state) {
            response[STATE_RESPONSE_KEY] = options.state;
        }

        return response;
    }

    function welcome(event) {
        if(location) {
            return make_response({
                text: 'Куда вы хотели бы сходить?',
                buttons: [
                    button('В кино', false, false, true),
                    button('В театр', false, false, true),
                    button('На концерт', false, false, true),
                ]
            });
        }
        else {
            return make_response({
                text: 'Вас приветсвуте помощник по подбору мероприятий.',
                directives: {
                    request_geolocation: {}
                }
            });
        }
    }
    
    function fallback(event, methodName) {
        return make_response({
            text: `Извините, я вас не понял. Переформулируйте свой запрос. ${methodName}`
        });
    }

    function GeolocationCallback(event, state) {
        if(event.request.type === GEOLOCATION_ALLOWED) {
            let location = event.session.location;
            let newState = state;
            newState.location = location;

                return make_response({
                    text: 'Куда вы хотели бы сходить?',
                    buttons: [
                        button('В кино', false, false, true),
                        button('В театр', false, false, true),
                        button('На концерт', false, false, true),
                    ],
                    state, newState,
                });
        }
        else {
            let text = `К сожалению, мне не удалось получить ваши координаты. 
            Для дальнейшей работы навыка, требуется разрешить доступ к геопозиции.`;
            return make_response({
                text: text,
                directives: {
                    request_geolocation: {}
                }
            });
        }
    }

    function AboutType(event, state) {
            eventType = intent.slots.event.value;
            text = 'На какое время?';
            return make_response({text: text, state: state})
    }

    function ChoiceEvent(event, state) {
            let value = request.nlu.intents.choice_event.slots.event.value;

            let newState = state;

            newState.eventType = value;

            switch(value) {
                case "cinema":

                    //Отбираем афишу

                    return make_response({
                        text: 'На какой фильм?', 
                        //выводим афишу
                        state: newState
                    });
                break;
    
                case "piece":
                    return make_response({
                        text: 'На какой спектакль?', 
                        state: newState
                    });
                break;

                case "concert":
                    return make_response({
                        text: 'На какой концерт вы хотели бы сходить?', 
                        state: newState
                    });
                break;
    
                default:
                    return false
                break;
            }
    }

    function SetEventName(event, state) {
        let eventTypeName;
        text = 'Вот что я могу вам предложить';

        return make_response ({
            text: text,
            state: state,
            buttons: [
                button(`Расскажи о ${eventType}`),
                button("Покажи расписание"),
            ],
        });
    }

    function AboutEvent(event, state) {
        switch(event.request.intents.about_event.slots.eventname.value) {
            case 'avatar':
                text = 'Амбициозный режиссер Джеймс Кэмерон не забыл про свое грандиозное детище — выращенный на незамысловатой канве «Покахонтас» фантастический во всех смыслах «Аватар» все-таки продолжается спустя целых 12 лет. Согласно сюжету главные герои — Джейк (Сэм Уортингтон) и Нейтири (Зои Салдана) — обзавелись большой семьей и детьми. Однако помимо Нетей (Джэми Флэттерс), Лоак (Бритен Далтон) и Туктири (Тринити Блисс) они вынужденно принимают еще одного ребенка — родившегося на военной базе планеты Пандора Майлза Сокорро. Мальчишка не смог отправиться на Землю, поскольку был еще слишком мал. Мать Нейтири, разумеется, видит в приемном сыне потомка своих заклятых врагов, некогда разрушивших ее дом и убивших отца. Предчувствие не обманывает героиню Зои Салдана: выясняется, что человеческие захватчики намерены довести дело до конца и завоевать Пандору. Это первое из четырех запланированных продолжений «Аватара», часть съемок которого прошли под водой.'
                return make_response ({
                    text: text,
                    state: state,
                    card: {
                        type: "BigImage",
                        image_id: '213044/25302ec5ac34654caac1',
                        description: text
                    }
                })
            break;
        }
    }

    intents = request.nlu.intents;
    let state = event.state[STATE_REQUEST_KEY] || {};
    let response;

    if(event.session.new) {
        return welcome(event);
    }
    else if(event.session.location) {
        let state = event.state[STATE_REQUEST_KEY] || {};
        return GeolocationCallback(event, state);
    }
    else if(Object.keys(intents).length > 0) {
        

        if(intents.choice_event) {
            response = ChoiceEvent(event, state);
        }

        if(intents.about_event) {
            response = AboutEvent(event, state);
        }

        if(intents.set_event_name) {
            response = SetEventName(event, state);
        }
        
    }
    else {
        let directiveType = event.request.type;
        return fallback(event, `Общий сброс. ${directiveType}`);
    }
};