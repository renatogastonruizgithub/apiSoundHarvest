const mongoose = require('mongoose');

// Define un esquema para los datos del vídeo
const videoSchema = new mongoose.Schema({
    title: String,
    data: Buffer,
    contentType: String,
}, {
    timestamps: true,
    versionKey: false
});


const Video = mongoose.model('Video', videoSchema)
module.exports = { Video }