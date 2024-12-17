var express = require('express');
var router = express.Router();
var Physician = require("../models/Physician");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET_KEY = "your_secret_key";
var Patient = require("../models/Patient");
var PatientService = require("../service/PatientService");
const Particle = require('../models/Particle');


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    // Extract token after "Bearer "
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            console.error('Token verification failed:', err); // Debug log
            return res.status(403).json({ error: 'Invalid or expired token.' });
        }
        console.log('Verified user:', user); // Debug log
        req.user = user;
        next();
    });
}

// Register a new physician
router.post("/register", async (req, res) => {
        /**
     * POST /register
     * Registers a new physician in the system.
     * 
     * Request Body:
     * - email (string, required): Unique email address of the physician.
     * - password (string, required): Physician's password.
     * - name (string, required): Full name of the physician.
     * - gender (string, optional): Physician's gender.
     * - phone (string, required): Contact phone number.
     * - specialization (string, required): Area of specialization.
     * - qualifications (string, required): Professional qualifications.
     * 
     * Responses:
     * - 201 Created: Successful registration.
     * - 400 Bad Request: Email already registered.
     * - 500 Internal Server Error: Server-side error.
     */
    try {
        const { email, password, name, gender, phone, specialization, qualifications } = req.body;

        // Check if the email already exists
        const existingPhysician = await Physician.findOne({ email });
        if (existingPhysician) {
            return res.status(400).json({ message: 'Email is already registered.' });
        }

        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const physician = new Physician({
            email,
            passwordHash,
            name,
            gender,
            phone,
            specialization,
            qualifications
        });

        await physician.save();

        const msgStr = `New Physician with ID: (${email}) has been registered.`;
        res.status(201).json({ message: msgStr });
        console.log(msgStr);
    } catch (error) {
        console.error('Error during physician registration:', error);
        res.status(500).json({ message: 'Internal server error.', error });
    }
});

