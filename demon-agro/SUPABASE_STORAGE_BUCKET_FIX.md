# Supabase Storage Bucket Fix

## Problem
The `/api/portal/extract-soil-data` endpoint was failing with error "Nelze stáhnout PDF soubor" (Cannot download PDF file). The endpoint was trying to download files using `fetch()` on the public URL, which could fail if:
- The bucket is not publicly accessible
- There are CORS issues
- The URL format is incorrect

## Root Cause
The extraction endpoint was using `fetch(pdfUrl)` instead of properly downloading from the Supabase Storage bucket using the Supabase SDK.

## Solution
Updated the code to use Supabase Storage API to download files from the `soil-documents` bucket:

### 1. Updated `/app/api/portal/extract-soil-data/route.ts`
- Added `extractFilenameFromUrl()` helper function to parse filenames from Supabase URLs
- Modified the download logic to use `supabase.storage.from('soil-documents').download(filename)`
- Added fallback to `fetch()` if storage download fails
- Now accepts both `pdfUrl` and `filename` parameters (filename is preferred)

### 2. Updated `/components/portal/PDFUploadZone.tsx`
- Added `filename` field to `UploadedFile` interface
- Captures `filename` from upload response
- Passes `filename` to extraction endpoint along with `pdfUrl`

## Bucket Configuration
- **Correct bucket name**: `soil-documents`
- Used by `/app/api/portal/upload-pdf/route.ts` for uploads
- Now properly used by `/app/api/portal/extract-soil-data/route.ts` for downloads

## Download Flow
1. Client uploads PDF via `/api/portal/upload-pdf`
2. Upload endpoint saves to `soil-documents` bucket and returns `{ pdfUrl, filename }`
3. Client sends both `pdfUrl` and `filename` to `/api/portal/extract-soil-data`
4. Extraction endpoint:
   - First tries to use `filename` parameter
   - If not provided, extracts filename from `pdfUrl`
   - Downloads from `soil-documents` bucket using Supabase Storage API
   - Falls back to `fetch(pdfUrl)` if storage download fails
5. PDF is converted to base64 and sent to Anthropic Claude API for extraction

## Testing
After deploying these changes, test by:
1. Uploading a PDF in `/portal/upload`
2. Verifying the extraction completes successfully
3. Checking that the error "Nelze stáhnout PDF soubor" no longer occurs

## Environment Variables
Make sure these are set:
- `ANTHROPIC_API_KEY` - Already configured in `.env.local`
- Supabase credentials - Should already be configured

## Files Modified
- `/demon-agro/app/api/portal/extract-soil-data/route.ts` - Updated download logic
- `/demon-agro/components/portal/PDFUploadZone.tsx` - Pass filename to extraction endpoint
- `/demon-agro/.env.local` - Added Anthropic API key (already done)
