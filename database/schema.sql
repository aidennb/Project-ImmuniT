-- =============================================================================
-- ImmuniT PostgreSQL Database Schema
-- Complete schema for immunity passport platform
-- Target: Amazon RDS PostgreSQL (immunit-devt)
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. Users table
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    user_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cognito_sub     VARCHAR(128) UNIQUE,
    email           VARCHAR(255) UNIQUE NOT NULL,
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    date_of_birth   DATE,
    nationality     VARCHAR(100),
    profile_complete BOOLEAN DEFAULT FALSE,
    consent_hipaa   BOOLEAN DEFAULT FALSE,
    consent_research BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_cognito_sub ON users(cognito_sub);

-- =============================================================================
-- 2. Test Results table
-- =============================================================================
CREATE TABLE IF NOT EXISTS test_results (
    test_id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    sample_id           VARCHAR(50),
    test_date           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processing_status   VARCHAR(20) DEFAULT 'processing'
                        CHECK (processing_status IN ('processing', 'completed', 'failed')),
    data_location       TEXT,
    peptide_count       INTEGER DEFAULT 0,
    quality_score       NUMERIC(5,4) DEFAULT 0.0,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_test_results_user ON test_results(user_id, test_date DESC);

-- =============================================================================
-- 3. Vaccine Records table
-- =============================================================================
CREATE TABLE IF NOT EXISTS vaccine_records (
    record_id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    vaccine_name        VARCHAR(200) NOT NULL,
    vaccine_type        VARCHAR(50),
    manufacturer        VARCHAR(200),
    admin_date          DATE NOT NULL,
    next_due_date       DATE,
    batch_number        VARCHAR(50),
    location            VARCHAR(300),
    provider            VARCHAR(200),
    dose_number         INTEGER DEFAULT 1,
    protection_status   VARCHAR(20) DEFAULT 'pending'
                        CHECK (protection_status IN ('pending', 'protected', 'waning', 'not_protected')),
    efficacy_percentile NUMERIC(5,2) DEFAULT 0,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vaccine_records_user ON vaccine_records(user_id, admin_date DESC);

-- =============================================================================
-- 4. Immunity Metrics table
-- =============================================================================
CREATE TABLE IF NOT EXISTS immunity_metrics (
    metric_id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    test_id             UUID REFERENCES test_results(test_id),
    metric_type         VARCHAR(50) NOT NULL,
    calculated_date     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    vaccine_data        JSONB DEFAULT '{}',
    overall_score       NUMERIC(5,2) DEFAULT 0,
    risk_level          VARCHAR(20) DEFAULT 'low'
                        CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_immunity_metrics_user ON immunity_metrics(user_id, calculated_date DESC);

-- =============================================================================
-- 5. Autoimmune Markers table
-- =============================================================================
CREATE TABLE IF NOT EXISTS autoimmune_markers (
    marker_id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    test_id             UUID REFERENCES test_results(test_id),
    test_date           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    markers             JSONB DEFAULT '{}',
    overall_risk_score  NUMERIC(5,2) DEFAULT 0,
    flagged_markers     TEXT[] DEFAULT '{}',
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_autoimmune_markers_user ON autoimmune_markers(user_id, test_date DESC);

-- =============================================================================
-- 6. Allergen Data table
-- =============================================================================
CREATE TABLE IF NOT EXISTS allergen_data (
    allergen_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    test_id             UUID REFERENCES test_results(test_id),
    test_date           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    food_allergens      JSONB DEFAULT '{}',
    environmental_allergens JSONB DEFAULT '{}',
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_allergen_data_user ON allergen_data(user_id, test_date DESC);

-- =============================================================================
-- 7. Neuroprotective Markers table
-- =============================================================================
CREATE TABLE IF NOT EXISTS neuroprotective_markers (
    neuro_id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    test_id                 UUID REFERENCES test_results(test_id),
    test_date               TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    markers                 JSONB DEFAULT '{}',
    overall_protection_score NUMERIC(5,2) DEFAULT 0,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_neuroprotective_markers_user ON neuroprotective_markers(user_id, test_date DESC);

-- =============================================================================
-- 8. Immunity Passports table
-- =============================================================================
CREATE TABLE IF NOT EXISTS immunity_passports (
    passport_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    issued_date         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_date         TIMESTAMP WITH TIME ZONE,
    status              VARCHAR(20) DEFAULT 'active'
                        CHECK (status IN ('active', 'expired', 'revoked')),
    qr_code_data        TEXT,
    vaccine_summary     JSONB DEFAULT '{}',
    immunity_summary    JSONB DEFAULT '{}',
    verified_by         VARCHAR(200),
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_immunity_passports_user ON immunity_passports(user_id);

-- =============================================================================
-- 9. Antibody Trends table (time-series tracking)
-- =============================================================================
CREATE TABLE IF NOT EXISTS antibody_trends (
    trend_id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    marker_name         VARCHAR(100) NOT NULL,
    marker_category     VARCHAR(50) NOT NULL
                        CHECK (marker_category IN ('vaccine', 'autoimmune', 'neuroprotective', 'allergen')),
    measurement_date    DATE NOT NULL,
    value               NUMERIC(10,4) NOT NULL,
    z_score             NUMERIC(8,4),
    percentile          NUMERIC(5,2),
    unit                VARCHAR(50),
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_antibody_trends_user ON antibody_trends(user_id, marker_name, measurement_date DESC);

-- =============================================================================
-- Updated_at trigger function
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
