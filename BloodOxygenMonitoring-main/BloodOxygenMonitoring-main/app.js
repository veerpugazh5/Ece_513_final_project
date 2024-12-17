// Import required modules
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const cors = require('cors');
var logger = require('morgan');
const bodyParser = require('body-parser');

// Import controller
var indexRouter = require('./routes/IndexController');
const patientController = require('./routes/PatientController.js');
const physicianRoutes = require('./routes/PhysicianController');
const particleController = require('./routes/ParticleController');
const apiKeyService = require("./service/ApiKeyService.js")

var  API_KEY = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
API_KEY = "DUMMY"
console.log(`Generated API Key: ${API_KEY}`); // Print the generated API Key on server startup
process.env.API_KEY = API_KEY;

// Initialize the express app
const app = express();

// Middleware to parse JSON bodies
app.use(cors());
app.use(express.json());

// Update CORS to use HTTP instead of HTTPS
app.use(cors({ 
    origin: 'https://ec2-18-217-163-243.us-east-2.compute.amazonaws.com:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// This is to enable cross-origin access
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);
app.use('/patient', patientController);
app.use('/physician', physicianRoutes);
app.use('/particle',apiKeyService, particleController);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    const error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: error
    });
});

// Add this to start the server
const port = 3000; // or whatever port you want to use
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

module.exports = app;
