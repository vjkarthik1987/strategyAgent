const mongoose = require('mongoose');

const ObjectiveSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Objective title
    description: { type: String }, // Details about the objective
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }, // Company reference
    owners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Multiple owners, default is creator
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who created the Objective
    startDate: { type: Date, required: true }, // OKR Start Date
    endDate: { type: Date, required: true }, // OKR End Date
    period: [{ type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4'] }], // Multi-select quarter periods
    progress: { type: Number, min: 0, max: 100, default: 0 }, // Sum of all linked Key Results' progress
    status: { type: String, enum: ['draft', 'active', 'completed', 'archived'], default: 'draft' }, // OKR Status
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Create Objective Model
module.exports = mongoose.model('Objective', ObjectiveSchema);