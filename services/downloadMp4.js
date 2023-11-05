const { Video } = require("../database/models/video")
const { uploadVideoToCloudinaryFromStream } = require("../utils/claurinary")
const { isUrlLive, isVideoLive, downloadMedia } = require("../utils/helpers")

const downloadMp4Service = async (url, mediaType) => {

    if (isUrlLive(url)) {
        throw new Error("¡Ups!, no se pueden descargar videos en vivo")
    }
    let chechLive = await isVideoLive(url)
    if (chechLive) {
        throw new Error("¡Ups!, no se pueden descargar videos en vivo")
    }

    const audioStream = await downloadMedia(url, mediaType)

    const audioBuffer = []


    return new Promise((resolve, reject) => {
        audioStream.on('data', (chunk) => {
            audioBuffer.push(chunk);
        });

        audioStream.on('end', async () => {
            try {
                const audioData = Buffer.concat(audioBuffer);
             /*    const cloudinaryUrl = await uploadVideoToCloudinaryFromStream(audioData);
 */           const video = new Video({
                    title: 'Mi video',
                    dataVideo: audioData,
                    contentType: 'video/mp4',
                });
                video.save()
                console.log("Video guardado con ID:", video._id);
                const result = await Video.findById(video._id)
                console.log("Video encontrado en la base de datos:", result);
                resolve(result.dataVideo);
            } catch (error) {
                reject(error);
            }
        });
        audioStream.on('error', (error) => {
            reject(error)
        });
    });

}

module.exports = { downloadMp4Service }