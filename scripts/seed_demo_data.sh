#!/bin/bash
# =============================================================================
# ImmuniT Demo Data Seeder
# Seeds 2 demo patients through Jon's live DynamoDB API
# =============================================================================

API_URL="https://q1x9ernlsk.execute-api.us-west-2.amazonaws.com/dev"
API_KEY="f5D1v4LzdU6dJIYhnOIZjaRlJ3rczEza6crRq0aS"

HEADERS=(-H "Content-Type: application/json" -H "x-api-key: $API_KEY")

echo "=== ImmuniT Demo Data Seeder ==="
echo "API: $API_URL"
echo ""

# =====================================================================
# Patient 1: Sarah Johnson — Moderate Risk, 75% vaccine protection
# =====================================================================
echo "[1/6] Creating Sarah Johnson..."
SARAH=$(curl -s -X POST "${HEADERS[@]}" \
  -d '{
    "email": "sarah.johnson@demo.immunit.com",
    "first_name": "Sarah",
    "last_name": "Johnson",
    "date_of_birth": "1985-03-15",
    "nationality": "United States",
    "consent_hipaa": true,
    "consent_research": true
  }' \
  "$API_URL/users")

SARAH_ID=$(echo "$SARAH" | python3 -c "import sys,json; print(json.load(sys.stdin)['user']['user_id'])" 2>/dev/null)

if [ -z "$SARAH_ID" ]; then
  echo "  Error creating Sarah: $SARAH"
  echo "  Trying to continue..."
  SARAH_ID="sarah_demo"
else
  echo "  Created: $SARAH_ID"
fi

# Sarah's vaccines
echo "[2/6] Adding Sarah's vaccine records..."
for VAX_DATA in \
  '{"user_id":"'"$SARAH_ID"'","vaccine_name":"COVID-19 (Pfizer-BioNTech)","vaccine_type":"mRNA","manufacturer":"Pfizer-BioNTech","admin_date":1726012800,"batch_number":"FK1234","location":"CVS Pharmacy, New York","provider":"Dr. Smith","dose_number":5}' \
  '{"user_id":"'"$SARAH_ID"'","vaccine_name":"Influenza","vaccine_type":"Inactivated","manufacturer":"Sanofi Pasteur","admin_date":1727827200,"batch_number":"FL9901","location":"Walgreens, Boston","provider":"Dr. Lee","dose_number":1}' \
  '{"user_id":"'"$SARAH_ID"'","vaccine_name":"Tetanus/Diphtheria","vaccine_type":"Toxoid","manufacturer":"Sanofi Pasteur","admin_date":1686787200,"batch_number":"TD5678","location":"City Health Center","provider":"Dr. Patel","dose_number":3}' \
  '{"user_id":"'"$SARAH_ID"'","vaccine_name":"Hepatitis B","vaccine_type":"Recombinant","manufacturer":"GSK","admin_date":1642636800,"batch_number":"HB3344","location":"Primary Care Office","provider":"Dr. Chen","dose_number":3}' \
  '{"user_id":"'"$SARAH_ID"'","vaccine_name":"MMR","vaccine_type":"Live attenuated","manufacturer":"Merck","admin_date":1589068800,"batch_number":"MM7890","location":"Community Clinic","provider":"Dr. Adams","dose_number":2}' \
  '{"user_id":"'"$SARAH_ID"'","vaccine_name":"Hepatitis A","vaccine_type":"Inactivated","manufacturer":"Merck","admin_date":1710201600,"batch_number":"HA9012","location":"Travel Clinic NYC","provider":"Dr. Wong","dose_number":2}'
do
  RESULT=$(curl -s -X POST "${HEADERS[@]}" -d "$VAX_DATA" "$API_URL/vaccines")
  VAX_NAME=$(echo "$VAX_DATA" | python3 -c "import sys,json; print(json.load(sys.stdin)['vaccine_name'])" 2>/dev/null)
  echo "  + $VAX_NAME"
done

