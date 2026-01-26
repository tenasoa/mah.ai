-- Allow authenticated users to insert their own credit purchase requests
CREATE POLICY "Users can insert own purchase requests"
ON public.credit_purchases FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
