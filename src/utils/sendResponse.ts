import { Response } from "express";

interface SendResponseOptions<T> {
  res: Response;
  data?: T | null;
  error?: string | null;
  validationErrors?: { key: string; message: string }[] | null;
  status?: number;
}

export const sendResponse = <T>({
  res,
  data = null,
  error = null,
  validationErrors = null,
  status = 200,
}: SendResponseOptions<T>) => {
  return res.status(status).json({
    data,
    error,
    validationErrors,
  });
};
