const db = require("../db");

const physicianSchema = new db.Schema({
    email: { type: String, required: true, unique: true }, // Email address of the physician
    passwordHash:   {type: String, required: true},
    name: { type: String, required: true },               // Full name of the physician
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true }, // Gender of the physician
    phone: { type: String, required: true },              // Phone number
    specialization: { type: String, required: true },     // Physician's area of specialization (e.g., Cardiology)
    qualifications: { type: [String], required: true },   // List of qualifications (e.g., MBBS, MD)
    patients: [                                           // List of patients associated with the physician
        { type: db.Schema.Types.ObjectId, ref: 'Patient' } // Reference to Patient schema
    ]
});


module.exports = db.model('Physician', physicianSchema);
