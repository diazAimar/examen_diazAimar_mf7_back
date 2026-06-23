import { Response } from "express";
import Joi from "joi";
import { sendResponse } from "./sendResponse";

export const handleValidationErrors = (
  res: Response,
  error: Joi.ValidationError,
) => {
  const errors = error.details.map((e) => ({
    key: e.context?.key ?? "",
    message: e.message,
  }));

  return sendResponse({ res: res, status: 422, validationErrors: errors });
};
