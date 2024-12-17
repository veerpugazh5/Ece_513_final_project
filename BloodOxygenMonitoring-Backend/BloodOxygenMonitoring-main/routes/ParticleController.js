const express = require('express');
const Particle = require('../models/Particle');
const Patient = require('../models/Patient');

const router = express.Router();

// Create a new particle entry
router.post('/particles', async (req, res) => {
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

module.exports = router;
