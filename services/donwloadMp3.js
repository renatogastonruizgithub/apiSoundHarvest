const MemoryFS = require('memory-fs');
const memoryFs = new MemoryFS();
const { isUrlLive, isVideoLive, downloadMedia } = require('../utils/helpers');


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



const downloadMp3Service = async (url, mediaType) => {
    const timestamp = new Date().getTime()

    if (isUrlLive(url)) {
        throw new Error("¡Ups!, no se pueden descargar videos en vivo")
    }
    let chechLive = await isVideoLive(url)
    if (chechLive) {
        throw new Error("¡Ups!, no se pueden descargar videos en vivo")
    }
    cleanMemoryFs()

    const fileName = `${timestamp}.${mediaType === 'video' ? 'mp4' : 'mp3'}`

    const audioStream = await downloadMedia(url, mediaType)


    const audioBuffer = []
    audioStream.on('data', (chunk) => {
        audioBuffer.push(chunk)

    });

    return new Promise((resolve, reject) => {
        audioStream.on('end', async () => {
            const audioData = Buffer.concat(audioBuffer)
            const store = storeFileInMemoryFs(fileName, audioData)
            const fileData = memoryFs.readFileSync(store)
            resolve(fileData)
            console.log(`Creado memory-fs: ${store}`)
        });

        audioStream.on('error', (error) => {
            reject(error)
        });
    });

}




module.exports = { cleanMemoryFs, downloadMp3Service, }