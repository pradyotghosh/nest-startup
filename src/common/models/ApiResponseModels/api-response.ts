import { HttpStatus } from "@nestjs/common";
import { ErrorResponse } from "./error-response";
import { PageInfo } from "./pagin-info";

export interface ApiResponse<T> {
  data?: T | null;
  error?: ErrorResponse;
  status: HttpStatus;
  pageInfo?: PageInfo;
}
