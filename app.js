var RenderUrlsToFile, arrayOfUrls, system;

system = require("system");


RenderUrlsToFile = function (urls, callbackPerUrl, callbackFinal) {
    var next, page, retrieve, urlIndex, webpage, ert;
    urlIndex = 0;
    webpage = require("webpage");
    page = null;


    next = function (status, url) {

        page.close();
        callbackPerUrl(status, url);

        return retrieve();
    };


    retrieve = function () {
        var url;

        if (urls.length > 0) {
            url = urls.shift();
            urlIndex++;

            page = webpage.create();


            page.onConsoleMessage = function (msg) {
                console.log(msg);
            };
            page.onError = function (msg, trace) {
                console.log(msg);
                trace.forEach(function (item) {
                    console.log('  ', item.file, ':', item.line);
                });
            };

            page.onLoadFinished = function (status) {

                if (status === "success") {
                    var dirs = page.evaluate(function () {
                        var elements = document.querySelectorAll("pre");
                        elements = Array.prototype.filter.call(elements, function (item, index, inputArray) {
                            return (item.innerText.indexOf('katalog domeny') >= 0);
                        }).map(function (x) {
                            return x.innerText
                        });
                        var template = elements[0].replace(/(\r\n|\n|\r)/gm, "").match(/katalog template\s+=(.+)/)[1].trim();
                        var domeny = elements[0].replace(/(\r\n|\n|\r)/gm, "").match(/katalog domeny \s+=(.+) katalog/)[1].trim();

                        return '{"katalog template":' + '"' + template + '"' + ',' + '"katalog domeny":' + '"' + domeny + '"' + ','
                    });

                    var URL = '"url": ' + '"' + url + '"' + ',';

                    var imgs = page.evaluate(function () {
                        var elements = document.querySelectorAll("img");
                        var template = '';

                        elements = Array.prototype.filter.call(elements, function (item, index, inputArray) {
                            return (item.src.indexOf('accuweather') < 0) && (item.src.indexOf('pixel_load') < 0 && (item.src.indexOf('stabx.net') < 0 ));
                        });

                        template += '"imgs": [';
                        for (var i = 0; i < elements.length; i++) {
                            template += '{ "src": ' + '"' + elements[i].src + '"' + ',';
                            template += '"siteWidth": ' + elements[i].width + ',';
                            template += '"naturalWidth": ' + elements[i].naturalWidth + ',';
                            template += '"difference": ' + (elements[i].naturalWidth - elements[i].width) + '}';
                            template += (i == (elements.length - 1)) ? ']' : ',';
                        }
                        template += '}';
                        return template;
                    });
                    !(urls.length == 0) ? imgs += "," : imgs += '';

                    console.log(dirs + URL + imgs);
                    return next(status, url);
                } else {
                    return next(status, url);
                }
            };

            return page.open("http://" + url);

        } else {
            return callbackFinal();
        }
    };
    return retrieve();
};


arrayOfUrls = null;

if (system.args.length > 1) {
    arrayOfUrls = Array.prototype.slice.call(system.args, 1);
} else {

    arrayOfUrls = ["latestfromtheworld.com/48/hallumotion-lgr/?adp=1"];
}


RenderUrlsToFile(arrayOfUrls, (function (status, url) {
    if (status !== "success") {
        return console.log("nie udalo sie " + url + "'");

    } else {
        // return console.log("POSZLO " + url);
    }

}), function () {
    // console.log('KONIEC');
    return phantom.exit();
});
