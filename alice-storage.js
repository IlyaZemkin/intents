module.exports.handler = async (event, context) => {
    const {version, session, request} = event;
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

    function make_response(options = {
        text: '',
        state: {},
        buttons: []
    }) {
        return {
            response: {
                text: options.text,  
            },
            buttons: options.buttons || [],
            session_state: {
                city: city,
                eventName: eventName,
                eventType: eventType,
                location: location
            },
            version: '1.0'
        }
    }

    function button(title, payload = false, url = false, hide = false) {
        let button = {
            title: title,
            hide : hide,
        }

        if(payload) {
            button.payload = payload;
        }

        if(url) {
            button.url = url;
        }
        return button;
    }

    function welcome(event) {
        return make_response({
            text: 'Вас приветсвуте помощник по подбору мероприятий. Куда вы хотели бы сходить?',
            buttons: [
                button('В кино'),
                button('В театр'),
                button('На концерт'),
            ]
        });
    }
    
    function fallback(event) {
        return make_response({text: 'Извините, я вас не понял. Переформулируйте свой запрос.'});
    }

    function setEventType(event) {
        let intent = event.request.nlu.intents.eventType;
        if(intent) {
            return make_response({
                text: 'На какое время?',
                state: {
                    eventType : intent.slots.event.value
                }
            });
        }
        else {
            return fallback();
        }
    }

    function AboutEvent(event) {
        let intent = event.request.nlu.intents.about_event_info;

        if(intent) {
            let value = intent.slots.event.value;

            switch(value) {
                case "cinema":
    
                break;
    
                case "piece":
    
                break;
    
                default:
                    return fallback();
                break;
            }
        }
    }

    if(event.session.new) {
        return welcome();
    }
    else if(Object.keys(intents).length > 0) {
        setEventType();
        AboutEvent();
        //return CurrentEvents();
    }
    else {
        return fallback();
    }
};