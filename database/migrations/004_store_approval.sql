-- Previously active stores keep approval. Older inactive stores require review.
ALTER TABLE stores ADD COLUMN is_approved BOOLEAN NULL;
UPDATE stores SET is_approved = is_active WHERE is_approved IS NULL;
