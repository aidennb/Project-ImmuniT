-- =============================================================================
-- ImmuniT Demo Patient Data
-- Two patients with realistic PepSeq-derived immunity data
-- =============================================================================

-- =============================================================================
-- Patient 1: Sarah Johnson - Moderate Risk, 75% vaccine protection
-- =============================================================================
INSERT INTO users (user_id, email, first_name, last_name, date_of_birth, nationality, profile_complete, consent_hipaa, consent_research)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'sarah.johnson@demo.immunit.com',
    'Sarah', 'Johnson',
    '1985-03-15', 'United States',
    TRUE, TRUE, TRUE
) ON CONFLICT (user_id) DO NOTHING;

-- Sarah's test result
INSERT INTO test_results (test_id, user_id, sample_id, test_date, processing_status, peptide_count, quality_score)
VALUES (
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'SAMPLE-2026-001',
    '2026-03-15',
    'completed',
    115243,
    0.9700
) ON CONFLICT (test_id) DO NOTHING;

-- Sarah's vaccine records
INSERT INTO vaccine_records (user_id, vaccine_name, vaccine_type, manufacturer, admin_date, next_due_date, dose_number, protection_status, efficacy_percentile) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'COVID-19 (Pfizer-BioNTech)', 'mRNA', 'Pfizer-BioNTech', '2025-09-10', '2026-09-10', 5, 'protected', 82.00),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Influenza', 'Inactivated', 'Sanofi Pasteur', '2025-10-01', '2026-10-01', 1, 'protected', 68.00),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Tetanus/Diphtheria', 'Toxoid', 'Sanofi Pasteur', '2023-06-15', '2033-06-15', 3, 'protected', 91.00),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Hepatitis B', 'Recombinant', 'GSK', '2022-01-20', '2032-01-20', 3, 'protected', 85.00),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'MMR', 'Live attenuated', 'Merck', '2020-05-10', '2050-05-10', 2, 'protected', 94.00),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Hepatitis A', 'Inactivated', 'Merck', '2024-03-12', '2029-03-12', 2, 'waning', 58.00);

-- Sarah's immunity metrics
INSERT INTO immunity_metrics (user_id, test_id, metric_type, vaccine_data, overall_score, risk_level)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'vaccine_protection',
    '{
        "COVID-19": {"protection_level": 82, "status": "protected", "antibody_titer": 550, "population_percentile": 75, "trend": "stable"},
        "Influenza": {"protection_level": 68, "status": "protected", "antibody_titer": 280, "population_percentile": 60, "trend": "declining"},
        "Tetanus": {"protection_level": 91, "status": "protected", "antibody_titer": 720, "population_percentile": 88, "trend": "stable"},
        "Hepatitis_B": {"protection_level": 85, "status": "protected", "antibody_titer": 410, "population_percentile": 72, "trend": "stable"},
        "MMR": {"protection_level": 94, "status": "protected", "antibody_titer": 890, "population_percentile": 92, "trend": "stable"},
        "Hepatitis_A": {"protection_level": 58, "status": "waning", "antibody_titer": 165, "population_percentile": 45, "trend": "declining"}
    }',
    75.00,
    'moderate'
);

-- Sarah's autoimmune markers
INSERT INTO autoimmune_markers (user_id, test_id, markers, overall_risk_score, flagged_markers)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    '{
        "TPO": {"reactivity_level": 12.5, "z_score": 0.8, "population_percentile": 28, "risk_status": "low", "associated_conditions": ["Hashimoto thyroiditis", "Graves disease"]},
        "ANA": {"reactivity_level": 22.1, "z_score": 1.2, "population_percentile": 42, "risk_status": "low", "associated_conditions": ["Lupus", "Scleroderma"]},
        "RF": {"reactivity_level": 8.3, "z_score": 0.4, "population_percentile": 18, "risk_status": "low", "associated_conditions": ["Rheumatoid arthritis"]},
        "Anti-CCP": {"reactivity_level": 5.7, "z_score": 0.2, "population_percentile": 12, "risk_status": "low", "associated_conditions": ["Rheumatoid arthritis"]},
        "Anti-dsDNA": {"reactivity_level": 15.4, "z_score": 0.9, "population_percentile": 35, "risk_status": "low", "associated_conditions": ["Systemic lupus erythematosus"]},
        "GAD65": {"reactivity_level": 18.9, "z_score": 1.1, "population_percentile": 38, "risk_status": "low", "associated_conditions": ["Type 1 diabetes"]}
    }',
    12.00,
    '{}'
);

