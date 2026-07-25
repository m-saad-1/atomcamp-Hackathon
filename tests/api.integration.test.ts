import { createTenantClient } from '../lib/supabase/server';
import { GET as getCandidates } from '../app/api/candidates/route';

describe('Candidates API (Integration)', () => {
  it('should deny access without organization_id', async () => {
    // Stub request lacking valid session
    const req = new Request('http://localhost:3000/api/candidates');
    const res = await getCandidates(req as any);
    expect(res.status).toBe(401);
  });
});
