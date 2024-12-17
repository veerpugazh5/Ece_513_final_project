
const db = require("../db");

const particleSchema = new db.Schema({
	    deviceSerialNumber: {
		            type: String, 
		            required: true
		        },
	    heart_rate: {
		            type: Number
		        },
	    spo2: {
		            type: Number
		        },
	    timestamp: {
		            type: Date,
		            default: Date.now
		        }
});

const Particle = db.models.Particle || db.model('Particle', particleSchema);
module.exports = Particle;
