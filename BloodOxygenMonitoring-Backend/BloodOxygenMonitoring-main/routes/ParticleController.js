const express = require('express');
const Particle = require('../models/Particle');
const Patient = require('../models/Patient');

const router = express.Router();

// Create a new particle entry
router.post('/particles', async (req, res) => {
        /**
     * POST /particles
     * Creates a new particle entry associated with a medical device.
     *
     * Body Parameters:
     * - deviceSerialNumber (string, required): The serial number of the device that generated the readings.
     * - heart_rate (number, optional): The heart rate reading from the device.
     * - spo2 (number, optional): The oxygen saturation reading from the device.
     * - timestamp (date, optional): The timestamp of when the readings were taken, defaults to the current time if not provided.
     *
     * Responses:
     * - 201 Created: Successfully created a new particle entry, returns the saved particle document.
     * - 400 Bad Request: Device Serial Number is missing or the device is not registered to any patient.
     * - 500 Internal Server Error: An error occurred on the server while processing the request.
     *
     * The response includes:
     * - A particle object containing all the recorded details including deviceSerialNumber, heart_rate, spo2, and timestamp.
     */

    try {
        const { deviceSerialNumber, heart_rate, spo2, timestamp } = req.body;

        // Validate required fields
        if (!deviceSerialNumber) {
            return res.status(400).json({ error: 'Device Serial Number is required.' });
        }

        // Check if the device is registered to any patient
        const registeredPatient = await Patient.findOne({ 'devices.serialNumber': deviceSerialNumber });
        if (!registeredPatient) {
            return res.status(400).json({ error: 'Device not registered to any patient.' });
        }

        // Create a new particle document
        const newParticle = new Particle({
            deviceSerialNumber,
            heart_rate: heart_rate || undefined,
            spo2: spo2 || undefined,
            timestamp: timestamp || Date.now()
        });

        // Save to the database
        const savedParticle = await newParticle.save();
        res.status(201).json(savedParticle);
    } catch (error) {
        console.error('Error saving particle:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/insertdummydata', async (req, res) => {
    try {
        const deviceSerialNumber = "556d8fqsdrfse000";
        const baseDate = new Date();
        baseDate.setHours(0, 0, 0, 0); // Start at midnight today

        const particles = [];
        for (let day = 0; day < 14; day++) {
            const currentDate = new Date(baseDate);
            currentDate.setDate(currentDate.getDate() - day);

            for (let interval = 0; interval < 48; interval++) {
                const timestamp = new Date(currentDate);
                timestamp.setMinutes(interval * 30);
                const heart_rate = (Math.random() * (100 - 60) + 60).toFixed(2); // Random HR between 60 and 100
                const spo2 = (Math.random() * (99 - 90) + 90).toFixed(2); // Random SpO2 between 90 and 99

                particles.push({
                    deviceSerialNumber,
                    heart_rate: parseFloat(heart_rate),
                    spo2: parseFloat(spo2),
                    timestamp
                });
            }
        }

        await Particle.insertMany(particles);
        res.status(201).json({ message: 'Dummy data inserted successfully', totalRecords: particles.length });
    } catch (error) {
        console.error('Error inserting dummy data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
