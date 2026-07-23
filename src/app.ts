import express from "express";
import path from "path";
import { engine } from "express-handlebars";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "..", "views", "layouts"),
    partialsDir: path.join(__dirname, "..", "views", "partials"),
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "..", "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (_req, res) => {
  res.render("home", { title: "PlaySync" });
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
