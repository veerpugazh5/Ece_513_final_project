// var express = require('express');
// var router = express.Router();
// var Patient = require("../models/patient");
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const SECRET_KEY = "your_secret_key";

// router.post("/register", function(req, res){
//     try{
//         const { email, password, name, gender, dob, address, phone } = req.body;

//         // Check if the email already exists
//         Patient.findOne({ email }, function (err, existingPatient) {
//             if (err) {
//                 return res.status(500).send(err);
//             }

//             if (existingPatient) {
//                 return res.status(400).json({ message: 'Email is already registered.' });
//             }

//             // Hash the password before saving
//             bcrypt.genSalt(10, function (err, salt) {
//                 if (err) {
//                     return res.status(500).send(err);
//                 }

//                 bcrypt.hash(password, salt, function (err, passwordHash) {
//                     if (err) {
//                         return res.status(500).send(err);
//                     }

//                     const patient = new Patient({
//                         email, passwordHash, name, gender, dob, address, phone
//                     });

//                     patient.save(function (err, newPatient) {
//                         if (err) {
//                             return res.status(400).send(err);
//                         } else {
//                             const msgStr = `New Patient with ID: (${email}) has been registered.`;
//                             res.status(201).json({ message: msgStr });
//                             console.log(msgStr);
//                         }
//                     });
//                 });
//             });
//         });
//     }catch(error){
//         res.status(500).json({
//             error: error
//         });
//     }
// });


// router.get("/getdetails", function(req, res) {
//     const email = req.query.email;
//     console.log('Received email query parameter:', email); // Debug log
  
//     if (!email) {
//       return res.status(400).send({ message: "Email query parameter is required" });
//     }
  
//     Patient.findOne({ email: email }, function(err, patient) {
//       if (err) {
//         console.error('Error fetching patient details:', err); // Debug log
//         res.status(500).send({ message: "Error fetching patient details", error: err });
//       } else if (!patient) {
//         res.status(404).send({ message: "Patient not found" });
//       } else {
//         res.status(200).json(patient);
//       }
//     });
//   });


// router.post("/login", function(req, res) {
//     const { email, password } = req.body;

//     if (!email || !password) {
//         return res.status(400).json({ message: "Email and password are required." });
//     }

//     // Find the patient by email
//     Patient.findOne({ email }, function(err, patient) {
//         if (err) {
//             return res.status(500).json({ message: "Error while fetching patient data.", error: err });
//         }

//         if (!patient) {
//             return res.status(404).json({ message: "Email and password are required." });
//         }

//         // Compare the provided password with the hashed password
//         bcrypt.compare(password, patient.passwordHash, function(err, isMatch) {
//             if (err) {
//                 return res.status(500).json({ message: "Error", error: err });
//             }

//             if (!isMatch) {
//                 return res.status(401).json({ message: "Invalid email or password." });
//             }

//             // Generate a JWT token
//             const token = jwt.sign(
//                 { id: patient._id, email: patient.email },
//                 SECRET_KEY,
//                 { expiresIn: "1h" }
//             );

//             return res.status(200).json({
//                 message: "Login successful.",
//                 token,
//                 patient: {
//                     id: patient._id,
//                     name: patient.name,
//                     email: patient.email,
//                     gender: patient.gender,
//                     dob: patient.dob,
//                     phone: patient.phone
//                 }
//             });
//         });
//     });
// });

// router.get("/test", function(req, res){
//     res.send('Welcome to the Healthcare API: Patient');
// });

// router.put('/update', async (req, res) => {
//     const { email, firstName, lastName, address } = req.body;

//     try {
//         const updatedPatient = await Patient.findOneAndUpdate(
//             { email }, // Search by email (non-editable field)
//             { $set: { name: `${firstName} ${lastName}`, address } }, // Update editable fields
//             { new: true }
//         );

//         if (!updatedPatient) {
//             return res.status(404).json({ message: 'Patient not found.' });
//         }

//         res.status(200).json({ message: 'Patient details updated successfully.', patient: updatedPatient });
//     } catch (error) {
//         console.error('Error updating patient details:', error);
//         res.status(500).json({ message: 'Internal server error.' });
//     }
// });

// router.post('/reset-password', async (req, res) => {
//     const { email, currentPassword, newPassword } = req.body;

//     try {
//         // Find the patient by email
//         const patient = await Patient.findOne({ email });

//         if (!patient) {
//             return res.status(404).json({ message: 'Patient not found.' });
//         }

//         // Check if the current password matches
//         const isMatch = await bcrypt.compare(currentPassword, patient.passwordHash);
//         if (!isMatch) {
//             return res.status(400).json({ message: 'Current password is incorrect.' });
//         }

//         // Hash the new password
//         const salt = await bcrypt.genSalt(10);
//         patient.passwordHash = await bcrypt.hash(newPassword, salt);

//         // Save the updated password to the database
//         await patient.save();

//         res.status(200).json({ message: 'Password reset successfully!' });
//     } catch (error) {
//         console.error('Error resetting password:', error);
//         res.status(500).json({ message: 'Internal server error.' });
//     }
// });

// module.exports = router;


var express = require('express');
var router = express.Router();
var Patient = require("../models/Patient");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var Physician = require("../models/Physician");
const SECRET_KEY = "your_secret_key";

// Middleware to verify JWT token
// Middleware to verify JWT token
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


router.post("/register", async (req, res) => {
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
    res.send('Welcome to the Healthcare API: Patient');
});

router.post('/registerparticle', authenticateToken, async (req, res) => {
    try {
        const { deviceName, serialNumber } = req.body;
        email = req.user.email

        // Validate required fields
        if (!deviceName || !serialNumber) {
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
        patient.devices.push({ deviceName, serialNumber });
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
    try {
        const physicians = await Physician.find({}); // Fetch all physicians
        return res.status(200).json(physicians);
      } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
      }
});

router.delete('/deletedevice', authenticateToken, async (req, res) => {
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

module.exports = router;