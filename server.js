var http = require('http'),
	url = require('url'),
	path = require('path'),
	fs = require('fs'),
    handlebars = require('handlebars');
var {parse} = require('querystring');
const mongoose = require('mongoose');
const machine = require('./machine_schema');

mongoose.connect('mongodb://localhost/Maintenance', { useNewUrlParser: true, useUnifiedTopology: true })


// for static pages
var mimeTypes = {
	'html': 'text/html',
	'css': 'text/css',
	'js': 'text/javascript',

	'json': 'application/json',
	'pdf': 'application/pdf',
	'doc': 'application/msword',

	'ico': 'image/x-icon',
	'png': 'image/png',
	'jpeg': 'image/jpeg',
	'jpg': 'image/jpeg',
	'svg': 'image/svg+xml',

	'wav': 'audio/wav',
	'mp3': 'audio/mpeg'
};

http.createServer(function(req, res) {
	var urlAll = url.parse(req.url, true);
	var uri = urlAll.pathname;
	var queryParams = urlAll.query;
	
    console.log(urlAll);
    console.log(uri);
    console.log(req.method);

    var filename = path.join(process.cwd(), "static", unescape(uri));
	console.log("Static path: " + filename);
    if(fs.existsSync(filename) && fs.lstatSync(filename).isFile()){
        console.log("Static path exists");
        var mimeType = mimeTypes[path.extname(filename).split(".").reverse()[0]];
        res.writeHead(200, {'Content-Type': mimeType} );

        var fileStream = fs.createReadStream(filename);
        try{
            fileStream.pipe(res);
        }
        catch(err){
            console.log("not a file: ", err);
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.write('404 Not Found\n');
            res.end();
            return;
        }
    }
    else{
        console.log("No static path, checking dynamic URL");
        if(req.method.toLowerCase() == 'get') {
            //do your processing
            if(uri==="/test1"){
                var data = {
                    title: 'ETI Labs Products and Services',
                    productsHeading: 'List of Products',
                    servicesHeading: 'List of Services',
                    productsList: ['Embedded Development Board', 'IoT Board'],
                    servicesList: ['Industrial IoT', 'PCB Designing', 'Training & Workshops', 'Cosultancy']
                }
                try{
                    handlebars.registerPartial('products', fs.readFileSync(path.join(process.cwd(),'templates/partials/products.html.hbs'), 'utf-8'));
                    handlebars.registerPartial('services', fs.readFileSync(path.join(process.cwd(),'templates/partials/services.html.hbs'), 'utf-8'));
                    source = fs.readFileSync(path.join(process.cwd(),'templates/list.html.hbs'), 'utf-8');
                    var template = handlebars.compile(source);
                    var htmlData = template(data);
                    res.writeHead(200, {'Content-Type': "text/html"});  // reponse OK
                    res.write(htmlData);
                    res.end();
                }
                catch (err){
                    console.log(err);
                    res.writeHead(500, {'Content-Type': "text/plain"});  // reponse Error
                    res.write("Internal server error");
                    res.end();
                }
            }
            else if(uri==="/machines")
            
            {
                machine.find({ 'Active': 1 }).lean().exec(function(err, fetchedData) {
                    if (err)
                        console.log(err);
                    console.log(fetchedData);
                    var data = { machines: fetchedData };
                    const source = fs.readFileSync(path.join(process.cwd(),'templates/machines.html.hbs'), 'utf8');
                    const template = handlebars.compile(source, { strict: true });
                    const htmlData = template(data);
                    res.writeHeader(200, { "Content-Type": "text/html" });
                    res.write(htmlData);
                    res.end();
                })
            }
            else{
                res.writeHead(404, {'Content-Type': 'text/plain'});     // response Not found
                res.write('404 Not Found\n');
                res.end();
            }
        }
        else{
            var data ="", parsedData;
            req.on("data",function(chunk){
                data += chunk;
            });
            req.on("end",function(chunk){
                parsedData = parse(data);       // data sent with post/put... e.g html forms
                console.log(parsedData);
                if (req.method.toLowerCase() == 'post') {
                    //do your processing

                    //for redirecting to new path
                    res.writeHead("303", {'Location': "/test1.html"});      // path/to/new/url
                }
                else if (req.method.toLowerCase() == 'put') {
                    //do your processing
                }
                else if (req.method.toLowerCase() == 'delete') {
                    //do your processing
                }
                res.end();
            });
        }
        return;
    }
}).listen(8000);