ALTER TABLE cargo ADD COLUMN cargo_type VARCHAR(50) DEFAULT 'box';

UPDATE cargo SET cargo_type = 'box' WHERE cargo_id IN ('КГ-001', 'КГ-003');
UPDATE cargo SET cargo_type = 'pallet' WHERE cargo_id IN ('КГ-002', 'КГ-004', 'КГ-005');

ALTER TABLE drivers ADD COLUMN vehicle_category VARCHAR(50) DEFAULT 'car';

UPDATE drivers SET vehicle_category = 'car' WHERE driver_id = 'DRV-001';
UPDATE drivers SET vehicle_category = 'truck' WHERE driver_id IN ('DRV-002', 'DRV-003');
UPDATE drivers SET vehicle_category = 'semi' WHERE driver_id = 'DRV-004';
