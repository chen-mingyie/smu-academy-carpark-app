import type { Request, Response } from 'express';

/**
 * Serverless Carpark Availability Handler
 * Route: GET /api/carparkavailability
 * Proxies live data from LTA's DataMall CarParkAvailabilityv2 endpoint
 */
export default async function handler(req: Request, res: Response) {
  // Read AccountKey from environment variables (no hardcoded keys)
  const accountKey =
    process.env.LTA_DATAMALL_ACCOUNT_KEY ||
    process.env.LTA_ACCOUNT_KEY ||
    process.env.ACCOUNT_KEY;

  if (!accountKey) {
    return res.status(503).json({
      error: 'ACCOUNT_KEY_MISSING',
      message:
        'LTA DataMall AccountKey is not set. Please define LTA_DATAMALL_ACCOUNT_KEY in your environment or .env file.',
      endpoint:
        'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
    });
  }

  try {
    const ltaEndpoint = new URL(
      'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2'
    );

    // Support optional $skip query parameter for pagination if requested
    const skipParam = req.query.$skip || req.query.skip;
    if (skipParam) {
      ltaEndpoint.searchParams.set('$skip', String(skipParam));
    }

    const response = await fetch(ltaEndpoint.toString(), {
      method: 'GET',
      headers: {
        'AccountKey': accountKey,
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return res.status(response.status).json({
        error: 'LTA_DATAMALL_ERROR',
        status: response.status,
        statusText: response.statusText,
        details: errorBody,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({
      error: 'PROXY_REQUEST_FAILED',
      message: error?.message || 'Failed to fetch from LTA DataMall',
    });
  }
}
