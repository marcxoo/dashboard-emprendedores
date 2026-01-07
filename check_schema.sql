SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events_2026' AND column_name = 'tracking';
