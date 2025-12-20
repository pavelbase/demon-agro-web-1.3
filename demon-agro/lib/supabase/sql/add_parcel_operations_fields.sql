-- Add fields for parcel operations (split, merge, archive)
-- Migration for Phase 3.4

-- Add status column (active by default, archived when split/merged/archived)
ALTER TABLE public.parcels 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived'));

-- Add source_parcel_id for tracking split/merge operations
ALTER TABLE public.parcels 
ADD COLUMN IF NOT EXISTS source_parcel_id UUID REFERENCES public.parcels(id) ON DELETE SET NULL;

-- Add comments
COMMENT ON COLUMN public.parcels.status IS 'Parcel status: active or archived';
COMMENT ON COLUMN public.parcels.source_parcel_id IS 'Reference to original parcel if created from split/merge';

-- Create index for querying active parcels
CREATE INDEX IF NOT EXISTS idx_parcels_status ON public.parcels(status);
CREATE INDEX IF NOT EXISTS idx_parcels_source ON public.parcels(source_parcel_id) WHERE source_parcel_id IS NOT NULL;

-- Update existing parcels to have 'active' status
UPDATE public.parcels SET status = 'active' WHERE status IS NULL;
