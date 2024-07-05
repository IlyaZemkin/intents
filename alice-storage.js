module.exports.handler = async (event, context) => {
    const {version, session, request} = event;

    //Хранение пользовательских запросов
    let state = context._data.state ? context._data.state.session : false; 

    let city = state.city ? state.city : false;              //город
    let eventType = state.eventType ? state.eventType : false;   //тип события
    let eventName = state.eventName ? state.eventName : false;   //название события
    let location = state.location ? state.location : false;    //местоположение

    let text = "Привет. На какое мероприятие хочешь?";

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