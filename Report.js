const mongoose = require('mongoose');

const ReportSchema = mongoose.Schema({
    laporan: String,
    tanggal: {
        type: Date,
        default: Date.now
    },
    lokasi: String,
    status: String,
    nama: String,
    email: String
});

module.exports = mongoose.model('Report', ReportSchema);