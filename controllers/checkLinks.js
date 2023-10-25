const { isUrlLive, getTitleAndThumbnail, isValidURL, cleanMemoryFs } = require('../services/service');

const checkLink = async (req, res) => {

    const { url } = req.body


    try {
        if (!url) {
            throw new Error("No se envio la url")
        }

        if (isUrlLive(url)) {
            throw new Error("¡Ups!, no se pueden descargar videos en vivo")
        }
        else {
            if (isValidURL(url)) {
                cleanMemoryFs()
                if (typeof url === "string" && url.trim() !== "") {
                    try {
                        const { title, thumbnailUrl } = await getTitleAndThumbnail(url)
                        return res.status(200).json({ title: title, thumbnail: thumbnailUrl })


                    } catch (error) {
                        return res.status(400).json({ error: error.message })
                    }

                } else {
                    return res.status(400).json({ error: "Formato incorrecto de URL" })
                }
            } else {
                return res.status(400).json({ error: "URL o ID de video incorrecto" })
            }
        }
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

module.exports = { checkLink }










