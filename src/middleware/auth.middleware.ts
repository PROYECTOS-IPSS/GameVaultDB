import { NextFunction, Request, Response } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  return next();
}

export function guestOnly(req: Request, res: Response, next: NextFunction) {
  if (req.session.userId) {
    return res.redirect('/');
  }
  return next();
}

export function exposeUser(req: Request, res: Response, next: NextFunction) {
  res.locals.user = req.session.userId
    ? { id: req.session.userId, name: req.session.userName }
    : null;
  return next();
}
