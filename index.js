const express = require("express")

const cors = require("cors")
const ytdl = require("ytdl-core");
const path = require("path");
const app = express();
app.use(
    cors({
        origin: ["https://sound-harvest.vercel.app/", "http://localhost:5173", "http://127.0.0.1:5173"],

    })
)


app.use(express.json());
const port = 8080;
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});

let videoUrl = "";



const downloadDirectory = path.join(__dirname, "/downloadAudio") // Define el directorio

//si no existe lo crea el directorio
const fs = require("fs");
if (!fs.existsSync(downloadDirectory)) {
    fs.mkdirSync(downloadDirectory);
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

    let options = {
        format: "mp3",
        quality: "highestaudio",
        filter: "audio",
    };
    const { title } = await getTitleAndThumbnail(videoUrl);
    const stream = ytdl(videoUrl, options);

    const filePath = `${downloadDirectory}/${title}.mp3`;

    await new Promise((resolve, reject) => {
        const audioFile = stream.pipe(require("fs").createWriteStream(filePath));

        audioFile.on("finish", () => {
            console.log("Audio downloaded");
            resolve(filePath);
        });

        audioFile.on("error", (error) => {
            console.error("Error downloading audio:", error);
            reject(error);
        });
    });

    return filePath;
}



app.post('/sendUrl', async (req, res) => {
    const { url } = req.body;
    if (typeof url === "string" && url.trim() !== "") {
        videoUrl = url;

        try {
            const { title, thumbnailUrl } = await getTitleAndThumbnail(videoUrl)
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
        const fileName = await downloadAudio(videoUrl);
        const headers = {
            "Content-Disposition": `attachment; filename=${fileName}`,
            Authorization: "license ec2a55f4",

        }
        res.set('Content-Type', 'audio/mpeg');
        res.set(headers)


        // Envía el archivo para descargar
        res.download(fileName);

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




