import { UserRole } from '../models/shared/Enums';

// First define the core Express interfaces
interface Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    isAdmin?: boolean;
  };
  headers: any;
  path: string;
  method: string;
  body: any;
  params: any;
  query: any;
  ip: string;
  cookies: {
    [key: string]: string;
  };
}

interface Response {
  status(code: number): Response;
  json(body: any): Response;
  end(): void;
  on(event: string, callback: () => void): void;
  statusCode: number;
  setHeader(name: string, value: string): Response;
  getHeader(name: string): string | undefined;
  headersSent: boolean;
  send(body: any): Response;
  cookie(name: string, value: string, options?: any): Response;
  clearCookie(name: string, options?: any): Response;
}

interface NextFunction {
  (err?: any): void;
}

interface Application {
  use: any;
  get: any;
  post: any;
  put: any;
  delete: any;
  listen: any;
}

// Export these as our local types
export { Request, Response, NextFunction, Application };

// Also augment the express module to include our additions
declare module 'express' {
  export interface Request {
    user?: {
      id: string;
      email: string;
      role: UserRole;
      isAdmin?: boolean;
    };
    headers: any;
    path: string;
    method: string;
    body: any;
    params: any;
    query: any;
    ip: string;
    cookies: {
      [key: string]: string;
    };
  }

  export interface Response {
    status(code: number): Response;
    json(body: any): Response;
    end(): void;
    on(event: string, callback: () => void): void;
    statusCode: number;
    setHeader(name: string, value: string): Response;
    getHeader(name: string): string | undefined;
    headersSent: boolean;
    send(body: any): Response;
    cookie(name: string, value: string, options?: any): Response;
    clearCookie(name: string, options?: any): Response;
  }

  export interface NextFunction {
    (err?: any): void;
  }

  export interface Application {
    use: any;
    get: any;
    post: any;
    put: any;
    delete: any;
    listen: any;
  }

  export function Router(): any;
  export function json(): any;
}

// Add Router export
export const Router = (): any => {
  // @ts-ignore
  return require('express').Router();
};

// Add json middleware export
export const json = (): any => {
  // @ts-ignore
  return require('express').json();
}; 