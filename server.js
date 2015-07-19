//CALL THE PACKAGES -----------------------
var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	morgan = require('morgan'),
	mongoose = require('mongoose'),
	uriUtil = require('mongodb-uri'),
	port = process.env.PORT || 8080,
	Country = require('./app/models/country');

//APP CONFIGURATION -----------------------
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, 
                replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } };

app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
	res. setHeader('Access-Control-Allow-Headers', 'content-type');
	next();
});

app.use(morgan('dev'));

//CONNECT TO OUR DATABASE -----------------
var mongodbUri = 'mongodb://alex:123456@ds055852.mongolab.com:55852/global-hotels';
var mongooseUri = uriUtil.formatMongoose(mongodbUri);
mongoose.connect(mongooseUri, options);

//ROUTES FOR API --------------------------
app.get('/', function(req, res) {
	res.send('Welcome to hotels-api!');
});

var apiRouter = express.Router();

apiRouter.use(function(req, res, next) {
	console.log('we are in our app');
	next();
});

//Our API Scheme
//------------------------------------------------------------------------------------------
// /restapi/countries                               GET    'return the list of countries'         DONE
// /restapi/countries                               POST   'add a new country'                    DONE
// /restapi/countries/:name/hotels                  GET    'get the hotels from the country'      DONE
// /restapi/countries/:name/hotels                  POST   'add a hotel to country'               DONE
// /restapi/countries/:name/hotels/:hotname         GET    'get the info about hotel'             DONE
// /restapi/countries/:name/hotels/:hotname         DELETE 'remove a certain hotel'               DONE
// /restapi/countries/:name/hotels/:hotname         PUT    'refresh info about hotel'             DONE
//------------------------------------------------------------------------------------------


apiRouter.get('/', function(req, res) {
	res.json({ message: 'horray! Welcome to our api!'});
});


// on routes that ends in /countries
apiRouter.route('/countries')

	.get(function(req, res) {

		Country.find(function(err, countries) {
			if (err) {
				res.send(err);
			}

			res.json(countries);
		});

	})

	.post(function(req, res) {

		var country = new Country();

		country.name = req.body.name;
		country.description = req.body.description;

		country.save(function(err) {
			if (err) {
				res.send(err);
			}

			res.json({ message: 'Country was added!'});
		});

	});

// on routes that ends in /countries/:name/hotels
apiRouter.route('/countries/:name/hotels')
	
	.get(function(req, res) {

		Country.findHotelByName(req.params.name, function(err, country) {
			if (err) {
				res.send(err)
			}

			if (country) {
				res.send(country['hotels']);
			}
		});
	})

	.post(function(req, res) {

		Country.findHotelByName(req.params.name, function(err, country) {
			
			if (country) {

				country['hotels'].push({
					'name': req.body.name,
					'description': req.body.description,
					'price': req.body.price
				});

				country.save(function (err) {

					if (err) {
						res.send(err)
					}

					res.json({ message: 'A hotel was added to ' + country.name });
				});
			}
		});
	});

// on routes that ends in /restapi/countries/:name/hotels/:hotname 
apiRouter.route('/countries/:name/hotels/:hotname')

	.get(function(req, res) {

		Country.findHotelByName(req.params.name, function(err, country) {
			if (err) {
				res.send(err)
			}

			if (country) {

				var hotels = country['hotels'];
				var description = hotels.filter(function(item) {
					return item['name'] === req.params.hotname;
				})[0]['description'];

				res.json({ description: description });
			}
		});

	})

	.delete(function(req, res) {

		Country.findHotelByName(req.params.name, function(err, country) {
			if (err) {
				res.send(err)
			}

			if (country) {

				var hotels = country['hotels'];

				var index = country.findIndexOfHotel(req.params.hotname);

				hotels.splice(index, 1);

				country.save(function (err) {

					if (err) {
						res.send(err)
					}

					res.json({ message: 'A hotel was deleted from ' + country.name });
				});
			}
		});
	})

	.put(function(req, res) {

		Country.findHotelByName(req.params.name, function(err, country) {
			if (err) {
				res.send(err)
			}

			if (country) {

				var hotels = country['hotels'],
					index = country.findIndexOfHotel(req.params.hotname);

				if (req.body.name) hotels[index]['name'] = req.body.name;
				if (req.body.description) hotels[index]['description'] = req.body.description;
				if (req.body.price) hotels[index]['price'] = req.body.price;
			}

			country.save(function (err) {

				if (err) {
					res.send(err)
				}

				res.json({ message: 'A hotel info from ' + country.name + ' was updated!' });
			});
		});		
	});


//REGISTER OUR ROUTES ---------------------
app.use('/restapi', apiRouter);


//START THE SERVER ------------------------
app.listen(port);
console.log('Server is running at ' + port);