const mongoose = require('mongoose');

const ReportSchema = mongoose.Schema({
    judul: String,
    isi: String,
    tanggal: {
        type: Date,
        default: Date.now
    },
    lokasi: String,
    status: String,
    penanggung_jawab: String,
    nama: String,
    email: String
});

module.exports = mongoose.model('Report', ReportSchema);