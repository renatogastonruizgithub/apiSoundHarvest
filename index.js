const express = require("express")
const cors = require("cors")
const ytdl = require("ytdl-core");
const path = require("path");
const MemoryFS = require('memory-fs');
const memoryFs = new MemoryFS();
const search = require('yt-search');
const app = express();
app.use(
    cors({
        origin: ["https://sound-harvest.vercel.app", "http://127.0.0.1:5173"],
        methods: "GET,POST",
        allowedHeaders: ['Content-Type'], // Encabezados permitidos
        preflightContinue: false,
        optionsSuccessStatus: 204,
    })
)


app.use(express.json());

const port = 8080;

const pathMemori = "/mp3";
const fileTimestamps = {}; // Objeto para rastrear la hora en que se almacenó cada archivo


memoryFs.mkdirSync(pathMemori, { recursive: true });// Crea el directorio si no existe

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
        const info = await ytdl.getBasicInfo(videoUrl)
        const videoDetails = info.videoDetails

        // Obtener el título del video
        const title = videoDetails.title.replace(/[^a-zA-Z0-9]/g, ' ')

        // Obtener la URL de la primera miniatura (thumbnail)
        const thumbnailUrl = videoDetails.thumbnails[0].url

        return {
            title: title,
            thumbnailUrl: thumbnailUrl,
        }
    }

    catch (error) {
        console.error("¡Ups!, enlace de YouTube incorrecto", error)
        throw new Error("¡Ups!, enlace de YouTube incorrecto");
    }
}



async function downloadAudio(videoUrl) {
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
}


app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});


app.post('/sendUrl', async (req, res) => {
    const { url } = req.body;
    if (typeof url === "string" && url.trim() !== "") {

        try {
            const { title, thumbnailUrl } = await getTitleAndThumbnail(url)
            res.status(200).json({ title: title, thumbnail: thumbnailUrl });
            cleanMemoryFs();
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }

    } else {
        res.status(400).json({ error: "Invalid video URL format." });
    }
});


app.post('/downloads', async (req, res) => {

    try {
        const { url } = req.body;

        const timestamp = new Date().getTime();
        const fileName = `${timestamp}.mp3`;
        const audioStream = await downloadAudio(url);

        const audioBuffer = [];
        audioStream.on('data', (chunk) => {
            audioBuffer.push(chunk);
        });

        audioStream.on('end', async () => {
            const audioData = Buffer.concat(audioBuffer);

            const store = storeFileInMemoryFs(fileName, audioData);

            console.log(`Audio generado en memory-fs: ${store}`);
            const fileData = memoryFs.readFileSync(store);
            res.setHeader('Content-Type', 'audio/mpeg');
            res.status(200).send(fileData);

        });
        cleanMemoryFs();
        /*  setInterval(cleanMemoryFs, 1000); */
    } catch (error) {
        res.status(500).send("Error downloading audio" + error);
    }
});

app.post("/search", (req, res) => {
    const query = req.body.query;

    search(query, (err, r) => {
        if (err) {
            res.status(500).send(err);
        } else {
            // Filtrar los resultados para excluir LiveSearchResult
            const videos = r.videos.filter((video) => video.type === 'video')
                .map((video) => ({
                    title: video.title,
                    url: video.url,
                    thumbnail: video.thumbnail,
                }));
            res.status(200).json(videos);
        }
    });
});

app.get('/', async (req, res) => {
    try {

        res.status(200).send("Server on");

    } catch (error) {
        res.status(500).send("Server Error");
    }
});




