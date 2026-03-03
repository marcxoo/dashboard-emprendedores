SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'custom_surveys';
