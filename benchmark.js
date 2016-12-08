/*
    Loop through domains,
    make requests,
    send response time to mixpanel
*/

var fetcher = axios.create();
fetcher.defaults.timeout = 5000;

var domains = [
    'http://localhost:3000',
    'http://localhost:3000'
];

var resources = ['200.html', '500K.jpg', 'haath'];

tagIPAdress();
fetch(0, 0);

function tagIPAdress() {
    fetcher.get('https://api.ipify.org')
    .then(function (response) {
        mixpanel.register({
            ip_address: response.data
        });
    });
}

function getUrl(d, r) {
    return domains[d] + '/' + resources[r];
}

function logTime(d, r, start) {
    var end = new Date().getTime();
    var timeTaken = end - start;
    let url = getUrl(d, r);
    console.log(url, timeTaken);
    mixpanel.track('Download', {
        url: url,
        timeTaken: timeTaken,
        connection: navigator.connection.type
    });
    if (resources[++r]) fetch(d, r);
    else if (domains[++d]) fetch (d, 0);
    else console.log('all done!');
}

function fetch (d, r) {
    let url = getUrl(d, r);
    var start = new Date().getTime();
    fetcher.get(url, {
        onDownloadProgress: function (progressEvent) {
            // can show stuff to user
        }
    })
    .then(function (response) {
        logTime(d, r, start);
    })
    .catch(function (error) {
        logTime(d, r, start);
    });
}
