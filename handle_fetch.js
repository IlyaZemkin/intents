module.exports.handle_fetch = async (event, context) => {
    const URLS = {
        dadata: "http://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address",
        kudago: 'https://kudago.com/public-api/v1.4/movies/?lang=&fields=&expand=&order_by=&text_format=&ids=&location=krd&premiering_in_location=&actual_since=&actual_until=',
        kinopoisk: "https://api.kinopoisk.dev/v1.4/movie/search?page=1&limit=1&query=",
    }

    async function getExternalFetch(server, token = '', query = {}, method = 'GET') {
        var url = URLS[server];

        if(server === 'kinopoisk') {
            let newQuery = String(query);
            url += newQuery;
        }
        
        var options = {
            method: method,
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: (Object.keys(query).length) ? JSON.stringify(query) : ''
        }

        switch(server) {
            case 'dadata':
                options.headers.Authorization = "Token " + token;
            break;

            case 'kinopoisk':
                options.headers["X-API-KEY"] = token;
            break;
        }
        
        result = await fetch(url, options);
        result = await result.text();
    
        return JSON.parse(result);
    }
}