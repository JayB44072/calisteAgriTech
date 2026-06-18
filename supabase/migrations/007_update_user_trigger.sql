-- Update the handle_new_user function to include all new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email, role, phone, city, farm_address, farm_size, primary_crop)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'agriculteur'),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'farm_address',
    CASE WHEN NEW.raw_user_meta_data->>'farm_size' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'farm_size')::DECIMAL(10,2) 
      ELSE NULL END,
    NEW.raw_user_meta_data->>'primary_crop'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;