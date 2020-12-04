const mongoose = require('mongoose');

const LoggingSchema = mongoose.Schema({
    email: String,
    tanggal: {
        type: Date,
        default: Date.now
    },
    apicalled: String
});

module.exports = mongoose.model('Logging', LoggingSchema);