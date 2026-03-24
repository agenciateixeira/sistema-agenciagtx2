-- Fix RLS policies for creative_analysis table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own creative analysis" ON creative_analysis;
DROP POLICY IF EXISTS "Users can view their own creative analysis" ON creative_analysis;
DROP POLICY IF EXISTS "Users can update their own creative analysis" ON creative_analysis;

-- Enable RLS
ALTER TABLE creative_analysis ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own creative analysis
CREATE POLICY "Users can insert their own creative analysis"
ON creative_analysis
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
);

-- Policy: Users can view their own creative analysis
CREATE POLICY "Users can view their own creative analysis"
ON creative_analysis
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

-- Policy: Users can update their own creative analysis
CREATE POLICY "Users can update their own creative analysis"
ON creative_analysis
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
)
WITH CHECK (
  user_id = auth.uid()
);

-- Policy: Users can delete their own creative analysis
CREATE POLICY "Users can delete their own creative analysis"
ON creative_analysis
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
);
