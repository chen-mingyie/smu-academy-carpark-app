import type { Request, Response } from 'express';

/**
 * Serverless Health Check Handler
 * Route: GET /api/health
 */
export default async function handler(req: Request, res: Response) {
  const isKeyConfigured = Boolean(
    process.env.LTA_DATAMALL_ACCOUNT_KEY ||
    process.env.LTA_ACCOUNT_KEY ||
    process.env.ACCOUNT_KEY
  );

  res.status(200).json({
    status: 'healthy',
    service: 'sg-carpark-tracker-api',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    ltaDataMall: {
      endpoint: 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
      accountKeyConfigured: isKeyConfigured,
      note: isKeyConfigured
        ? 'AccountKey detected in environment variables.'
        : 'AccountKey is missing. Please set LTA_DATAMALL_ACCOUNT_KEY in your environment.',
    },
  });
}