-- Sarah's allergen data
INSERT INTO allergen_data (user_id, test_id, food_allergens, environmental_allergens)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    '{
        "peanut": {"reactivity": 8, "risk_level": "very_low", "population_percentile": 10},
        "milk": {"reactivity": 22, "risk_level": "low", "population_percentile": 30},
        "wheat": {"reactivity": 5, "risk_level": "very_low", "population_percentile": 8},
        "shellfish": {"reactivity": 45, "risk_level": "moderate", "population_percentile": 62},
        "soy": {"reactivity": 12, "risk_level": "very_low", "population_percentile": 18},
        "tree_nuts": {"reactivity": 15, "risk_level": "low", "population_percentile": 22}
    }',
    '{
        "pollen": {"reactivity": 72, "risk_level": "high", "population_percentile": 85, "seasonal_pattern": true},
        "dust_mites": {"reactivity": 38, "risk_level": "moderate", "population_percentile": 52},
        "pet_dander": {"reactivity": 28, "risk_level": "low", "population_percentile": 40},
        "mold": {"reactivity": 18, "risk_level": "low", "population_percentile": 25}
    }'
);

-- Sarah's neuroprotective markers
INSERT INTO neuroprotective_markers (user_id, test_id, markers, overall_protection_score)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    '{
        "beta_amyloid": {"antibody_level": 450, "z_score": 1.2, "population_percentile": 85, "status": "protective", "protective_threshold": 300},
        "tau": {"antibody_level": 380, "z_score": 0.9, "population_percentile": 78, "status": "protective", "protective_threshold": 250},
        "alpha_synuclein": {"antibody_level": 220, "z_score": 0.3, "population_percentile": 55, "status": "moderate", "protective_threshold": 300},
        "TDP_43": {"antibody_level": 410, "z_score": 1.1, "population_percentile": 82, "status": "protective", "protective_threshold": 280},
        "HERV_K_Env": {"antibody_level": 180, "z_score": -0.2, "population_percentile": 42, "status": "moderate", "protective_threshold": 250},
        "heat_shock_proteins": {"antibody_level": 520, "z_score": 1.5, "population_percentile": 88, "status": "protective", "protective_threshold": 350}
    }',
    73.00
);

-- Sarah's immunity passport
INSERT INTO immunity_passports (user_id, expiry_date, status, vaccine_summary, immunity_summary, verified_by)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    '2027-03-15',
    'active',
    '{"total_vaccines": 6, "up_to_date": 5, "needs_booster": 1, "protection_percentage": 75}',
    '{"overall_risk": "moderate", "vaccine_score": 75, "autoimmune_risk": 12, "neuro_protection": 73}',
    'Dr. Emily Chen, MD - ASU Clinical Immunology'
);

-- Sarah's antibody trends (6-month history)
INSERT INTO antibody_trends (user_id, marker_name, marker_category, measurement_date, value, z_score, percentile, unit) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'COVID-19 IgG', 'vaccine', '2025-10-01', 620.00, 1.8, 82.00, 'AU/mL'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'COVID-19 IgG', 'vaccine', '2025-12-01', 580.00, 1.5, 78.00, 'AU/mL'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'COVID-19 IgG', 'vaccine', '2026-02-01', 550.00, 1.3, 75.00, 'AU/mL'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Influenza IgG', 'vaccine', '2025-10-01', 340.00, 1.0, 68.00, 'AU/mL'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Influenza IgG', 'vaccine', '2025-12-01', 310.00, 0.8, 64.00, 'AU/mL'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Influenza IgG', 'vaccine', '2026-02-01', 280.00, 0.6, 60.00, 'AU/mL'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'beta_amyloid', 'neuroprotective', '2025-10-01', 420.00, 1.0, 80.00, 'ng/mL'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'beta_amyloid', 'neuroprotective', '2025-12-01', 435.00, 1.1, 82.00, 'ng/mL'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'beta_amyloid', 'neuroprotective', '2026-02-01', 450.00, 1.2, 85.00, 'ng/mL');


