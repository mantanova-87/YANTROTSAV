import { AppwriteException } from 'appwrite'

export type AppErrorCode =
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_UNAUTHORIZED'
  | 'AUTH_USER_ALREADY_EXISTS'
  | 'AUTH_SESSION_EXPIRED'
  | 'TEAM_FULL'
  | 'TEAM_NOT_FOUND'
  | 'TEAM_ALREADY_REGISTERED'
  | 'INVITATION_NOT_FOUND'
  | 'INVITATION_ALREADY_RESPONDED'
  | 'EVENT_NOT_FOUND'
  | 'EVENT_REGISTRATION_CLOSED'
  | 'EVENT_CAPACITY_REACHED'
  | 'ALREADY_REGISTERED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR'

/**
 * Custom Application Error class
 */
export class AppError extends Error {
  public readonly code: AppErrorCode
  public readonly status: number
  public readonly originalError?: unknown
  public suggestion?: string

  constructor(
    message: string,
    code: AppErrorCode = 'UNKNOWN_ERROR',
    status: number = 500,
    originalError?: unknown,
    suggestion?: string,
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.status = status
    this.originalError = originalError
    this.suggestion = suggestion

    // Restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * Environment-aware logger
 */
export function logError(error: AppError, context?: string): void {
  const isDev = import.meta.env.DEV

  if (isDev) {
    console.group(`🚨 [YANTROTSAV AppError] in ${context || 'Anonymous Context'}`)
    console.error(`Code: ${error.code}`)
    console.error(`Message: ${error.message}`)
    console.error(`HTTP Status: ${error.status}`)
    if (error.originalError) {
      console.error('Original Error:', error.originalError)
    }
    if (error.stack) {
      console.debug('Stack Trace:', error.stack)
    }
    console.groupEnd()
  } else {
    // In production, suppress sensitive internal details from user visibility
    // Forward structured metadata to production loggers / Sentry if configured
    console.error(
      JSON.stringify({
        tag: 'YANTROTSAV_ERROR',
        context: context || 'global',
        code: error.code,
        status: error.status,
        timestamp: new Date().toISOString(),
      }),
    )
  }
}

/**
 * Centralized Appwrite SDK error mapper
 */
export function mapAppwriteError(error: unknown, context?: string): AppError {
  let mappedError: AppError

  if (error instanceof AppError) {
    mappedError = error
  } else if (error instanceof AppwriteException) {
    const status = error.code || 500
    const message = error.message || 'An unexpected Appwrite error occurred.'

    switch (status) {
      case 401: {
        const errorType = (error as any)?.type || ''
        const lowerMsg = (message || '').toLowerCase()

        if (
          errorType === 'user_unauthorized' ||
          errorType === 'general_unauthorized_scope' ||
          lowerMsg.includes('not authorized') ||
          lowerMsg.includes('permission') ||
          lowerMsg.includes('forbidden')
        ) {
          mappedError = new AppError(
            'You do not have permission to perform this action.',
            'AUTH_UNAUTHORIZED',
            403,
            error,
          )
        } else {
          mappedError = new AppError(
            'Invalid credentials or session expired. Please log in again.',
            'AUTH_SESSION_EXPIRED',
            401,
            error,
          )
        }
        break
      }

      case 403:
        mappedError = new AppError(
          'You do not have permission to perform this action.',
          'AUTH_UNAUTHORIZED',
          403,
          error,
        )
        break

      case 409: {
        const lowerMsg = message.toLowerCase()
        if (
          lowerMsg.includes('roll') ||
          lowerMsg.includes('rollnumber') ||
          lowerMsg.includes('idx_rollnumber')
        ) {
          mappedError = new AppError(
            'A student with this Roll Number is already registered.',
            'ALREADY_REGISTERED',
            409,
            error,
          )
        } else if (
          lowerMsg.includes('email') ||
          lowerMsg.includes('user') ||
          lowerMsg.includes('idx_email')
        ) {
          mappedError = new AppError(
            'An account with this email address already exists.',
            'AUTH_USER_ALREADY_EXISTS',
            409,
            error,
          )
        } else if (lowerMsg.includes('userid') || lowerMsg.includes('idx_userid')) {
          mappedError = new AppError(
            'A profile for this user account already exists.',
            'ALREADY_REGISTERED',
            409,
            error,
          )
        } else {
          mappedError = new AppError(
            'A record with these unique details already exists.',
            'ALREADY_REGISTERED',
            409,
            error,
          )
        }
        break
      }

      case 404:
        mappedError = new AppError(
          'The requested resource was not found.',
          'EVENT_NOT_FOUND',
          404,
          error,
        )
        break

      case 400:
        mappedError = new AppError(
          message || 'Invalid request parameters.',
          'UNKNOWN_ERROR',
          400,
          error,
        )
        break

      default:
        mappedError = new AppError(
          message || 'A server error occurred. Please try again.',
          'UNKNOWN_ERROR',
          status,
          error,
        )
        break
    }
  } else if (error instanceof Error) {
    mappedError = new AppError(error.message, 'UNKNOWN_ERROR', 500, error)
  } else {
    mappedError = new AppError('An unknown error occurred.', 'UNKNOWN_ERROR', 500, error)
  }

  logError(mappedError, context)
  return mappedError
}
