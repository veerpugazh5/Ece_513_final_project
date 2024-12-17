var express = require('express');
var router = express.Router();
var Patient = require("../models/Patient");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Particle = require('../models/Particle');
var PatientService = require("../service/PatientService");
var Physician = require("../models/Physician");
const SECRET_KEY = "your_secret_key";


// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    console.log(authHeader);
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

router.post("/register", async (req, res) => {
        /**
     * POST /register
     * Registers a new patient in the system.
     *
     * Body Parameters:
     * - email (string, required): The email address of the patient to register.
     * - password (string, required): The password for the patient's account.
     * - name (string, required): The full name of the patient.
     * - gender (string, required): The gender of the patient.
     * - dob (date, required): The date of birth of the patient, formatted as YYYY-MM-DD.
     * - address (string, required): The residential address of the patient.
     * - phone (string, required): The contact phone number of the patient.
     * - physicianId (string, required): The ID of the physician assigned to the patient.
     *
     * Responses:
     * - 201 Created: Patient successfully registered, returns a confirmation message.
     * - 400 Bad Request: Email is already registered or required field is missing.
     * - 500 Internal Server Error: An error occurred on the server while processing the request.
     *
     * The response includes:
     * - message (string): A message confirming successful registration or describing the error.
     */

    try {
        const { email, password, name, gender, dob, address, phone, physicianId } = req.body;

        // Check if the email already exists
        const existingPatient = await Patient.findOne({ email });
        if (existingPatient) {
            return res.status(400).json({ message: 'Email is already registered.' });
        }

        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const patient = new Patient({
            email,
            passwordHash,
            name,
            gender,
            dob,
            address,
            phone,
            physicianId
        });

        await patient.save();

        const msgStr = `New Patient with ID: (${email}) has been registered.`;
        res.status(201).json({ message: msgStr });
        console.log(msgStr);
    } catch (error) {
        console.error('Error during patient registration:', error);
        res.status(500).json({ message: 'Internal server error.', error });
    }
});

