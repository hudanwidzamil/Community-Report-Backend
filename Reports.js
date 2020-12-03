const mongoose = require('mongoose');

const ReportsSchema = mongoose.Schema({
    judul: {type: String},
    isi: {type: String},
    tanggal: {
        type: Date,
        default: Date.now
    },
    lokasi: {type: String},
    status: {type: String},
    penanggung_jawab: {type: String},
    nama: {type: String},
    email: {type: String}
});

module.exports = mongoose.model('Reports', ReportsSchema);