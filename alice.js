module.exports.handler = async (event, context) => {
    const {version, session, request} = event;
    const events = ['кино', 'театр', 'фильм', 'спектакль'];
    const places = { //Можно получать из карт яндекса
        cinema: ['CineMax'], 
        theater: ['Teatr']
    };
    const tableEvents = {
        /**
         * city: {
         *  name: 'Краснодар',
         *  places: {
         *      theater: [
         *          {name: '', items: [
         *              { name: '', times: [
         * 
         *                 ]}, {}, {}
         *          ]}, {}, {}
         *      ]
         *  }
         * }
         */

        cinema: [],
        theater: []
    };
    const city = ['Краснодар', 'Москва', 'Омск']; //Запрос местоположения SimpleUtterance
    let location = ''; //Запрос на местоположение
    let endSession = false;
    let answerUser = context;

    //Стартовое приветствие
    let text = "Привет. На какое мероприятие хочешь?";

    //Пользователь что то ввел
    if (request["original_utterance"].length > 0) {
        let arUtt = request["original_utterance"].split(' '); //разобьем запрос пользователя
        let curEvent, curPlace;

        arUtt.forEach(element => {
            curEvent = events.find(item => {
                if(item === element)
                    return item;
                else 
                    return false;
            });
        });

        if(answerUser.eventPlace) {
            arUtt.forEach(element => {
                curPlace = places[answerUser.eventPlace].find(item => item === element)
            });
        }
            
            
            //2. Если location === '' 
            if(location === '') {
                text = 'В каком вы городе?';
            }
            else {
                answerUser.city = request["original_utterance"];

                //1. Ответ пользователя о мероприятии
                //Найти вхождение слов из events в arUtt возвращаем ответ;
                //text = ответ
                if(curEvent) {
                    let curPlace = '';
                    switch(curEvent) {
                        case "кино": case "фильм":
                            curPlace = 'cinema';
                        break;

                        case "театр": case "спектакль":
                            curPlace = 'theater';
                        break;
                    }
                    answerUser.event = curEvent;
                    answerUser.eventPlace = curPlace;
                    text = `В каком ${curPlace}?`;
                }
                
                if(curPlace) {
                    //Подобрать все возможные события для данного
                    // answerUser.event - события
                    // answerUser.eventPlace - местоположения
                    // answerUser.city - города


                }
            }


        

        //3. Если город определен, то спрашиваем у пользователя в каком заведении
        // Возвращаем ответ алисы на тему мероприяти
        // Интеграция с Яндекс.Афиша

        //4. Спасибо Алиса
        // endSession = true;

        //5. Если пользователь давно не обращался к Алисе, например 15-20 минут
        // endSession = true;

    }
        
    //Ответ Алисы на любой наш запрос
    return {
        version,
        session,
        response: {
            text: text,
            end_session: endSession,
        },
    };
};