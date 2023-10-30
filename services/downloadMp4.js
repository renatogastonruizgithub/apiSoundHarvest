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
                const cloudinaryUrl = await uploadVideoToCloudinaryFromStream(audioData);

                resolve(cloudinaryUrl);
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