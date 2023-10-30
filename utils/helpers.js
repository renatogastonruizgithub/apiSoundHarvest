const ytdl = require("ytdl-core");

const streamToBuffer = (audioStream) => {
    return new Promise((resolve, reject) => {
        const audioBuffer = [];

        audioStream.on('data', (chunk) => {
            audioBuffer.push(chunk);
        });

        audioStream.on('end', async () => {
            const audioData = Buffer.concat(audioBuffer);
            resolve(audioData);
        });

        audioStream.on('error', (error) => {
            reject(error);
        });
    });
};

function isValidURL(url) {
    let isValidURL = ytdl.validateURL(url)
    return isValidURL
}

function isUrlLive(url) {
    const youtubeUrlLive = "https://www.youtube.com/live/"
    return url.includes(youtubeUrlLive) ? true : false;
}

async function downloadMedia(videoUrl, mediaType) {
    try {
        const info = await ytdl.getInfo(videoUrl);
        let formats;

        if (mediaType === 'audio') {
            formats = ytdl.filterFormats(info.formats, 'audioonly');
        } else if (mediaType === 'video') {
            formats = ytdl.filterFormats(info.formats, "videoandaudio");
        } else {
            throw new Error("Media type not supported");
        }

        if (formats.length === 0) {
            throw new Error("No format found for media download");
        }

        // Descargar el formato de audio o video de mejor calidad disponible
        const stream = ytdl.downloadFromInfo(info, { format: formats[0] });

        return stream;
    } catch (error) {
        console.error("Error", error);
        throw new Error("Error al descargar el medio", error);
    }
}

async function isVideoLive(videoUrl) {
    const info = await ytdl.getBasicInfo(videoUrl)
    if (info.player_response.videoDetails.isLive) {
        throw new Error("¡Ups!, No se puede descargar videos en vivo")
    }
    else {
        return false
    }
}
async function getTitleAndThumbnail(videoUrl) {
    try {
        const info = await ytdl.getBasicInfo(videoUrl);
        if (info.player_response.videoDetails.isLive) {
            throw new Error("¡Ups!, No se puede descargar videos en vivo");
        } else {
            // Obtener el título del video
            const videoDetails = info.videoDetails;
            const title = videoDetails.title.replace(/[^a-zA-Z0-9]/g, ' ');
            // Obtener la URL de la primera miniatura (thumbnail)
            const thumbnailUrl = videoDetails.thumbnails[0].url;
            return {
                title: title.toLowerCase(),
                thumbnailUrl: thumbnailUrl,
            };
        }
    } catch (error) {

        throw new Error(error.message);
    }

}

module.exports = { getTitleAndThumbnail, streamToBuffer, isValidURL, isUrlLive, isVideoLive, downloadMedia }