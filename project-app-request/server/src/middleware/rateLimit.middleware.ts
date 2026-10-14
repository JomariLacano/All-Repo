import rateLimit from 'express-rate-limit';

/** Protects the public request-submission endpoint from spam/abuse. */
export const submitRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests submitted from this device. Please try again later.' },
});

/** Protects the login endpoint from brute-force attempts. */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
});

/** General-purpose limiter applied to all API routes. */
export const generalApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
