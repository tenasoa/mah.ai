-- Allow admins to insert notifications (fallback if RPC is unavailable)
CREATE POLICY "Admins can insert notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (public.check_is_admin());
