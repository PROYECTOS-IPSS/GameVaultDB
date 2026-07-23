import express from "express";
import path from "path";
import { engine } from "express-handlebars";
import authRoutes from "./routes/auth.routes";
import gamesRoutes from "./routes/games.routes";

const app = express();

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/auth", authRoutes);
app.use("/games", gamesRoutes);

app.get("/", (_req, res) => {
  res.render("home");
});

app.use((_req, res) => {
  res.status(404).render("404");
});

export default app;
