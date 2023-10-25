const { downloadMp3Service } = require('../services/service');

const downloadMp3 = async (req, res) => {
    const { url, mediaType } = req.body;

    try {
        if (!req.body) {
            throw new Error("No se envio la url")
        }

        const store = await downloadMp3Service(url, mediaType)
        if (mediaType === 'audio') {
            res.setHeader('Content-Type', 'audio/mpeg');
        } else if (mediaType === 'video') {
            res.setHeader('Content-Type', 'video/mp4'); // Configura el tipo de contenido para videos MP4
        }
        res.status(200).send(store);

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { downloadMp3 };