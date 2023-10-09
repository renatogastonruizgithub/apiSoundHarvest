const express = require("express")
const cors = require("cors")
const ytdl = require("ytdl-core");
const path = require("path");
const MemoryFS = require('memory-fs');
const fs = new MemoryFS();
const { initializeApp } = require("firebase/app");

const {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
} = require("firebase/storage");
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
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});

const firebaseConfig = {
    apiKey: "AIzaSyB7ueuh52WbicixzK2ArAgxQ1KrcUD-oPQ",
    authDomain: "portafolio-ecd13.firebaseapp.com",
    projectId: "portafolio-ecd13",
    storageBucket: "portafolio-ecd13.appspot.com",
    messagingSenderId: "285148909880",
    appId: "1:285148909880:web:bdeff8fb5ca7b66161b1cd",
};

const apps = initializeApp(firebaseConfig);
const storage = getStorage(apps);



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
        const options = {
            format: "mp3",
            quality: "highestaudio",
            filter: "audio",
        }
        const stream = ytdl(videoUrl, options)
        return stream
    } catch (error) {
        console.log("Error", error);
        throw new Error("Error al descargar audio", error);
    }
}



app.post('/sendUrl', async (req, res) => {
    const { url } = req.body;
    if (typeof url === "string" && url.trim() !== "") {

        try {
            const { title, thumbnailUrl } = await getTitleAndThumbnail(url)
            res.status(200).json({ nameFile: title, image: thumbnailUrl });
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
        res.header('Access-Control-Allow-Origin', 'https://sound-harvest.vercel.app');

        const path = '/mp3';

        // Crea el directorio si no existe
        fs.mkdirSync(path, { recursive: true });

        const audioStream = await downloadAudio(url);

        const audioBuffer = [];
        audioStream.on('data', (chunk) => {
            audioBuffer.push(chunk);
        });

        audioStream.on('end', async () => {
            const audioData = Buffer.concat(audioBuffer);

            fs.writeFileSync(`${path}/audios.mp3`, audioData);

            const filePath = `${path}/audios.mp3`;


            try {
                const metadata = {
                    contentType: "audio/mpeg",
                };
                // Llama a la función upload para cargar el archivo
                const fileData = fs.readFileSync(filePath); // Lee los datos del archivo en memoria
                const uint8Array = new Uint8Array(fileData); // Convierte los datos a Uint8Array
                console.log(fileData)
                const storageRef = ref(storage, "mp3/");
                await uploadBytes(storageRef, uint8Array, metadata);
                const url = await getDownloadURL(storageRef);
                res.setHeader('Content-Type', 'audio/mpeg');
                res.json({ file: url });
            } catch (error) {
                res.status(500).send("Error uploading audio");
            }
        });

    } catch (error) {
        res.status(500).send("Error downloading audio");
    }
});








app.get('/', async (req, res) => {
    try {

        res.status(200).send("Server on");

    } catch (error) {
        res.status(500).send("Server Error");
    }
});




