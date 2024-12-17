var express = require('express');
var router = express.Router();
var Physician = require("../models/Physician");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET_KEY = "your_secret_key";


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
    res.send('Welcome to the Healthcare API: Physician');
});

router.post('/reset-password', async (req, res) =>{
    
})




module.exports = router;