-- =============================================================================
-- Patient 2: Michael Chen - HIGH RISK (Poly-GA 41.95 z-score), 66% protection
-- =============================================================================
INSERT INTO users (user_id, email, first_name, last_name, date_of_birth, nationality, profile_complete, consent_hipaa, consent_research)
VALUES (
    'c3d4e5f6-a7b8-9012-cdef-345678901234',
    'michael.chen@demo.immunit.com',
    'Michael', 'Chen',
    '1972-08-22', 'United States',
    TRUE, TRUE, TRUE
) ON CONFLICT (user_id) DO NOTHING;

-- Michael's test result
INSERT INTO test_results (test_id, user_id, sample_id, test_date, processing_status, peptide_count, quality_score)
VALUES (
    'd4e5f6a7-b8c9-0123-defa-456789012345',
    'c3d4e5f6-a7b8-9012-cdef-345678901234',
    'SAMPLE-2026-002',
    '2026-03-15',
    'completed',
    118750,
    0.9500
) ON CONFLICT (test_id) DO NOTHING;

-- Michael's vaccine records
INSERT INTO vaccine_records (user_id, vaccine_name, vaccine_type, manufacturer, admin_date, next_due_date, dose_number, protection_status, efficacy_percentile) VALUES
('c3d4e5f6-a7b8-9012-cdef-345678901234', 'COVID-19 (Moderna)', 'mRNA', 'Moderna', '2025-06-20', '2026-06-20', 4, 'waning', 55.00),
('c3d4e5f6-a7b8-9012-cdef-345678901234', 'Influenza', 'Inactivated', 'Sanofi Pasteur', '2025-09-15', '2026-09-15', 1, 'protected', 62.00),
('c3d4e5f6-a7b8-9012-cdef-345678901234', 'Tetanus/Diphtheria', 'Toxoid', 'Sanofi Pasteur', '2018-02-10', '2028-02-10', 3, 'protected', 78.00),
('c3d4e5f6-a7b8-9012-cdef-345678901234', 'Hepatitis B', 'Recombinant', 'GSK', '2019-11-05', '2029-11-05', 3, 'waning', 48.00),
('c3d4e5f6-a7b8-9012-cdef-345678901234', 'Hepatitis A', 'Inactivated', 'Merck', '2021-07-22', '2026-07-22', 2, 'not_protected', 32.00),
('c3d4e5f6-a7b8-9012-cdef-345678901234', 'Yellow Fever', 'Live attenuated', 'Sanofi Pasteur', '2023-01-10', '2033-01-10', 1, 'protected', 88.00);

-- Michael's immunity metrics (HIGH RISK due to neuroprotective markers)
INSERT INTO immunity_metrics (user_id, test_id, metric_type, vaccine_data, overall_score, risk_level)
VALUES (
    'c3d4e5f6-a7b8-9012-cdef-345678901234',
    'd4e5f6a7-b8c9-0123-defa-456789012345',
    'vaccine_protection',
    '{
        "COVID-19": {"protection_level": 55, "status": "waning", "antibody_titer": 180, "population_percentile": 35, "trend": "declining"},
        "Influenza": {"protection_level": 62, "status": "protected", "antibody_titer": 250, "population_percentile": 55, "trend": "stable"},
        "Tetanus": {"protection_level": 78, "status": "protected", "antibody_titer": 380, "population_percentile": 68, "trend": "declining"},
        "Hepatitis_B": {"protection_level": 48, "status": "waning", "antibody_titer": 130, "population_percentile": 32, "trend": "declining"},
        "Hepatitis_A": {"protection_level": 32, "status": "not_protected", "antibody_titer": 75, "population_percentile": 15, "trend": "declining"},
        "Yellow_Fever": {"protection_level": 88, "status": "protected", "antibody_titer": 520, "population_percentile": 82, "trend": "stable"}
    }',
    66.00,
    'high'
);