# Sarah's immunity data (PepSeq test results)
echo "[3/6] Ingesting Sarah's PepSeq test results..."
curl -s -X POST "${HEADERS[@]}" \
  -d '{
    "user_id": "'"$SARAH_ID"'",
    "sample_id": "SAMPLE-2026-001",
    "peptide_count": 115243,
    "quality_score": 0.97,
    "vaccine_antibodies": {
      "COVID-19": {"titer": 550, "percentile": 75, "trend": "stable"},
      "Influenza": {"titer": 280, "percentile": 60, "trend": "declining"},
      "Tetanus": {"titer": 720, "percentile": 88, "trend": "stable"},
      "Hepatitis_B": {"titer": 410, "percentile": 72, "trend": "stable"},
      "MMR": {"titer": 890, "percentile": 92, "trend": "stable"},
      "Hepatitis_A": {"titer": 165, "percentile": 45, "trend": "declining"}
    },
    "autoimmune_markers": {
      "TPO": {"reactivity": 12.5, "percentile": 28, "conditions": ["Hashimoto thyroiditis", "Graves disease"]},
      "ANA": {"reactivity": 22.1, "percentile": 42, "conditions": ["Lupus", "Scleroderma"]},
      "RF": {"reactivity": 8.3, "percentile": 18, "conditions": ["Rheumatoid arthritis"]},
      "Anti-CCP": {"reactivity": 5.7, "percentile": 12, "conditions": ["Rheumatoid arthritis"]},
      "Anti-dsDNA": {"reactivity": 15.4, "percentile": 35, "conditions": ["Systemic lupus erythematosus"]},
      "GAD65": {"reactivity": 18.9, "percentile": 38, "conditions": ["Type 1 diabetes"]}
    },
    "allergen_data": {
      "peanut": {"reactivity": 8, "type": "food", "percentile": 10},
      "milk": {"reactivity": 22, "type": "food", "percentile": 30},
      "wheat": {"reactivity": 5, "type": "food", "percentile": 8},
      "shellfish": {"reactivity": 45, "type": "food", "percentile": 62},
      "soy": {"reactivity": 12, "type": "food", "percentile": 18},
      "tree_nuts": {"reactivity": 15, "type": "food", "percentile": 22},
      "pollen": {"reactivity": 72, "type": "environmental", "percentile": 85, "seasonal": true},
      "dust_mites": {"reactivity": 38, "type": "environmental", "percentile": 52},
      "pet_dander": {"reactivity": 28, "type": "environmental", "percentile": 40},
      "mold": {"reactivity": 18, "type": "environmental", "percentile": 25}
    },
    "neuroprotective_markers": {
      "beta_amyloid": {"level": 450, "percentile": 85},
      "tau": {"level": 380, "percentile": 78},
      "alpha_synuclein": {"level": 220, "percentile": 55},
      "TDP_43": {"level": 410, "percentile": 82},
      "HERV_K_Env": {"level": 180, "percentile": 42},
      "heat_shock_proteins": {"level": 520, "percentile": 88}
    }
  }' \
  "$API_URL/immunity-data" > /dev/null

echo "  Done"

# =====================================================================
# Patient 2: Michael Chen — HIGH RISK, Poly-GA z-score 41.95
# =====================================================================
echo ""
echo "[4/6] Creating Michael Chen..."
MICHAEL=$(curl -s -X POST "${HEADERS[@]}" \
  -d '{
    "email": "michael.chen@demo.immunit.com",
    "first_name": "Michael",
    "last_name": "Chen",
    "date_of_birth": "1972-08-22",
    "nationality": "United States",
    "consent_hipaa": true,
    "consent_research": true
  }' \
  "$API_URL/users")

MICHAEL_ID=$(echo "$MICHAEL" | python3 -c "import sys,json; print(json.load(sys.stdin)['user']['user_id'])" 2>/dev/null)

if [ -z "$MICHAEL_ID" ]; then
  echo "  Error creating Michael: $MICHAEL"
  MICHAEL_ID="michael_demo"
else
  echo "  Created: $MICHAEL_ID"
fi

# Michael's vaccines
echo "[5/6] Adding Michael's vaccine records..."
for VAX_DATA in \
  '{"user_id":"'"$MICHAEL_ID"'","vaccine_name":"COVID-19 (Moderna)","vaccine_type":"mRNA","manufacturer":"Moderna","admin_date":1718841600,"batch_number":"MD4456","location":"Kaiser Permanente, San Jose","provider":"Dr. Rivera","dose_number":4}' \
  '{"user_id":"'"$MICHAEL_ID"'","vaccine_name":"Influenza","vaccine_type":"Inactivated","manufacturer":"Sanofi Pasteur","admin_date":1726358400,"batch_number":"FL2233","location":"CVS Pharmacy, Mountain View","provider":"Dr. Kim","dose_number":1}' \
  '{"user_id":"'"$MICHAEL_ID"'","vaccine_name":"Tetanus/Diphtheria","vaccine_type":"Toxoid","manufacturer":"Sanofi Pasteur","admin_date":1518220800,"batch_number":"TD1122","location":"Stanford Health","provider":"Dr. Gupta","dose_number":3}' \
  '{"user_id":"'"$MICHAEL_ID"'","vaccine_name":"Hepatitis B","vaccine_type":"Recombinant","manufacturer":"GSK","admin_date":1572912000,"batch_number":"HB5566","location":"Primary Care Office","provider":"Dr. Nguyen","dose_number":3}' \
  '{"user_id":"'"$MICHAEL_ID"'","vaccine_name":"Hepatitis A","vaccine_type":"Inactivated","manufacturer":"Merck","admin_date":1626912000,"batch_number":"HA7788","location":"Travel Clinic SF","provider":"Dr. Park","dose_number":2}' \
  '{"user_id":"'"$MICHAEL_ID"'","vaccine_name":"Yellow Fever","vaccine_type":"Live attenuated","manufacturer":"Sanofi Pasteur","admin_date":1673308800,"batch_number":"YF5678","location":"Travel Clinic SF","provider":"Dr. Park","dose_number":1}'
