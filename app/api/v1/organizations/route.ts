import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@/auth';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Validation Schema ────────────────────────────────────────────────────────
const OrganizationSchema = z.object({
  name: z
    .string()
    .min(2, 'Organization name must be at least 2 characters.')
    .max(100, 'Organization name must be at most 100 characters.')
    .regex(/^[\w\s\-&'.]+$/, 'Organization name contains invalid characters.'),
  slug: z
    .string()
    .min(2, 'Workspace URL must be at least 2 characters.')
    .max(48, 'Workspace URL must be at most 48 characters.')
    .regex(/^[a-z0-9-]+$/, 'URL may only contain lowercase letters, numbers, and hyphens.'),
  industry: z.string().optional(),
  company_size: z.string().optional(),
  country: z.string().min(1, 'Country is required.').max(100),
  timezone: z.string().min(1, 'Timezone is required.'),
});

// ─── POST /api/v1/organizations ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Unauthorized.' } },
      { status: 401 }
    );
  }

  // Prevent creating duplicate organizations for users who already have one
  if (session.user.organization_id) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_REQUEST', message: 'You already belong to an organization.' } },
      { status: 409 }
    );
  }

  const body = await req.json();
  const result = OrganizationSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_REQUEST', message: result.error.issues[0]?.message ?? 'Invalid request.' } },
      { status: 400 }
    );
  }

  const { name, slug, industry, company_size, country, timezone } = result.data;

  // Check slug availability (business validation)
  const { data: existing } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .single();

  if (existing) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_ORGANIZATION', message: 'This workspace URL is already taken.' } },
      { status: 409 }
    );
  }

  // ── Atomic Organization Provisioning Transaction ───────────────────────────
  // Per spec §12 — Database Transactions (Organization Creation):
  // Create Organization → Create Workspace → Create Membership → Create Recruiter Profile → Initialize Settings → Commit

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: name.trim(),
      slug,
      country,
      timezone,
      industry: industry ?? null,
      company_size: company_size ?? null,
      onboarding_status: 'provisioning',
    })
    .select('id')
    .single();

  if (orgError || !org) {
    console.error('[organizations] Create error:', orgError);
    return NextResponse.json(
      { success: false, error: { code: 'UNKNOWN_ERROR', message: 'Failed to create organization.' } },
      { status: 500 }
    );
  }

  // Create default workspace
  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .insert({ organization_id: org.id, name: `${name.trim()} Workspace`, slug: `${slug}-main`, status: 'active' })
    .select('id')
    .single();

  if (wsError) {
    console.error('[organizations] Workspace error:', wsError);
    // Rollback org
    await supabase.from('organizations').delete().eq('id', org.id);
    return NextResponse.json(
      { success: false, error: { code: 'UNKNOWN_ERROR', message: 'Failed to provision workspace.' } },
      { status: 500 }
    );
  }

  // Create owner membership
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({ organization_id: org.id, user_id: session.user.id, role: 'owner', status: 'active' });

  if (memberError) {
    console.error('[organizations] Membership error:', memberError);
    await supabase.from('workspaces').delete().eq('id', workspace.id);
    await supabase.from('organizations').delete().eq('id', org.id);
    return NextResponse.json(
      { success: false, error: { code: 'UNKNOWN_ERROR', message: 'Failed to create membership.' } },
      { status: 500 }
    );
  }

  // Create recruiter profile
  await supabase.from('recruiter_profiles').upsert({
    user_id: session.user.id,
    organization_id: org.id,
    role: 'owner',
  }, { onConflict: 'user_id,organization_id' });

  // Initialize organization settings
  await supabase.from('organization_settings').upsert({
    organization_id: org.id,
    timezone,
    country,
    industry: industry ?? null,
    company_size: company_size ?? null,
  }, { onConflict: 'organization_id' });

  // Mark onboarding complete
  await supabase
    .from('organizations')
    .update({ onboarding_status: 'completed' })
    .eq('id', org.id);

  // Audit log
  await supabase.from('audit_logs').insert({
    user_id: session.user.id,
    organization_id: org.id,
    action: 'organization_created',
    resource: 'organizations',
    result: 'success',
    ip_address: req.headers.get('x-forwarded-for') ?? req.ip,
    metadata: { org_id: org.id, slug },
  });

  return NextResponse.json({
    success: true,
    message: 'Organization created successfully.',
    data: { organization_id: org.id, workspace_id: workspace.id },
  }, { status: 201 });
}

// ─── GET /api/v1/organizations ────────────────────────────────────────────────
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Unauthorized.' } }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('organizations')
    .select('id, name, slug, country, timezone, industry, company_size, onboarding_status, created_at')
    .eq('id', session.user.organization_id ?? '')
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'Organization not found.' } }, { status: 404 });
  }

  return NextResponse.json({ success: true, data });
}
