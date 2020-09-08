var http = require('http');
var request = require('request');
var url = require('url');
var queryString = require('querystring');
var keys = require('./keys.js');

var port = process.env.PORT || process.env.NODE_PORT || 3000;

var onRequest = function(req, response){

	var headers = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET',
		'Access-Control-Allow-Headers': 'Content-Type',
		'Content-Type': 'application/json'
	};

	response.writeHeader(200,headers);	

	var parsedUrl = url.parse(req.url);

	if(parsedUrl.pathname === '/weather/city') {
		var params = queryString.parse(parsedUrl.query);
		getGeoCoordinatesFromAddress(params.address, (data) => {
			response.write(JSON.stringify(data));
			response.end();	
		});	
	}
	else if(parsedUrl.pathname === '/weather/geo') {
		var params = queryString.parse(parsedUrl.query);
		getWeather(params.lat, params.lon, null, (data) => {
			response.write(JSON.stringify(data));
			response.end();	
		});	
	}
	else {
		console.log(req.url);
		response.writeHead(404, headers);
		response.write(JSON.stringify({'error': 'URL not recognized'}));
		response.end();
	}
};

function getGeoCoordinatesFromAddress(address, callback) {
	request(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyBDlY3JVreynleuyfXuVYu1pyZ__HxeqQo`, function(error, res, data){
		if(!error && res.statusCode == 200) {
			var data = JSON.parse(data);
			data = data.results[0];
			var geo = data.geometry.location;
			getWeather(geo.lat, geo.lng, data.formatted_address, callback);
		}
	});
}

function getWeather(lat, lon, formattedAddress, callback) {
	request(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${keys.weather.key}`, function (error, res, data) {
		if (!error && res.statusCode == 200) {
			var data = JSON.parse(data);
		if(formattedAddress) {
			data.address = formattedAddress;
		}
		else{
			data.address = data.name;
		}
			callback(data);
		}
	});
}

http.createServer(onRequest).listen(port);
console.log("Listening on localhost:" + port);