/**
 * Validation middleware for API routes
 * Validates request body against Zod schemas
 */

import { NextRequest, NextResponse } from "next/server";
import { ZodSchema, ZodError } from "zod";

/**
 * Validate request body against a Zod schema
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data or throws ZodError
 */
export function validateBody<T>(schema: ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw error;
    }
    throw new Error("Validation failed");
  }
}

/**
 * Validate query parameters against a Zod schema
 * Automatically converts string values to appropriate types
 */
export function validateQuery<T>(schema: ZodSchema<T>, searchParams: URLSearchParams): T {
  const params: Record<string, any> = {};

  searchParams.forEach((value, key) => {
    // Try to parse as number
    if (!isNaN(Number(value))) {
      params[key] = Number(value);
    }
    // Try to parse as boolean
    else if (value === "true" || value === "false") {
      params[key] = value === "true";
    }
    // Keep as string
    else {
      params[key] = value;
    }
  });

  return schema.parse(params);
}

/**
 * Higher-order function to wrap API routes with validation
 *
 * @example
 * ```typescript
 * export const POST = withValidation(CreateTargetSchema, async (req, validatedData) => {
 *   // validatedData is fully typed and validated
 *   return NextResponse.json({ success: true });
 * });
 * ```
 */
export function withValidation<T>(
  schema: ZodSchema<T>,
  handler: (req: NextRequest, validatedData: T) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Parse request body
      const body = await req.json();

      // Validate against schema
      const validatedData = validateBody(schema, body);

      // Call handler with validated data
      return await handler(req, validatedData);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: error.issues.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
          { status: 422 }
        );
      }

      if (error instanceof SyntaxError) {
        return NextResponse.json(
          { error: "Invalid JSON in request body" },
          { status: 400 }
        );
      }

      console.error("Validation error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware to validate query parameters
 *
 * @example
 * ```typescript
 * export const GET = withQueryValidation(PlayerSearchSchema, async (req, params) => {
 *   // params is fully typed and validated
 *   return NextResponse.json({ results: [] });
 * });
 * ```
 */
export function withQueryValidation<T>(
  schema: ZodSchema<T>,
  handler: (req: NextRequest, validatedParams: T) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const { searchParams } = new URL(req.url);
      const validatedParams = validateQuery(schema, searchParams);

      return await handler(req, validatedParams);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: "Invalid query parameters",
            details: error.issues.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
          { status: 422 }
        );
      }

      console.error("Query validation error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

/**
 * Format Zod errors for user-friendly display
 */
export function formatZodError(error: ZodError): string {
  const messages = error.issues.map((err) => {
    const field = err.path.join(".");
    return field ? `${field}: ${err.message}` : err.message;
  });
  return messages.join(", ");
}
