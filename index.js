const express = require("express")
const cors = require("cors")
const ytdl = require("ytdl-core");
const path = require("path");


const app = express();
app.use(
    cors({
        origin: ["https://sound-harvest.vercel.app", "http://127.0.0.1:5173"],
        methods: "GET,POST",
        preflightContinue: false,
        optionsSuccessStatus: 204,
    })
)


app.use(express.json());
const port = 8080;
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});





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


app.get('/downloads', async (req, res) => {
    try {
        const videoUrl = req.query.videoUrl
        res.set('Content-Type', 'audio/mpeg');
        const audioStream = await downloadAudio(videoUrl);
        audioStream.pipe(res)

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




