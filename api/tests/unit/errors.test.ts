import { describe, it, expect } from 'vitest';
import { AppError, NotFoundError, UnauthorizedError, ForbiddenError, ConflictError, ValidationError } from '@/utils/errors';

describe('Custom Errors', () => {
  it('creates AppError with status code', () => {
    const error = new AppError(400, 'Bad request');
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Bad request');
    expect(error).toBeInstanceOf(Error);
  });

  it('creates NotFoundError', () => {
    const error = new NotFoundError('User');
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('User not found');
  });

  it('creates UnauthorizedError', () => {
    const error = new UnauthorizedError();
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Unauthorized');
  });

  it('creates ForbiddenError', () => {
    const error = new ForbiddenError('Not allowed');
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('Not allowed');
  });

  it('creates ConflictError', () => {
    const error = new ConflictError();
    expect(error.statusCode).toBe(409);
  });

  it('creates ValidationError', () => {
    const error = new ValidationError('Invalid input');
    expect(error.statusCode).toBe(422);
  });
});
