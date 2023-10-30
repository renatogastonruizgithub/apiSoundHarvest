const { searchVideos } = require('../services/search');


const search = async (req, res) => {
    const query = req.body.query;

    try {
        if (!query) {
            throw new Error("No se envio la consulta")
        }
        searchVideos(query, (err, videos) => {
            if (err) {
                throw new Error("No se encontraron videos")
            } else {
                res.status(200).json(videos);
            }
        })
    } catch (error) {
        res.status(400).json({ error: error.message });
    }


}

module.exports = { search }