// Get physician details
router.get("/getdetails", authenticateToken,  async (req, res) => {
        /**
     * GET /getdetails
     * Fetches details of a registered physician.
     * 
     * Query Parameters:
     * - email (string, required): Email address of the physician to retrieve.
     * 
     * Responses:
     * - 200 OK: Physician details retrieved successfully.
     * - 400 Bad Request: Missing email query parameter.
     * - 404 Not Found: Physician not found.
     * - 500 Internal Server Error: Server-side error.
     */
    const email = req.query.email;
  
    if (!email) {
      return res.status(400).json({ message: "Email query parameter is required" });
    }
  
    try {
      const physician = await Physician.findOne({ email });
      if (!physician) {
        return res.status(404).json({ message: "Physician not found." });
      }
      res.status(200).json(physician);
    } catch (error) {
      console.error('Error fetching physician details:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  });

// Login route for physician
router.post("/login", async (req, res) => {
        /**
         * POST /login
         * Authenticates a physician and provides a JWT token and physician details upon successful authentication.
         *
         * Body Parameters:
         * - email (string, required): The email address of the physician attempting to log in.
         * - password (string, required): The password for the physician's account.
         *
         * Responses:
         * - 200 OK: Login successful, returns JWT token and physician details.
         * - 400 Bad Request: Email and/or password not provided in the request.
         * - 401 Unauthorized: Incorrect password for the given email address.
         * - 404 Not Found: No physician found with the provided email address.
         * - 500 Internal Server Error: An error occurred on the server while processing the request.
         */

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const physician = await Physician.findOne({ email });
        if (!physician) {
            return res.status(404).json({ message: "Email not registered." });
        }

        const isMatch = await bcrypt.compare(password, physician.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password." });
        }

        const token = jwt.sign(
            { id: physician._id, email: physician.email, role: 'Physician' },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Login successful.",
            token,
            physician: {
                id: physician._id,
                name: physician.name,
                email: physician.email,
                gender: physician.gender,
                phone: physician.phone,
                specialization: physician.specialization,
                qualifications: physician.qualifications
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Update physician details
router.put('/update', authenticateToken, async (req, res) => {
        /**
     * PUT /update
     * Updates details of a registered physician. Requires authentication.
     *
     * Header:
     * - Authorization (string, required): Bearer token for verifying the authenticity of the request.
     *
     * Body Parameters:
     * - email (string, required): The email address of the physician whose details are to be updated.
     * - firstName (string, optional): The first name of the physician.
     * - lastName (string, optional): The last name of the physician.
     * - specialization (string, optional): The physician's field of specialization.
     * - qualifications (array of strings, optional): An array of qualifications attained by the physician.
     *
     * Responses:
     * - 200 OK: Details updated successfully, returns updated physician details.
     * - 400 Bad Request: Email parameter missing in the request body.
     * - 404 Not Found: No physician found with the provided email address.
     * - 500 Internal Server Error: An error occurred on the server while processing the request.
     */

    const { email, firstName, lastName, specialization, qualifications } = req.body;

    try {
        const updatedPhysician = await Physician.findOneAndUpdate(
            { email },
            { $set: { name: `${firstName} ${lastName}`, specialization, qualifications } },
            { new: true }
        );

        if (!updatedPhysician) {
            return res.status(404).json({ message: 'Physician not found.' });
        }

        res.status(200).json({
            message: 'Physician details updated successfully.',
            physician: updatedPhysician
        });
    } catch (error) {
        console.error('Error updating physician details:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Reset password for physician
router.post('/reset-password', async (req, res) => {
        /**
     * POST /reset-password
     * Resets the password for a registered physician.
     *
     * Body Parameters:
     * - email (string, required): The email address of the physician whose password is to be reset.
     * - currentPassword (string, required): The current password of the physician.
     * - newPassword (string, required): The new password to replace the current one.
     *
     * Responses:
     * - 200 OK: Password reset successfully.
     * - 400 Bad Request: Current password is incorrect.
     * - 404 Not Found: No physician found with the provided email address.
     * - 500 Internal Server Error: An error occurred on the server while processing the request.
     */

    const { email, currentPassword, newPassword } = req.body;

    try {
        const physician = await Physician.findOne({ email });

        if (!physician) {
            return res.status(404).json({ message: 'Physician not found.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, physician.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect.' });
        }

        const salt = await bcrypt.genSalt(10);
        physician.passwordHash = await bcrypt.hash(newPassword, salt);

        await physician.save();

        res.status(200).json({ message: 'Password reset successfully!' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

router.get("/test", (req, res) => {
        /**
     * GET /test
     * Provides a simple message to verify that the Healthcare API for the patient service is operational.
     *
     * Responses:
     * - 200 OK: Successfully displays a welcome message.
     *
     * The response includes a simple string message confirming that the API service is running.
     */

    res.send('Welcome to the Healthcare API: Physician');
});

router.get('/patientsview', authenticateToken, async (req, res) => {
        /**
     * GET /patientsview
     * Retrieves a list of patients assigned to the authenticated physician.
     *
     * Header:
     * - Authorization (string, required): Bearer token for verifying the authenticity of the physician.
     *
     * Responses:
     * - 200 OK: Returns a list of patients assigned to the physician.
     * - 404 Not Found: No patients found for this physician.
     * - 500 Internal Server Error: An error occurred on the server while processing the request.
     */

    try {
        const physicianId  = req.user.id;

        console.log(physicianId);
        // Find patients assigned to the specified physician
        const patients = await Patient.find({ 'assignedPhysician': physicianId });

        if (!patients || patients.length === 0) {
            return res.status(404).json({ error: 'No patients found for this physician.' });
        }

        res.status(200).json(patients);
    } catch (error) {
        console.error('Error retrieving patients:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/getdevicereadings', authenticateToken, async (req, res) => {
        /**
     * POST /getdevicereadings
     * Retrieves the device readings for a specific patient's medical device.
     *
     * Header:
     * - Authorization (string, required): Bearer token to authenticate the request.
     *
     * Body Parameters:
     * - deviceSerialNumber (string, required): The serial number of the device whose readings are to be retrieved.
     * - email (string, required): The email address of the patient to whom the device is registered.
     *
     * Responses:
     * - 200 OK: Successfully retrieved device readings, includes start time, end time, frequency of readings, and the readings themselves.
     * - 400 Bad Request: Either device serial number or patient email is undefined.
     * - 404 Not Found: Either no patient found with the given email or the device is not registered under the found patient.
     * - 500 Internal Server Error: An error occurred on the server while processing the request or a required parameter is undefined.
     */

    try {
        const { deviceSerialNumber, email } = req.body;

        if (!deviceSerialNumber || !email) {
            return res.status(400).json({ error: 'Device Serial Number or Email Undefined' });
        }

        // Find the patient by email
        const patient = await Patient.findOne({ email });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Find the device details under the patient's devices
        const device = patient.devices.find(
            (dev) => dev.serialNumber === deviceSerialNumber.trim()
        );

        if (!device) {
            return res.status(404).json({ error: 'Device not registered under this patient' });
        }

        const { startTime, endTime, frequencyOfReading } = device;

        // Find patients assigned to the specified physician
        if(!deviceSerialNumber){
            return res.status(500).json({ error: 'Device ID Undefined' });
        }
        const readings = await Particle.find({ 'deviceSerialNumber': deviceSerialNumber.trim() });
        return res.status(200).json({ startTime, endTime, frequencyOfReading, readings });
    } catch (error) {
        console.error('Error retrieving patients:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/getdevicesettings', async (req, res) => {
            /**
     * POST /getdevicesettings
     * Retrieves the device settings for a specific patient's medical device.
     *
     * Header:
     * - Authorization (string, required): Bearer token to authenticate the request.
     *
     * Body Parameters:
     * - deviceSerialNumber (string, required): The serial number of the device whose readings are to be retrieved.
     * - email (string, required): The email address of the patient to whom the device is registered.
     *
     * Responses:
     * - 200 OK: Successfully retrieved device readings, includes start time, end time, frequency of readings, and the readings themselves.
     * - 400 Bad Request: Either device serial number or patient email is undefined.
     * - 404 Not Found: Either no patient found with the given email or the device is not registered under the found patient.
     * - 500 Internal Server Error: An error occurred on the server while processing the request or a required parameter is undefined.
     */

    try {
        const { deviceSerialNumber, email } = req.body;
        console.log(deviceSerialNumber);
        console.log(email)
        if (!deviceSerialNumber || !email) {
            return res.status(400).json({ error: 'Device Serial Number or Email Undefined' });
        }

        // Find the patient by email
        const patient = await Patient.findOne({ email });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Find the device details under the patient's devices
        const device = patient.devices.find(
            (dev) => dev.serialNumber === deviceSerialNumber.trim()
        );

        if (!device) {
            return res.status(404).json({ error: 'Device not registered under this patient' });
        }

        const { startTime, endTime, frequencyOfReading } = device;

        // Find patients assigned to the specified physician
        if(!deviceSerialNumber){
            return res.status(500).json({ error: 'Device ID Undefined' });
        }
        return res.status(200).json({ startTime, endTime, frequencyOfReading});
    } catch (error) {
        console.error('Error retrieving patients:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/updatedevicesettings', authenticateToken, async (req, res) => {
        /**
     * PUT /updatedevicesettings
     * Updates the settings for a specific medical device registered to a patient.
     *
     * Header:
     * - Authorization (string, required): Bearer token to authenticate the request.
     *
     * Body Parameters:
     * - deviceSerialNumber (string, required): The serial number of the device whose settings are to be updated.
     * - email (string, required): The email address of the patient to whom the device is registered.
     * - startTime (string, required): The new start time for the device's operation.
     * - endTime (string, required): The new end time for the device's operation.
     * - frequencyOfReading (number, required): The new frequency at which the device should record readings.
     *
     * Responses:
     * - 200 OK: Device settings updated successfully.
     * - 400 Bad Request: One or more required fields are missing.
     * - 404 Not Found: No patient found with the given email, or the device is not registered under the found patient.
     * - 500 Internal Server Error: An error occurred on the server while processing the request.
     */

    try {
        const { deviceSerialNumber, email, startTime, endTime, frequencyOfReading } = req.body;

        if (!deviceSerialNumber || !email || !startTime || !endTime || !frequencyOfReading) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Find the patient by email
        const patient = await Patient.findOne({ email });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Find the device under the patient's devices
        const deviceIndex = patient.devices.findIndex(
            (dev) => dev.serialNumber === deviceSerialNumber.trim()
        );

        if (deviceIndex === -1) {
            return res.status(404).json({ error: 'Device not registered under this patient' });
        }

        // Update the device settings
        patient.devices[deviceIndex].startTime = startTime;
        patient.devices[deviceIndex].endTime = endTime;
        patient.devices[deviceIndex].frequencyOfReading = frequencyOfReading;

        await patient.save();

        return res.status(200).json({ message: 'Device settings updated successfully' });
    } catch (error) {
        console.error('Error updating device settings:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/registeredpatientsstats', authenticateToken, async (req, res) => {

        /**
     * GET /registeredpatientsstats
     * Retrieves weekly statistics for devices assigned to patients under a specific physician's care.
     *
     * Header:
     * - Authorization (string, required): Bearer token to authenticate the request and identify the physician.
     *
     * Responses:
     * - 200 OK: Successfully retrieved statistics, returns a list of patient details and their device stats.
     * - 404 Not Found: No patients found for this physician.
     * - 500 Internal Server Error: An error occurred on the server while processing the request.
     *
     * Each item in the response array includes:
     * - patientName (string): The name of the patient.
     * - patientEmail (string): The email address of the patient.
     * - stats (array): Weekly statistics for each device assigned to the patient.
     */

    try {
        const physicianId = req.user.id;
        console.log(physicianId);
        // Find patients assigned to the specified physician
        const patients = await Patient.find({ 'assignedPhysician': physicianId });

        if (!patients || patients.length === 0) {
            return res.status(404).json({ error: 'No patients found for this physician.' });
        }

        const results = [];

        for (const patient of patients) {
            const deviceSerialNumbers = patient.devices.map(device => device.serialNumber);

            // Get weekly stats for each patient's devices
            const stats = await PatientService.getWeeklyStats(deviceSerialNumbers);

            results.push({
                patientName: patient.name,
                patientEmail: patient.email,
                stats
            });
        }

        res.status(200).json({ results });
    } catch (error) {
        console.error('Error retrieving patients weekly stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.post('/patientdailysummary', authenticateToken, async (req, res) => {
        /**
     * POST /patientdailysummary
     * Retrieves daily statistics for devices assigned to a specific patient.
     *
     * Body Parameters:
     * - email (string, required): The email address of the patient for whom daily statistics are to be retrieved.
     *
     * Responses:
     * - 200 OK: Successfully retrieved daily statistics, returns patient details and device data.
     * - 404 Not Found: No patient found with the provided email address.
     * - 500 Internal Server Error: An error occurred on the server while processing the request.
     *
     * The response includes:
     * - patientName (string): The name of the patient.
     * - patientEmail (string): The email address of the patient.
     * - weeklyData (array): Daily statistics for each device assigned to the patient.
     */

    try {
        const { email } = req.body;
        console.log(email)
        const patient = await Patient.findOne({"email": email});
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found.' });
        }

        const deviceSerialNumbers = patient.devices.map(device => device.serialNumber);
        const dailyStats = await PatientService.getDailyStats(deviceSerialNumbers);

        res.status(200).json({
            patientName: patient.name,
            patientEmail: patient.email,
            weeklyData: dailyStats
        });
    } catch (error) {
        console.error('Error retrieving patient daily summary:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/patient-date-range-summary', async (req, res) => {
        /**
     * POST /patient-date-range-summary
     * Retrieves daily statistics for devices assigned to a specific patient over a specified date range.
     *
     * Header:
     * - Authorization (string, required): Bearer token to authenticate the request.
     *
     * Body Parameters:
     * - email (string, required): The email address of the patient for whom statistics are to be retrieved.
     * - startDate (string, required): The starting date of the period for which data is requested, in YYYY-MM-DD format.
     * - endDate (string, required): The ending date of the period for which data is requested, in YYYY-MM-DD format.
     *
     * Responses:
     * - 200 OK: Successfully retrieved daily statistics for the specified date range, includes patient details and device data.
     * - 400 Bad Request: Missing one or more required fields (email, startDate, endDate).
     * - 404 Not Found: No patient found with the provided email address.
     * - 500 Internal Server Error: An error occurred on the server while processing the request.
     *
     * The response includes:
     * - patientName (string): The name of the patient.
     * - patientEmail (string): The email address of the patient.
     * - dailyData (array): Daily statistics for each device assigned to the patient within the specified date range.
     */

    try {
        const { email, startDate, endDate } = req.body;
        console.log(req.body);
        if (!email || !startDate || !endDate) {
            return res.status(400).json({ error: 'Email, startDate, and endDate are required.' });
        }

        const patient = await Patient.findOne({ email });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found.' });
        }

        const deviceSerialNumbers = patient.devices.map(device => device.serialNumber);
        const devices = patient.devices.map(device => {
            return { deviceName: device.deviceName, serialNumber: device.serialNumber };
        });
        const dailyStats = await PatientService.getDailyStatsByDateRange(deviceSerialNumbers, startDate, endDate);
        console.log(deviceSerialNumbers)
        res.status(200).json({
            patientName: patient.name,
            patientEmail: patient.email,
            dailyData: dailyStats,
            devices: devices
        });
    } catch (error) {
        console.error('Error retrieving patient date range summary:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;