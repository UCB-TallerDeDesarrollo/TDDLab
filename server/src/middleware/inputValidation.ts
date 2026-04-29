import { Request, Response, NextFunction } from "express";

/**
 * Validates that a parameter is a valid number
 */
export function validateNumericId(paramName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId) || parsedId <= 0) {
      res.status(400).json({ error: `Invalid ${paramName}: must be a positive number` });
      return;
    }

    // Store the parsed ID back for use in controllers
    (req.params as any)[paramName] = parsedId;
    next();
  };
}

/**
 * Validates that required fields are present in request body
 */
export function validateRequiredFields(requiredFields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
      return;
    }

    next();
  };
}

/**
 * Sanitizes string input to prevent injection attacks
 */
export function sanitizeInput(input: unknown): string {
  if (typeof input !== "string") {
    return String(input ?? "");
  }

  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML/XML tags
    .slice(0, 1000); // Limit length to prevent DoS
}

/**
 * Validates and sanitizes user input in request body
 */
export function validateAndSanitizeBody(fieldsToSanitize: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const field of fieldsToSanitize) {
      if (req.body[field]) {
        req.body[field] = sanitizeInput(req.body[field]);
      }
    }
    next();
  };
}
