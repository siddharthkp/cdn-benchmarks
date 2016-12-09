/*
    Loop through domains,
    make requests,
    send response time to mixpanel
*/

/* New axios instance for http requests */
var http = axios.create();
http.defaults.timeout = 5000;

/* Attach IP address to the user */
tagIPAdress();

var domains = [
    'http://www.practo.info',
    'https://www.practo.io',
    'http://akamaitest.practo.com',
    'https://benchmarks.practodev.com'
];

var domainIdenfier = [
    'cloudflare', //www.practo.info
    'cloudfront', //www.practo.io
    'akamai', //http://akamaitest.practo.com
    'practodev'
];

/*
    Download tests
    Download these resources from each of the domain
    Log time taken to mixpanel
*/
var resources = ['500K.jpg?cache=false', 'haath?cache=false'];
startDownloadTests();

/*
    Page load test
    Load a html page from each of the domains
    into an iframe
    Log load time to mixpanel
*/

startPageLoadTests();













function startPageLoadTests() {
    load(0);
}

function load(d) {
    var url = domains[d] + '/200.html';
    var cnd = domainIdenfier[d];
    var iframe = document.getElementsByTagName('iframe')[0];

    var start = new Date().getTime();
    iframe.onload = function () {
        logTime(cnd, url, start);
        recurLoad(d);
    }
    iframe.src = url;
}

function recurLoad(d) {
    if (domains[++d]) load(d);
    else console.log('all load tests done!');
}

function startDownloadTests() {
    fetch(0, 0); //fetch is a recursive function
}

function tagIPAdress() {
    http.get('https://api.ipify.org')
    .then(function (response) {
        mixpanel.register({
            ip_address: response.data
        });
    });
}

function getUrl(d, r) {
    return domains[d] + '/' + resources[r];
}

function logTime(cdn, url, start, fail) {
    var end = new Date().getTime();
    var timeTaken = end - start;
    console.log(url, timeTaken);
    var event = 'Download';
    if (url.indexOf('.html') !== -1) event = 'Page load';
    mixpanel.track(event, {
        url: url,
        cdn: cdn,
        timeTaken: timeTaken,
        connection: navigator.connection.type,
        fail: true
    });
    progress();
}

function recur(d, r) {
    if (resources[++r]) fetch(d, r);
    else if (domains[++d]) fetch (d, 0);
    else console.log('all assets tests done!');
}

function fetch (d, r) {
    var url = getUrl(d, r);
    var cdn = domainIdenfier[d];
    var start = new Date().getTime();
    http.get(url, {
        onDownloadProgress: function (progressEvent) {
            // can show stuff to user
        }
    })
    .then(function (response) {
        logTime(cdn, url, start);
        recur(d, r);
    })
    .catch(function (error) {
        logTime(cdn, url, start, fail);
        recur(d, r);
    });
}

var step = 0;
function progress (){
    step++;
    var selector = document.getElementById('status');
    selector.textContent = step + '/12';
}