router.get("/getdetails", authenticateToken, async (req, res) => {
        /**
     * GET /getdetails
     * Fetches details of a registered patient using an email query parameter. Requires authentication.
     *
     * Header:
     * - Authorization (string, required): Bearer token to authenticate the request.
     *
     * Query Parameters:
     * - email (string, required): The email address of the patient whose details are to be retrieved.
     *
     * Responses:
     * - 200 OK: Successfully retrieved patient details.
     * - 400 Bad Request: Email query parameter is missing.
     * - 404 Not Found: No patient found with the provided email address.
     * - 500 Internal Server Error: An error occurred on the server while processing the request.
     *
     * The successful response returns an object containing the complete details of the patient.
     */

    const email = req.query.email;
    console.log('Received email query parameter:', email);

    if (!email) {
        return res.status(400).send({ message: "Email query parameter is required" });
    }

    try {
        const patient = await Patient.findOne({ email });
        if (!patient) {
            return res.status(404).json({ message: "Patient not found." });
        }
        res.status(200).json(patient);
    } catch (error) {
        console.error('Error fetching patient details:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

router.post('/login', async (req, res) => {
        /**
     * POST /login
     * Authenticates a patient and provides a JWT token and patient details upon successful authentication.
     *
     * Body Parameters:
     * - email (string, required): The email address of the patient attempting to log in.
     * - password (string, required): The password for the patient's account.
     *
     * Responses:
     * - 200 OK: Login successful, returns JWT token and patient details.
     * - 400 Bad Request: Email and/or password not provided in the request.
     * - 401 Unauthorized: Incorrect password for the given email address.
     * - 404 Not Found: No patient found with the provided email address.
     * - 500 Internal Server Error: An error occurred on the server while processing the request.
     *
     * The successful response includes:
     * - message (string): A confirmation of successful login.
     * - token (string): JWT token valid for 1 hour.
     * - patient (object): An object containing patient details such as id, name, email, gender, date of birth, and phone number.
     */

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const patient = await Patient.findOne({ email });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found.' });
        }

        const isMatch = await bcrypt.compare(password, patient.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid password.' });
        }

        const token = jwt.sign(
            { id: patient._id, email: patient.email, role: 'Patient' },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful.',
            token,
            patient: {
                id: patient._id,
                name: patient.name,
                email: patient.email,
                gender: patient.gender,
                dob: patient.dob,
                phone: patient.phone
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/update', authenticateToken, async (req, res) => {
        /**
     * PUT /update
     * Updates details of a registered patient. Requires authentication.
     *
     * Header:
     * - Authorization (string, required): Bearer token for verifying the authenticity of the request.
     *
     * Body Parameters:
     * - email (string, required): The email address of the patient whose details are to be updated.
     * - firstName (string, optional): The first name of the patient.
     * - lastName (string, optional): The last name of the patient.
     * - address (string, optional): The current address of the patient.
     * - assignedPhysician (string, optional): The ID of the physician assigned to the patient.
     *
     * Responses:
     * - 200 OK: Patient details updated successfully, returns updated patient details.
     * - 404 Not Found: No patient found with the provided email address.
     * - 500 Internal Server Error: An error occurred on the server while processing the request.
     */

    const { email, firstName, lastName, address, assignedPhysician } = req.body;

    try {
        const updatedPatient = await Patient.findOneAndUpdate(
            { email },
            { $set: { name: `${firstName} ${lastName}`, address, assignedPhysician} },
            { new: true }
        );

        if (!updatedPatient) {
            return res.status(404).json({ message: 'Patient not found.' });
        }

        res.status(200).json({
            message: 'Patient details updated successfully.',
            patient: updatedPatient
        });
    } catch (error) {
        console.error('Error updating patient details:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

router.post('/reset-password', async (req, res) => {
        /**
     * POST /reset-password
     * Resets the password for a registered patient.
     *
     * Body Parameters:
     * - email (string, required): The email address of the patient whose password is to be reset.
     * - currentPassword (string, required): The current password of the patient.
     * - newPassword (string, required): The new password to replace the current one.
     *
     * Responses:
     * - 200 OK: Password reset successfully, confirmation message returned.
     * - 400 Bad Request: Current password is incorrect.
     * - 404 Not Found: No patient found with the provided email address.
     * - 500 Internal Server Error: An error occurred on the server while processing the request.
     */

    const { email, currentPassword, newPassword } = req.body;

    try {
        const patient = await Patient.findOne({ email });

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, patient.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect.' });
        }

        const salt = await bcrypt.genSalt(10);
        patient.passwordHash = await bcrypt.hash(newPassword, salt);

        await patient.save();

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

    res.send('Welcome to the Healthcare API: Patient');
});

router.post('/registerparticle', authenticateToken, async (req, res) => {
        /**
     * POST /registerparticle
     * Registers a new medical device to a patient's record.
     *
     * Header:
     * - Authorization (string, required): Bearer token to authenticate the request and to derive the patient's email.
     *
     * Body Parameters:
     * - deviceName (string, required): The name of the medical device.
     * - serialNumber (string, required): The serial number of the device.
     * - startTime (string, required): The start time for the device's operation.
     * - endTime (string, required): The end time for the device's operation.
     * - frequencyOfReading (number, required): The frequency at which the device should record readings.
     *
     * Responses:
     * - 200 OK: Device successfully registered, returns updated list of devices.
     * - 400 Bad Request: Missing required fields or device already registered.
     * - 404 Not Found: No patient found with the provided email.
     * - 500 Internal Server Error: An error occurred on the server while processing the request.
     *
     * The response includes:
     * - message (string): A message stating that the device was successfully registered.
     * - devices (array): An array of device objects registered to the patient, including the newly added device.
     */

    try {
        const { deviceName, serialNumber, startTime, endTime, frequencyOfReading } = req.body;
        const email = req.user.email;

        // Validate required fields
        if (!deviceName || !serialNumber || !startTime || !endTime || !frequencyOfReading) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Find the patient by email
        const patient = await Patient.findOne({ email });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found.' });
        }

        // Check if device already exists
        const existingDevice = patient.devices.find(
            (device) => device.serialNumber === serialNumber
        );

        if (existingDevice) {
            return res.status(400).json({ error: 'Device already registered.' });
        }

        // Add new device to the devices array
        patient.devices.push({ 
            deviceName, 
            serialNumber, 
            startTime, 
            endTime, 
            frequencyOfReading 
        });
        await patient.save();

        res.status(200).json({
            message: 'Device successfully registered to the patient.',
            devices: patient.devices,
        });
    } catch (error) {
        console.error('Error registering particle:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get("/getallphysicians", authenticateToken, async (req, res) => {
        /**
     * GET /getallphysicians
     * Retrieves a list of all registered physicians.
     *
     * Header:
     * - Authorization (string, required): Bearer token to authenticate the request.
     *
     * Responses:
     * - 200 OK: Successfully retrieved a list of all physicians.
     * - 500 Internal Server Error: An error occurred on the server while processing the request.
     *
     * The response is an array of physician objects, each containing details about a physician.
     */

    try {
        const physicians = await Physician.find({}); // Fetch all physicians
        return res.status(200).json(physicians);
      } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
      }
});

router.delete('/deletedevice', authenticateToken, async (req, res) => {
        /**
     * DELETE /deletedevice
     * Deletes a specific device from a patient's record based on the device's serial number.
     *
     * Header:
     * - Authorization (string, required): Bearer token to authenticate the request and to derive the patient's email.
     *
     * Body Parameters:
     * - serialNumber (string, required): The serial number of the device to be deleted.
     *
     * Responses:
     * - 200 OK: Successfully deleted the device, returns updated list of devices.
     * - 400 Bad Request: Missing required serial number in the request.
     * - 404 Not Found: Either no patient found with the provided email, or the specified device is not registered under the patient.
     * - 500 Internal Server Error: An error occurred on the server while processing the request.
     *
     * The response includes:
     * - message (string): A message stating that the device was successfully deleted.
     * - devices (array): An array of remaining device objects registered to the patient after deletion.
     */

    try {
        const { serialNumber } = req.body;
        email = req.user.email
        // Validate required fields

        if (!serialNumber) {
            return res.status(400).json({ error: 'Email and deviceSerialNumber are required.' });
        }

        // Find the patient by email
        const patient = await Patient.findOne({ email });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found.' });
        }

        // Find the device index
        const deviceIndex = patient.devices.findIndex(
            (device) => device.serialNumber === serialNumber
        );

        // Check if the device exists
        if (deviceIndex === -1) {
            return res.status(404).json({ error: 'Device not found.' });
        }

        // Remove the device
        patient.devices.splice(deviceIndex, 1);
        await patient.save();

        return res.status(200).json({
            message: 'Device successfully deleted from the patient.',
            devices: patient.devices,
        });
    } catch (error) {
        console.error('Error deleting device:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/getalldevices', authenticateToken, async (req, res) => {
        /**
     * GET /getalldevices
     * Retrieves all devices registered to a patient based on the patient's email.
     *
     * Header:
     * - Authorization (string, required): Bearer token to authenticate the request and to derive the patient's email.
     *
     * Responses:
     * - 200 OK: Successfully retrieved all devices associated with the patient.
     * - 400 Bad Request: Email is required but not provided in the token.
     * - 404 Not Found: No patient found with the provided email address.
     * - 500 Internal Server Error: An error occurred on the server while processing the request.
     *
     * The response includes:
     * - message (string): A message stating that the devices were retrieved successfully.
     * - devices (array): An array of device objects containing details about each device registered to the patient.
     */

    try {
        email = req.user.email
        // Validate email
        if (!email) {
            return res.status(400).json({ error: 'Email is required.' });
        }

        // Find the patient by email
        const patient = await Patient.findOne({ email });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found.' });
        }

        // Return the devices array
        return res.status(200).json({
            message: 'Devices retrieved successfully.',
            devices: patient.devices,
        });
    } catch (error) {
        console.error('Error retrieving devices:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// router.post('/getdevicereadings', authenticateToken, async (req, res) => {
//         /**
//      * POST /getdevicereadings
//      * Retrieves readings from a specific medical device based on its serial number.
//      *
//      * Header:
//      * - Authorization (string, required): Bearer token to authenticate the request.
//      *
//      * Body Parameters:
//      * - deviceSerialNumber (string, required): The serial number of the device whose readings are to be retrieved.
//      *
//      * Responses:
//      * - 200 OK: Successfully retrieved device readings.
//      * - 500 Internal Server Error: An error occurred on the server while processing the request, or the device serial number is undefined.
//      */

//     try {
//         const {deviceSerialNumber}  = req.body;
//         // Find patients assigned to the specified physician
//         if(!deviceSerialNumber){
//             return res.status(500).json({ error: 'Device ID Undefined' });
//         }
//         const readings = await Particle.find({ 'deviceSerialNumber': deviceSerialNumber.trim() });
//         return res.status(200).json(readings);
//     } catch (error) {
//         console.error('Error retrieving patients:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

router.post('/patient-date-range-summary', async (req, res) => {
    /**
 * POST /patient-date-range-summary
 * Retrieves daily statistics for devices assigned to a specific patient over a specified date range.
 *
 * Header:
 * - Authorization (string, required): Bearer token to authenticate the request.
 *
 * Body Parameters:
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
    const {email, startDate, endDate } = req.body;
    console.log(req.body);
    if (!email || !startDate || !endDate) {
        return res.status(400).json({ error: 'Email, startDate, and endDate are required.' });
    }

    const patient = await Patient.findOne({ email });
    if (!patient) {
        return res.status(404).json({ error: 'Patient not found.' });
    }

    const deviceSerialNumbers = patient.devices.map(device => device.serialNumber);
    const dailyStats = await PatientService.getDailyStatsByDateRange(deviceSerialNumbers, startDate, endDate);
    console.log(deviceSerialNumbers)
    res.status(200).json({
        patientName: patient.name,
        patientEmail: patient.email,
        dailyData: dailyStats,
    });
} catch (error) {
    console.error('Error retrieving patient date range summary:', error);
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
console.log(req.body);
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

router.post('/getdevices', authenticateToken, async (req, res) => {
    try {
        // Assuming email is stored in the token and used to identify the patient
        const email = req.user.email;

        // Validate that email exists
        if (!email) {
            return res.status(400).json({ error: 'Email is required.' });
        }

        // Find the patient by email
        const patient = await Patient.findOne({ email });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found.' });
        }

        // Return the devices array
        res.status(200).json({
            message: 'Devices retrieved successfully.',
            devices: patient.devices,
        });
    } catch (error) {
        console.error('Error retrieving devices:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;