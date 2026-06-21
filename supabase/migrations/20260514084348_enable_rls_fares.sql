ALTER TABLE "public"."fares" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON "public"."fares"
AS PERMISSIVE FOR SELECT
TO public
USING (true);