-- Michael's autoimmune markers (elevated thyroid markers)
INSERT INTO autoimmune_markers (user_id, test_id, markers, overall_risk_score, flagged_markers)
VALUES (
    'c3d4e5f6-a7b8-9012-cdef-345678901234',
    'd4e5f6a7-b8c9-0123-defa-456789012345',
    '{
        "TPO": {"reactivity_level": 68.2, "z_score": 3.8, "population_percentile": 96, "risk_status": "high", "associated_conditions": ["Hashimoto thyroiditis", "Graves disease"]},
        "ANA": {"reactivity_level": 42.5, "z_score": 2.1, "population_percentile": 78, "risk_status": "elevated", "associated_conditions": ["Lupus", "Scleroderma"]},
        "RF": {"reactivity_level": 35.8, "z_score": 1.8, "population_percentile": 72, "risk_status": "elevated", "associated_conditions": ["Rheumatoid arthritis"]},
        "Anti-CCP": {"reactivity_level": 12.4, "z_score": 0.6, "population_percentile": 22, "risk_status": "low", "associated_conditions": ["Rheumatoid arthritis"]},
        "Anti-dsDNA": {"reactivity_level": 28.9, "z_score": 1.5, "population_percentile": 55, "risk_status": "low", "associated_conditions": ["Systemic lupus erythematosus"]},
        "GAD65": {"reactivity_level": 52.1, "z_score": 2.8, "population_percentile": 88, "risk_status": "elevated", "associated_conditions": ["Type 1 diabetes"]}
    }',
    35.00,
    '{"TPO"}'
);

-- Michael's allergen data
INSERT INTO allergen_data (user_id, test_id, food_allergens, environmental_allergens)
VALUES (
    'c3d4e5f6-a7b8-9012-cdef-345678901234',
    'd4e5f6a7-b8c9-0123-defa-456789012345',
    '{
        "peanut": {"reactivity": 65, "risk_level": "moderate", "population_percentile": 78},
        "milk": {"reactivity": 12, "risk_level": "very_low", "population_percentile": 15},
        "wheat": {"reactivity": 35, "risk_level": "low", "population_percentile": 48},
        "shellfish": {"reactivity": 82, "risk_level": "high", "population_percentile": 92},
        "soy": {"reactivity": 8, "risk_level": "very_low", "population_percentile": 10},
        "egg": {"reactivity": 28, "risk_level": "low", "population_percentile": 38}
    }',
    '{
        "pollen": {"reactivity": 55, "risk_level": "moderate", "population_percentile": 68, "seasonal_pattern": true},
        "dust_mites": {"reactivity": 62, "risk_level": "moderate", "population_percentile": 75},
        "pet_dander": {"reactivity": 78, "risk_level": "high", "population_percentile": 88},
        "mold": {"reactivity": 42, "risk_level": "moderate", "population_percentile": 58}
    }'
);

