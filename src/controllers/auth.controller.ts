import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { loginSchema, registerSchema } from '../schemas/user.schema';

function fieldErrors(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  return error.issues.map((issue) => ({
    field: String(issue.path[0] ?? 'form'),
    message: issue.message,
  }));
}

export const AuthController = {
  showLogin(req: Request, res: Response) {
    res.render('auth/login', {
      title: 'Ingresar',
      isAuth: true,
      values: { email: '' },
      error: null,
      errors: [],
    });
  },

  showRegister(_req: Request, res: Response) {
    res.render('auth/register', {
      title: 'Registrarse',
      isAuth: true,
      values: {
        nombre: '',
        apellido: '',
        email: '',
      },
      error: null,
      errors: [],
    });
  },

  async register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).render('auth/register', {
        title: 'Registrarse',
        isAuth: true,
        values: req.body,
        error: 'Revisa los datos del formulario',
        errors: fieldErrors(parsed.error),
      });
    }

    try {
      const existing = await UserModel.findByEmail(parsed.data.email);
      if (existing) {
        return res.status(409).render('auth/register', {
          title: 'Registrarse',
          isAuth: true,
          values: req.body,
          error: 'Ya existe una cuenta con ese email',
          errors: [{ field: 'email', message: 'Email ya registrado' }],
        });
      }

      const user = await UserModel.create({
        nombre: parsed.data.nombre,
        apellido: parsed.data.apellido,
        email: parsed.data.email,
        password: parsed.data.password,
      });

      req.session.userId = user.id;
      req.session.userName = `${user.nombre} ${user.apellido}`;

      return res.redirect('/');
    } catch (error) {
      console.error(error);
      return res.status(500).render('auth/register', {
        title: 'Registrarse',
        isAuth: true,
        values: req.body,
        error: 'No se pudo crear la cuenta',
        errors: [],
      });
    }
  },

  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).render('auth/login', {
        title: 'Ingresar',
        isAuth: true,
        values: { email: req.body.email ?? '' },
        error: 'Revisa los datos del formulario',
        errors: fieldErrors(parsed.error),
      });
    }

    try {
      const user = await UserModel.findByEmail(parsed.data.email);

      if (!user || !user.active) {
        return res.status(401).render('auth/login', {
          title: 'Ingresar',
          isAuth: true,
          values: { email: parsed.data.email },
          error: 'Credenciales inválidas',
          errors: [],
        });
      }

      const valid = await UserModel.verifyPassword(parsed.data.password, user.password);
      if (!valid) {
        return res.status(401).render('auth/login', {
          title: 'Ingresar',
          isAuth: true,
          values: { email: parsed.data.email },
          error: 'Credenciales inválidas',
          errors: [],
        });
      }

      req.session.userId = user.id;
      req.session.userName = `${user.nombre} ${user.apellido}`;

      return res.redirect('/');
    } catch (error) {
      console.error(error);
      return res.status(500).render('auth/login', {
        title: 'Ingresar',
        isAuth: true,
        values: { email: parsed.data.email },
        error: 'No se pudo iniciar sesión',
        errors: [],
      });
    }
  },

  logout(req: Request, res: Response) {
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
      }
      res.clearCookie('connect.sid');
      return res.redirect('/');
    });
  },
};
