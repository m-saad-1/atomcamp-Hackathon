-- ════════════════════════════════════════════════════════════════════════════
-- ENABLE PGVECTOR
-- ════════════════════════════════════════════════════════════════════════════
create extension if not exists vector;

-- ════════════════════════════════════════════════════════════════════════════
-- CANDIDATE EMBEDDINGS (For RAG)
-- ════════════════════════════════════════════════════════════════════════════
create table candidate_embeddings (
  id           uuid primary key default uuid_generate_v4(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  chunk_type   text not null check (chunk_type in ('resume', 'notes', 'timeline', 'intelligence', 'job_description')),
  content      text not null,
  embedding    vector(1536) not null, -- Assuming OpenAI text-embedding-3-small
  metadata     jsonb default '{}',
  created_at   timestamptz not null default now()
);

-- Index for faster vector similarity search
create index idx_candidate_embeddings_vector on candidate_embeddings using hnsw (embedding vector_cosine_ops);
create index idx_candidate_embeddings_candidate on candidate_embeddings(candidate_id);

-- ════════════════════════════════════════════════════════════════════════════
-- MATCH FUNCTION (Hybrid Search capability foundation)
-- ════════════════════════════════════════════════════════════════════════════
create or replace function match_candidate_embeddings(
  query_embedding vector(1536),
  target_candidate_id uuid,
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  chunk_type text,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    id,
    chunk_type,
    content,
    metadata,
    1 - (embedding <=> query_embedding) as similarity
  from candidate_embeddings
  where candidate_id = target_candidate_id
    and 1 - (embedding <=> query_embedding) > match_threshold
  order by (embedding <=> query_embedding) asc
  limit match_count;
$$;
