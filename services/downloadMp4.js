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
    audioStream.on('data', (chunk) => {
        audioBuffer.push(chunk)

    });

    return new Promise((resolve, reject) => {
        audioStream.on('end', async () => {
            const audioData = Buffer.concat(audioBuffer)
            try {
                const cloudinaryUrl = await uploadVideoToCloudinaryFromStream(audioData);
                console.log(cloudinaryUrl);
                resolve({ link: cloudinaryUrl });
            } catch (error) {
                reject(error)
            }
        })
        audioStream.on('error', (error) => {
            reject(error)
        });
    });

}

module.exports = { downloadMp4Service }