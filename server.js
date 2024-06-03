const { readdirSync } = require("fs");
const path = require("path");
const express = require("express");
const app = express();
const helmet = require("helmet");
const mongoose = require("mongoose");
require("dotenv").config();
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const Counter = require('./models/CounterModel');


// middlewares
app.use(cors({
    origin: [
        "https://travel-guru-a9df2.web.app",
        "http://localhost:5173"
    ],
    credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(cookieParser())

// routes middleware
readdirSync("./routes").map((r) =>
    app.use("/api/v1", require(`./routes/${r}`))
);

const initializeCounter = async () => {
    const counter = await Counter.findOne({ name: 'biodataId' });
    if (!counter) {
        await Counter.create({ name: 'biodataId', seq: 1 });
    }
};
// server
const port = process.env.PORT || 8000;



// Connect to DB and start server
mongoose
    .connect(process.env.DATABASE)
    .then(() => {
        app.listen(port, () => {
            console.log(`Server Running on port ${port}`);
            initializeCounter().catch(console.error);
        });
    })
    .catch((err) => console.log(err));
