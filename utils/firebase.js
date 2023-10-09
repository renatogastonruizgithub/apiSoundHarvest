const { initializeApp } = require("firebase/app");

const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} = require("firebase/storage");
/* const fs = require("fs"); */ //lee archivos asincronos

const MemoryFS = require('memory-fs');
const fs = new MemoryFS();

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

const upload = async (path) => {
  const metadata = {
    contentType: "image/jpeg",
  };

  const fileData = fs.readFileSync(path); // Lee los datos del archivo en memoria
  const uint8Array = new Uint8Array(fileData); // Convierte los datos a Uint8Array

  const storageRef = ref(storage, "mp3/audsssio.mp3");
  try {
    const snapshot = await uploadBytes(storageRef, uint8Array, metadata);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    // Manejar el error de alguna manera, por ejemplo, registrándolo o lanzándolo nuevamente.
    console.error("Error al cargar la imagen:", error);
    throw error; // Lanzar el error nuevamente para que se maneje en la función que llamó a uplpoadImagen.
  }
};



module.exports = { apps, upload };
