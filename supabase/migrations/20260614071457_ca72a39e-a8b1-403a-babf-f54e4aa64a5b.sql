CREATE TABLE public.address_image_cache (
  address_key text PRIMARY KEY,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  image_data bytea NOT NULL,
  content_type text NOT NULL DEFAULT 'image/png',
  mapbox_style text NOT NULL DEFAULT 'satellite-v9',
  zoom integer NOT NULL DEFAULT 17,
  width integer NOT NULL DEFAULT 600,
  height integer NOT NULL DEFAULT 400,
  byte_size integer NOT NULL DEFAULT 0,
  hit_count integer NOT NULL DEFAULT 0,
  last_accessed_at timestamptz NOT NULL DEFAULT now(),
  cached_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT (address_key, latitude, longitude, content_type, mapbox_style, zoom, width, height, byte_size, cached_at, updated_at)
  ON public.address_image_cache TO anon, authenticated;
GRANT ALL ON public.address_image_cache TO service_role;

ALTER TABLE public.address_image_cache ENABLE ROW LEVEL SECURITY;

-- Public can read metadata (image bytes are served exclusively through the edge function)
CREATE POLICY "address_image_cache_public_read_meta"
  ON public.address_image_cache
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX idx_address_image_cache_last_accessed ON public.address_image_cache(last_accessed_at);

-- updated_at trigger reuses existing handle_updated_at function
CREATE TRIGGER trg_address_image_cache_updated_at
  BEFORE UPDATE ON public.address_image_cache
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

NOTIFY pgrst, 'reload schema';