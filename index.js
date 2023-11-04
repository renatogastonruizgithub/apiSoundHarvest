require("dotenv").config()
const express = require("express")
const cors = require("cors")
const indexRouter = require("./routes/index")
const port = 8080;
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
app.use("/", indexRouter);


app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});


app.get('/', async (req, res) => {
    try {

        res.status(200).send("Server on");

    } catch (error) {
        res.status(500).send("Server Error");
    }
});




