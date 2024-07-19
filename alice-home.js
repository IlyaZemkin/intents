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
  let intents = event.request.nlu.intents || {};

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
      state: {},
      buttons: [],
      directives: {},
      card: {},
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

    if (options.buttons) {
      response.response.buttons = options.buttons;
    }

    if (options.directives) {
      response.response.directives = options.directives;
    }

    if (options.state) {
      response[STATE_RESPONSE_KEY] = options.state;
    }

    if (options.card) {
      response.response.card = card;
    }

    return response;
  }

  function welcome(event) {
    if (city) {
      return make_response({
        text: "Вас приветсвуте помощник по подбору мероприятий. Куда вы хотели бы сходить?",
        buttons: [
          button("В кино", false, false, true),
          button("В театр", false, false, true),
          button("На концерт", false, false, true),
        ],
      });
    } else {
      return make_response({
        text: "Вас приветсвуте помощник по подбору мероприятий. Куда вы хотели бы сходить?",
        buttons: [
          button("В кино", false, false, true),
          button("В театр", false, false, true),
          button("На концерт", false, false, true),
        ],
        directives: {
          request_geolocation: {},
        },
      });
    }
  }

  function fallback(event, methodName) {
    return make_response({
      text: `Извините, я вас не понял. Переформулируйте свой запрос. ${methodName}`,
    });
  }

  function GeolocationCallback(event) {
    if (event.request.type === GEOLOCATION_ALLOWED) {
      let location = event.session.location;
      let lat = location.lat;
      let lon = location.lon;
      let text = `Ваши координаты: широта ${lat}, долгота ${lon}`;
      return make_response({
        text: text,
        state: { location: location },
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
    return make_response({ text: text, state: state });
  }

  function GetCard(type, image_id, description = '') {
    switch(type) {
        case 'big':
            return {
                type: 'BigImage',
                image_id: image_id,
                description: description
            }
        break;
        case 'gallery':
            return {
                type: 'ImageGallery',
                items: [
                    { image_id : image_id[0] },
                    { image_id : image_id[1] },
                    { image_id : image_id[2] },
                ]
            }
        break;
    }
  }

  function AboutEvent(event, state) {
    let text = 'О событии';
    return make_response({
        text: text,
        card: GetCard('big', 'hhhhhh/dffffff', text)
    })
  }

  function ChoiceEvent(event, state) {
    let value = request.nlu.intents.choice_event.slots.event.value;

    let newState = state;

    newState.eventType = value;

    switch (value) {
      case "cinema":
        return make_response({
          text: "В какой кинотеатр?",
          state: newState,
        });
        break;

      case "piece":
        return make_response({
          text: "В какой театр?",
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

  if (event.session.new) {
    return welcome(event);
  }
  //todo: Замучить техподдержку
  else if (
    event.request.type === GEOLOCATION_REJECTED ||
    event.request.type === GEOLOCATION_ALLOWED
  ) {
    return GeolocationCallback(event);
  } else if (Object.keys(intents).length > 0) {
    let state = event.state[STATE_REQUEST_KEY] || {};
    let response;

    if (intents.choice_event) {
      response = ChoiceEvent(event, state);
    }

    if (intents.about_event) {
      response = AboutEvent(event, state);
    }

    return response;
  } else {
    let directiveType = event.request.type;
    return fallback(event, `Общий сброс. ${directiveType}`);
  }
};