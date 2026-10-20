import { ZodObject, ZodRawShape } from "zod";
import { Request, Response, NextFunction } from "express";

const sanitize = (val: string) =>
  String(val).replace(/[<>"'&]/g, (c) => `&#${c.charCodeAt(0)};`);

export const validate =
  (schema: ZodObject<ZodRawShape>) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      const sanitizedErrors = error.errors?.map((e: any) => ({
        ...e,
        message: sanitize(e.message ?? ""),
      }));
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: sanitizedErrors,
      });
    }
  };
