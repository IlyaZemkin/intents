module.exports.handler = async (event, context) => {
    const {version, session, request} = event;

    function getState(name, context = context) {
        let state = context._data.state ? context._data.state.session : false; 

        return state[name] ? state[name] : false;
    }

    function make_reponse(text) {
        return {
            response: {
                text: text
            },
            version: '1.0'
        }
    }

    function welcome(event) {
        text = "Вас приветствует помощник по подбору мероприятий. Куда бы вы хотели сходить?";
        return make_reponse(text);
    }

    function startEventType(event) {
        text = "Постараюсь вам помочь";
        return make_reponse(text);
    }

    function fallback(event) {
        return make_reponse('Извините я вас не понял. Постарайтесь переформулировать.');
    }

    function aboutEvent(event) {
        let intent = event.request.nlu.intents.about_event_info;
        let eventType = intent.slots.event.value;

        switch(eventType) {
            case 'cinema':

            break;

            case 'piece':

            break;

            default: 
                return fallback();
            break;
        }
    }

    //Хранение пользовательских запросов
    let city = getState('city');          //город
    let eventType = getState('eventType');   //тип события
    let eventName = getState('eventName');   //название события
    let location = getState('location');    //местоположение

    //Интенты
    let intents = event.request.nlu.intents;

    if(event.session.new) {
        return welcome();
    }
    /*
    else if(eventType in intents) {
    
    }
    else {
        return fallback();
    }


    */

    if (request["original_utterance"].length > 0) {

        //Привязка города
        if(context._data.request.nlu.entities.length > 0) {
            context._data.request.nlu.entities.forEach(item => {
                if(item.type === 'YANDEX.GEO') {
                    city = item.value.city;
                }
            });
        }

        if(!eventType) {
            eventType = request["original_utterance"];
        }

        if(!city) {
            text = 'В каком вы городе?';
        }

        if(city && eventType && !location) {

            switch(eventType) {
                case 'кино':
                    text = 'В каком кинотеатре?';
                break;

                case 'театр':
                    text = 'В каком театре?';
                break;
            }
            

            location = request["original_utterance"];
        }
        
    }
    return {
        version,
        session,
        response: {
            text: text,
            end_session: false
        },
        test_state: state,
        req: request,
        context: context,
        session: session,
        session_state: {
            city: city,
            eventName: eventName,
            eventType: eventType,
            location: location
        },
    };
};