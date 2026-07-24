import express from 'express';
import path from 'path';
import methodOverride from 'method-override';
import session from 'express-session';
import { engine } from 'express-handlebars';
import { HomeModel } from './models/home.model';
import { exposeUser } from './middleware/auth.middleware';
import authRoutes from './routes/auth.routes';
import gamesRoutes from './routes/games.routes';

const app = express();

app.engine(
  'hbs',
  engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, '..', 'views', 'layouts'),
    partialsDir: path.join(__dirname, '..', 'views', 'partials'),
    helpers: {
      eq: (a: unknown, b: unknown) => a === b,
    },
  }),
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'gamevault-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);
app.use(exposeUser);

app.use('/auth', authRoutes);
app.use('/games', gamesRoutes);

app.get('/', async (_req, res) => {
  try {
    const [featured, stats] = await Promise.all([HomeModel.getFeatured(6), HomeModel.getStats()]);
    res.render('home', { isHome: true, featured, stats });
  } catch (error) {
    console.error(error);
    res.render('home', {
      isHome: true,
      featured: [],
      stats: { games: 0, platforms: 0, genres: 0 },
    });
  }
});

app.use((_req, res) => {
  res.status(404).render('404');
});

export default app;
