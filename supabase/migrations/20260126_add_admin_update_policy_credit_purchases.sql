-- Allow admins to update credit purchase requests (approve/reject)
CREATE POLICY "Admins can update purchase requests"
ON public.credit_purchases FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND ('admin' = ANY(roles) OR 'superadmin' = ANY(roles))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND ('admin' = ANY(roles) OR 'superadmin' = ANY(roles))
  )
);
