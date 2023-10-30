const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'dtfssev5t',
    api_key: '413542551168557',
    api_secret: '_nVW3YUF-MMVH58S248BiPWeb4s'
});

async function uploadVideoToCloudinaryFromStream(videoStream) {
    return new Promise((resolve, reject) => {
        // Sube el video directamente desde el stream a Cloudinary
        cloudinary.uploader.upload_stream(
            { resource_type: 'video', },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.secure_url); // Devuelve la URL del video en Cloudinary
                }
            }
        ).end(videoStream);
    });
}

const deleteVideo = (publicId) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};
module.exports = { uploadVideoToCloudinaryFromStream, deleteVideo }