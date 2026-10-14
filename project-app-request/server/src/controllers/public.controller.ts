import { Request, Response } from 'express';
import { createRequest } from '../services/requests.service';
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

export async function healthCheck(_req: Request, res: Response): Promise<void> {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
}
