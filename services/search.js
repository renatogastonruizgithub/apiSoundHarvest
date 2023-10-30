const search = require('yt-search')
const ytdl = require("ytdl-core")

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

module.exports = { searchVideos }