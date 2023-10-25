const ytdl = require("ytdl-core");
const MemoryFS = require('memory-fs');
const memoryFs = new MemoryFS();
const search = require('yt-search');



const pathMemori = "/mp3";
const fileTimestamps = {}; // Objeto para rastrear la hora en que se almacenó cada archivo


memoryFs.mkdirSync(pathMemori, { recursive: true });//crea el directorio

function storeFileInMemoryFs(fileName, fileData) {

    const filePath = `${pathMemori}/${fileName}`
    memoryFs.writeFileSync(filePath, fileData)
    fileTimestamps[fileName] = new Date().getTime() // Registrar la hora de almacenamiento
    return filePath
}

function cleanMemoryFs() {

    const filesInMemoryFs = memoryFs.readdirSync(pathMemori);
    console.log('Archivos en memoria:');
    if (filesInMemoryFs.length === 0) {
        console.log('La memoria está vacía. No se realizó ninguna limpieza.');
        return;
    }

    filesInMemoryFs.forEach((fileName) => {
        memoryFs.unlinkSync(`${pathMemori}/${fileName}`);
        delete fileTimestamps[fileName];
        console.log(`Eliminado de memory-fs: ${fileName}`);
    });
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



/* async function downloadAudio(videoUrl) {
    try {
        const info = await ytdl.getInfo(videoUrl);
        const formats = ytdl.filterFormats(info.formats, 'audioonly');

        if (formats.length === 0) {
            throw new Error("No format found for audio download");
        }
        // Descargar el formato de audio de mejor calidad disponible
        const stream = ytdl.downloadFromInfo(info, { format: formats[0] });

        return stream
    } catch (error) {
        console.log("Error", error);
        throw new Error("Error al descargar audio", error);
    }
} */

async function downloadMedia(videoUrl, mediaType) {
    try {
        const info = await ytdl.getInfo(videoUrl);
        let formats;

        if (mediaType === 'audio') {
            formats = ytdl.filterFormats(info.formats, 'audioonly');
        } else if (mediaType === 'video') {
            formats = ytdl.filterFormats(info.formats, 'videoonly');
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




function isUrlLive(url) {
    const youtubeUrlLive = "https://www.youtube.com/live/"
    return url.includes(youtubeUrlLive) ? true : false;
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



function searchVideos(query, callback) {

    search(query, (err, r) => {
        if (err) {
            callback(err, null);
        } else {
            // Filtrar los resultados para excluir LiveSearchResult
            const videos = r.videos.filter((video) => video.type === 'video')
                .map((video) => {
                    const videoId = ytdl.getURLVideoID(video.url);
                    return {
                        title: video.title.toLowerCase(),
                        url: video.url,
                        thumbnail: video.thumbnail,
                        videoId: videoId, // Aquí añadimos la ID del video
                    };
                });
            callback(null, videos);
        }
    });
}

const downloadMp3Service = async (url, mediaType) => {

    if (isUrlLive(url)) {
        throw new Error("¡Ups!, no se pueden descargar videos en vivo")
    }
    let chechLive = await isVideoLive(url)
    if (chechLive) {
        throw new Error("¡Ups!, no se pueden descargar videos en vivo")
    }
    cleanMemoryFs()

    const timestamp = new Date().getTime()
    const fileName = `${timestamp}.${mediaType === 'video' ? 'mp4' : 'mp3'}`

    const audioStream = await downloadMedia(url, mediaType)

    const audioBuffer = []
    audioStream.on('data', (chunk) => {
        audioBuffer.push(chunk);
    });

    return new Promise((resolve, reject) => {
        audioStream.on('end', async () => {
            const audioData = Buffer.concat(audioBuffer);
            const store = storeFileInMemoryFs(fileName, audioData);

            const fileData = memoryFs.readFileSync(store);
            resolve(fileData);
            console.log(`Creado memory-fs: ${store}`);
        });

        audioStream.on('error', (error) => {
            reject(error)
        });
    });
}





function isValidURL(url) {
    let isValidURL = ytdl.validateURL(url)
    return isValidURL
}





module.exports = { cleanMemoryFs, isValidURL, getTitleAndThumbnail, isUrlLive, searchVideos, isVideoLive, downloadMp3Service }