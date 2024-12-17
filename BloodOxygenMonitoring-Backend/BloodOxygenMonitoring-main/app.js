// Import required modules
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const cors = require('cors');  // only declare cors once
var logger = require('morgan');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');

// Import controller
var indexRouter = require('./routes/IndexController');
const patientController = require('./routes/PatientController.js');
const physicianRoutes = require('./routes/PhysicianController');
const particleController = require('./routes/ParticleController');

// Initialize the express app
const app = express();

// SSL/HTTPS options
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/heartrackerpro.duckdns.org/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/heartrackerpro.duckdns.org/fullchain.pem')
};

// CORS configuration
app.use(cors({
    origin: ['https://heartrackerpro.duckdns.org:3001', 'https://heartrackerpro.duckdns.org'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// This is to enable cross-origin access
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'https://heartrackerpro.duckdns.org:3001');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// Middleware
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
app.use('/particle', particleController);

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

// Create HTTPS server
https.createServer(options, app).listen(3000, () => {
    console.log('HTTPS server running on port 3000');
});

module.exports = app;