do
  RESULT=$(curl -s -X POST "${HEADERS[@]}" -d "$VAX_DATA" "$API_URL/vaccines")
  VAX_NAME=$(echo "$VAX_DATA" | python3 -c "import sys,json; print(json.load(sys.stdin)['vaccine_name'])" 2>/dev/null)
  echo "  + $VAX_NAME"
done

# Michael's immunity data (HIGH RISK — Poly-GA elevation)
echo "[6/6] Ingesting Michael's PepSeq test results..."
curl -s -X POST "${HEADERS[@]}" \
  -d '{
    "user_id": "'"$MICHAEL_ID"'",
    "sample_id": "SAMPLE-2026-002",
    "peptide_count": 118750,
    "quality_score": 0.95,
    "vaccine_antibodies": {
      "COVID-19": {"titer": 180, "percentile": 35, "trend": "declining"},
      "Influenza": {"titer": 250, "percentile": 55, "trend": "stable"},
      "Tetanus": {"titer": 380, "percentile": 68, "trend": "declining"},
      "Hepatitis_B": {"titer": 130, "percentile": 32, "trend": "declining"},
      "Hepatitis_A": {"titer": 75, "percentile": 15, "trend": "declining"},
      "Yellow_Fever": {"titer": 520, "percentile": 82, "trend": "stable"}
    },
    "autoimmune_markers": {
      "TPO": {"reactivity": 68.2, "percentile": 96, "conditions": ["Hashimoto thyroiditis", "Graves disease"]},
      "ANA": {"reactivity": 42.5, "percentile": 78, "conditions": ["Lupus", "Scleroderma"]},
      "RF": {"reactivity": 35.8, "percentile": 72, "conditions": ["Rheumatoid arthritis"]},
      "Anti-CCP": {"reactivity": 12.4, "percentile": 22, "conditions": ["Rheumatoid arthritis"]},
      "Anti-dsDNA": {"reactivity": 28.9, "percentile": 55, "conditions": ["Systemic lupus erythematosus"]},
      "GAD65": {"reactivity": 52.1, "percentile": 88, "conditions": ["Type 1 diabetes"]}
    },
    "allergen_data": {
      "peanut": {"reactivity": 65, "type": "food", "percentile": 78},
      "milk": {"reactivity": 12, "type": "food", "percentile": 15},
      "wheat": {"reactivity": 35, "type": "food", "percentile": 48},
      "shellfish": {"reactivity": 82, "type": "food", "percentile": 92},
      "soy": {"reactivity": 8, "type": "food", "percentile": 10},
      "egg": {"reactivity": 28, "type": "food", "percentile": 38},
      "pollen": {"reactivity": 55, "type": "environmental", "percentile": 68, "seasonal": true},
      "dust_mites": {"reactivity": 62, "type": "environmental", "percentile": 75},
      "pet_dander": {"reactivity": 78, "type": "environmental", "percentile": 88},
      "mold": {"reactivity": 42, "type": "environmental", "percentile": 58}
    },
    "neuroprotective_markers": {
      "beta_amyloid": {"level": 180, "percentile": 25},
      "tau": {"level": 150, "percentile": 18},
      "alpha_synuclein": {"level": 280, "percentile": 48},
      "TDP_43": {"level": 120, "percentile": 12},
      "Poly_GA": {"level": 1850, "percentile": 99},
      "HERV_K_Env": {"level": 420, "percentile": 92},
      "heat_shock_proteins": {"level": 290, "percentile": 38}
    }
  }' \
  "$API_URL/immunity-data" > /dev/null

echo "  Done"

echo ""
echo "=== Seeding Complete ==="
echo ""
echo "Demo patients created:"
echo "  Sarah Johnson:  $SARAH_ID  (Moderate Risk, 75% vaccine protection)"
echo "  Michael Chen:   $MICHAEL_ID  (HIGH RISK, Poly-GA elevation)"
echo ""
echo "Save these user IDs! You'll need them to test the app."
echo ""
echo "Test with:"
echo "  curl -H 'x-api-key: $API_KEY' $API_URL/users/$SARAH_ID"
echo "  curl -H 'x-api-key: $API_KEY' $API_URL/immunity-data/$SARAH_ID"
echo "  curl -H 'x-api-key: $API_KEY' $API_URL/vaccines/$SARAH_ID"
