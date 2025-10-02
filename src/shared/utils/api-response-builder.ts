import type { APIGatewayProxyResult } from "aws-lambda";

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: {
    message: string;
    code: string;
  };
}

export class ApiResponseBuilder {
  private static buildResponse(
    statusCode: number,
    body: ApiResponse
  ): APIGatewayProxyResult {
    return {
      statusCode,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(body),
    };
  }

  static success(data: any): APIGatewayProxyResult {
    return this.buildResponse(200, {
      success: true,
      data,
    });
  }

  static created(data: any): APIGatewayProxyResult {
    return this.buildResponse(201, {
      success: true,
      data,
    });
  }

  static badRequest(message: string): APIGatewayProxyResult {
    return this.buildResponse(400, {
      success: false,
      error: {
        message,
        code: "BAD_REQUEST",
      },
    });
  }

  static notFound(message: string): APIGatewayProxyResult {
    return this.buildResponse(404, {
      success: false,
      error: {
        message,
        code: "NOT_FOUND",
      },
    });
  }

  static validationError(message: string): APIGatewayProxyResult {
    return this.buildResponse(422, {
      success: false,
      error: {
        message,
        code: "VALIDATION_ERROR",
      },
    });
  }

  static internalError(message: string): APIGatewayProxyResult {
    return this.buildResponse(500, {
      success: false,
      error: {
        message,
        code: "INTERNAL_ERROR",
      },
    });
  }
}
