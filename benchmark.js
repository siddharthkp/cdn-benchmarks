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
    'https://www.practo.io',
    'https://akamaitest.practo.com',
    'https://benchmarking.practodev.com',
    'https://www.practo.info'
];

var domainIdenfier = [
    'cloudfront', //www.practo.io
    'akamai', //http://akamaitest.practo.com
    'practodev',
    'cloudflare' //www.practo.info
];

/*
    Download tests
    Download these resources from each of the domain
    Log time taken to mixpanel
*/
var resources = ['500K.jpg?cache=false', 'haath.txt?cache=false'];
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
        connection: navigator.connection && navigator.connection.type,
        fail: fail
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
            // can show partial progress
        }
    })
    .then(function (response) {
        logTime(cdn, url, start);
        recur(d, r);
    })
    .catch(function (error) {
        logTime(cdn, url, start, true);
        recur(d, r);
    });
}

var step = 0;
var statusSelector = document.getElementById('status');
var animationDuration = 7000;
var testsStarted = new Date.getTime();

function progress () {
    ++step;
    if (step === 12) {
        var testsCompleted = new Date().getTime();
        var timeTaken = testsCompleted - testsStarted;
        if (timeTaken < animationDuration) {
            setTimeout(function(){
                statusSelector.textContent = 'Tests completed! Thanks!';
            }, animationDuration - timeTaken);
        } else statusSelector.textContent = 'Tests completed! Thanks!';
    }
}
