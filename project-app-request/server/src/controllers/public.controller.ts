import { Request, Response } from 'express';
import { createRequest, sendPing, trackRequest } from '../services/requests.service';
import { CreateRequestInput } from '../services/requests.service';

interface CreateRequestBody extends CreateRequestInput {
  consent: true;
  website?: string;
}

/** POST /api/requests — public endpoint, no authentication required. */
export async function submitRequest(req: Request, res: Response): Promise<void> {
  const body = req.body as CreateRequestBody;

  // Honeypot check: if the hidden field was filled in, silently pretend success
  // (do not tip off bots) without persisting anything.
  if (body.website) {
    res.status(201).json({
      referenceNumber: 'PR-0000-000000',
      message: 'Request received.',
    });
    return;
  }

  const created = await createRequest({
    fullName: body.fullName,
    email: body.email,
    contactNumber: body.contactNumber,
    preferredContactMethod: body.preferredContactMethod,
    projectTitle: body.projectTitle,
    description: body.description,
    initialProposedAmount: body.initialProposedAmount,
    category: body.category,
    otherCategory: body.category === 'Other' ? body.otherCategory ?? null : null,
  });

  res.status(201).json({
    referenceNumber: created.referenceNumber,
    message: 'Your project request has been submitted successfully.',
  });
}

const TRACK_NOT_FOUND_MESSAGE = 'We could not find a request matching the provided information.';

/** POST /api/requests/track — public endpoint. Requires both reference number and email to match. */
export async function trackRequestHandler(req: Request, res: Response): Promise<void> {
  const { referenceNumber, email } = req.body as { referenceNumber: string; email: string };

  const result = await trackRequest(referenceNumber, email);

  if (!result) {
    // Deliberately generic: never reveal whether the reference number or email was the mismatch.
    res.status(404).json({ error: TRACK_NOT_FOUND_MESSAGE });
    return;
  }

  res.status(200).json({ request: result });
}

/** POST /api/requests/:id/ping — public endpoint. Sends a client follow-up on their own request. */
export async function sendPingHandler(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { referenceNumber, email, message } = req.body as {
    referenceNumber: string;
    email: string;
    message?: string;
  };

  const result = await sendPing({
    requestId: id,
    referenceNumber,
    email,
    message: message && message.trim().length > 0 ? message.trim() : null,
  });

  if (!result.success) {
    if (result.reason === 'not_found') {
      res.status(404).json({ error: TRACK_NOT_FOUND_MESSAGE });
      return;
    }
    if (result.reason === 'closed_status') {
      res.status(400).json({
        error: 'This request has already been completed or rejected, so follow-ups are no longer available.',
      });
      return;
    }
    // cooldown
    res.status(429).json({
      error: 'You recently sent a follow-up. Please wait before sending another one.',
      nextAllowedAt: result.nextAllowedAt,
    });
    return;
  }

  res.status(201).json({
    message: 'Your follow-up has been sent.',
    pingCount: result.request.pingCount,
    lastPingAt: result.request.lastPingAt,
  });
}

export async function healthCheck(_req: Request, res: Response): Promise<void> {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
}
