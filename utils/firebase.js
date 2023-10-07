const { initializeApp } = require("firebase/app");

const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} = require("firebase/storage");
const fs = require("fs"); //lee archivos asincronos

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

const uplpoadMp3 = async (path, title) => {
  const metadata = {
    contentType: "audio/mpeg",
  };
  console.log(path)

  const storageRef = ref(storage, `mp3/${title}`);
  try {
    const snapshot = await uploadBytes(storageRef, fs.readFileSync(path), metadata);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {

    console.error("Error al subir mp3 firebase:", error);
    throw new Error("Error al subir mp3 firebase:", error);
  }
};

const uploadImagesArray = async (imagePaths) => {
  const imageUrls = [];

  for (const imagePath of imagePaths) {
    const imageUrl = await uplpoadImagen(imagePath);
    console.log("resultado" + imageUrl)
    imageUrls.push(imageUrl);
  }

  return imageUrls;
};


module.exports = { apps, uplpoadMp3, uploadImagesArray };