-- Michael's neuroprotective markers (CRITICAL: Poly-GA z-score 41.95)
INSERT INTO neuroprotective_markers (user_id, test_id, markers, overall_protection_score)
VALUES (
    'c3d4e5f6-a7b8-9012-cdef-345678901234',
    'd4e5f6a7-b8c9-0123-defa-456789012345',
    '{
        "beta_amyloid": {"antibody_level": 180, "z_score": -0.8, "population_percentile": 25, "status": "low", "protective_threshold": 300},
        "tau": {"antibody_level": 150, "z_score": -1.2, "population_percentile": 18, "status": "low", "protective_threshold": 250},
        "alpha_synuclein": {"antibody_level": 280, "z_score": 0.1, "population_percentile": 48, "status": "moderate", "protective_threshold": 300},
        "TDP_43": {"antibody_level": 120, "z_score": -1.8, "population_percentile": 12, "status": "low", "protective_threshold": 280},
        "Poly_GA": {"antibody_level": 1850, "z_score": 41.95, "population_percentile": 99.99, "status": "critical_elevation", "protective_threshold": 200, "clinical_note": "Extreme elevation - associated with C9orf72 ALS/FTD. Requires urgent neurological referral."},
        "HERV_K_Env": {"antibody_level": 420, "z_score": 2.8, "population_percentile": 92, "status": "elevated", "protective_threshold": 250},
        "heat_shock_proteins": {"antibody_level": 290, "z_score": -0.3, "population_percentile": 38, "status": "low", "protective_threshold": 350}
    }',
    32.00
);

-- Michael's immunity passport
INSERT INTO immunity_passports (user_id, expiry_date, status, vaccine_summary, immunity_summary, verified_by)
VALUES (
    'c3d4e5f6-a7b8-9012-cdef-345678901234',
    '2027-03-15',
    'active',
    '{"total_vaccines": 6, "up_to_date": 3, "needs_booster": 3, "protection_percentage": 66}',
    '{"overall_risk": "high", "vaccine_score": 66, "autoimmune_risk": 35, "neuro_protection": 32, "critical_flags": ["Poly-GA z-score 41.95 - urgent neurological referral recommended"]}',
    'Dr. Emily Chen, MD - ASU Clinical Immunology'
);

-- Michael's antibody trends (6-month history showing decline)
INSERT INTO antibody_trends (user_id, marker_name, marker_category, measurement_date, value, z_score, percentile, unit) VALUES
('c3d4e5f6-a7b8-9012-cdef-345678901234', 'COVID-19 IgG', 'vaccine', '2025-10-01', 320.00, 0.8, 55.00, 'AU/mL'),
('c3d4e5f6-a7b8-9012-cdef-345678901234', 'COVID-19 IgG', 'vaccine', '2025-12-01', 250.00, 0.4, 45.00, 'AU/mL'),
('c3d4e5f6-a7b8-9012-cdef-345678901234', 'COVID-19 IgG', 'vaccine', '2026-02-01', 180.00, -0.1, 35.00, 'AU/mL'),
('c3d4e5f6-a7b8-9012-cdef-345678901234', 'Poly_GA', 'neuroprotective', '2025-10-01', 980.00, 22.50, 99.90, 'ng/mL'),
('c3d4e5f6-a7b8-9012-cdef-345678901234', 'Poly_GA', 'neuroprotective', '2025-12-01', 1420.00, 32.10, 99.95, 'ng/mL'),
('c3d4e5f6-a7b8-9012-cdef-345678901234', 'Poly_GA', 'neuroprotective', '2026-02-01', 1850.00, 41.95, 99.99, 'ng/mL'),
('c3d4e5f6-a7b8-9012-cdef-345678901234', 'beta_amyloid', 'neuroprotective', '2025-10-01', 240.00, 0.0, 40.00, 'ng/mL'),
('c3d4e5f6-a7b8-9012-cdef-345678901234', 'beta_amyloid', 'neuroprotective', '2025-12-01', 210.00, -0.4, 32.00, 'ng/mL'),
('c3d4e5f6-a7b8-9012-cdef-345678901234', 'beta_amyloid', 'neuroprotective', '2026-02-01', 180.00, -0.8, 25.00, 'ng/mL'),
('c3d4e5f6-a7b8-9012-cdef-345678901234', 'TPO', 'autoimmune', '2025-10-01', 45.00, 2.5, 88.00, 'IU/mL'),
('c3d4e5f6-a7b8-9012-cdef-345678901234', 'TPO', 'autoimmune', '2025-12-01', 55.00, 3.2, 92.00, 'IU/mL'),
('c3d4e5f6-a7b8-9012-cdef-345678901234', 'TPO', 'autoimmune', '2026-02-01', 68.20, 3.8, 96.00, 'IU/mL');
