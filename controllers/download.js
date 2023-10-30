const { downloadMp3Service } = require('../services/donwloadMp3');
const { downloadMp4Service } = require('../services/downloadMp4');

const downloadMp3 = async (req, res) => {
    const { url, mediaType } = req.body;

    try {
        if (!req.body) {
            throw new Error("No se envio la url")
        }

        const store = await downloadMp3Service(url, mediaType)


        res.setHeader('Content-Type', 'audio/mp3')
        res.status(200).send(store)

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: error.message });
    }
}
const downloadMp4 = async (req, res) => {
    const { url, mediaType } = req.body;

    try {
        if (!req.body) {
            throw new Error("No se envio la url")
        }

        const store = await downloadMp4Service(url, mediaType)

        res.setHeader('Content-Type', 'video/mp4');
        res.status(200).json(store);
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: error.message });
    }
}



module.exports = { downloadMp3, downloadMp4 };