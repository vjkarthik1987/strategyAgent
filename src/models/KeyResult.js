const mongoose = require('mongoose');

const KeyResultSchema = new mongoose.Schema({
    description: { type: String, required: true }, // Key result description
    objective: { type: mongoose.Schema.Types.ObjectId, ref: 'Objective', required: true }, // Reference to Objective
    targetValue: { type: Number, required: true }, // Expected goal metric
    currentValue: { type: Number, default: 0 }, // Progress tracking
    progress: { type: Number, min: 0, max: 100, default: 0 }, // Progress percentage
    owners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Multiple owners, default is creator
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who created the KR
    confidence: { type: Number, min: 0, max: 1, default: 0.7 }, // Confidence level (0 to 1)
    status: { type: String, enum: ['not started', 'in progress', 'achieved', 'failed'], default: 'not started' }, // Key Result Status
    targetDate: { type: Date, required: true }, // Target completion date for this KR
    estimatedDate: { type: Date }, // Estimated completion date (manual or auto)
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Create Key Result Model
module.exports = mongoose.model('KeyResult', KeyResultSchema);