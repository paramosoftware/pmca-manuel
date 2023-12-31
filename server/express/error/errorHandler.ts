import { Prisma } from "@prisma/client";
import type { ErrorRequestHandler } from "express";
import multer from "multer";
import { CustomError } from ".";


const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // TODO: Create log file
  if (process.env.NODE_ENV === 'development') {
    console.log(err);
  };

  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: err.message });
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(400).json({
        message: 'unique',
        field: err.meta.target[0]
      });
    } else if (err.code === 'P2025') {
      res.status(400).json({
        message: 'Record or related record not found',
      });
    } else {
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  } else if (err instanceof CustomError) {
    res.status(err.statusCode).json({ error: { type: err.name, message: err.message } });
  } else {
    res.status(500).json({ error: true ? err : 'An unexpected error occurred' });
  }
};

export default errorHandler;