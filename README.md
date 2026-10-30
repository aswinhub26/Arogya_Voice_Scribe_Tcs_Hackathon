# Arogya Voice Scribe
## Primary Health Centre AI Scribe & Clinical Decision Support System

Built for the **TCS iON Hackathon**  
Target Region: Primary Health Centres (PHCs), Tamil Nadu  
Supported Consultation Languages: Tamil (`ta-IN`), English (`en-IN`)  
Target Documentation Time: 3–5 minutes reduced to under 1 minute per patient

---

## 1. Executive Summary

In rural and semi-urban Primary Health Centres (PHCs) across Tamil Nadu, government medical officers frequently consult between 100 and 150 patients per OPD shift. Documentation requirements—including handwritten registers, OPD chits, national health reporting, and referral forms—consume 3 to 5 minutes per patient, leaving less than 2 minutes for clinical examination and patient dialogue.

**Arogya Voice Scribe** is an offline-first clinical voice companion engineered specifically for low-resource primary health facilities. Operating via a push-to-talk consultation workflow, the system captures spoken Tamil, English, or mixed medical parlance (Tanglish), deterministically extracts clinical vitals, chief complaints, ICD-10 diagnoses, and medication regimens, subjects all orders to an active multi-tier clinical safety engine, and generates standardized bilingual prescriptions (A4/A5), patient QR cards, referral notes, and Unicode SMS summaries.

The system is built on a non-negotiable human-in-the-loop philosophy: **AI drafts, the clinician decides.** High-risk fields (diagnoses, drugs, dosages) are never auto-accepted, requiring explicit clinical verification.

---

## 2. Key Capabilities

### 2.1 Push-to-Talk Ambient Clinical Scribe
- Dual-engine speech architecture: Primary browser Web Speech API (`ta-IN`, `en-IN`) with server-assisted Gemini multimodal parsing fallback.
- Push-to-talk activation designed specifically for noisy PHC consultation environments, preventing unintentional eavesdropping and strictly preserving patient privacy.
- Live audio waveform feedback, real-time editable transcription buffer, and active consultation stopwatch timing every interaction from first dictation to clinical sign-off.

### 2.2 Deterministic & Rule-Based NLP Pipeline
- Offline-first clinical parser executing local regex matching, Tamil phonetic normalization, and Levenshtein distance fuzzy string matching against the Tamil Nadu PHC Essential Drug List and ICD-10 registry.
- Token confidence scoring:
  - High confidence (Green, >= 0.85 similarity): Exact dictionary or formulary match.
  - Review required (Amber, 0.60 - 0.84 similarity): Fuzzy match suggesting closest verified clinical term.
  - Unmatched / Low confidence (Red, < 0.60): Preserved as raw clinical free text; never discarded.
- Source word traceability: extracted clinical attributes retain pointer associations back to raw spoken tokens.

### 2.3 Multi-Tier Clinical Safety Engine
The safety engine inspects all candidate prescriptions against patient demographics, gestational status, reported allergies, and current vitals:
- **Allergy Intercepts (Critical / Block)**: Cross-checks penicillin, cephalosporin, NSAID, and sulfonamide classes against documented patient history (e.g., blocks Amoxicillin prescription in penicillin-allergic patients).
- **Pregnancy & Teratogenicity Checks (Critical / Block)**: Identifies contraindicated pharmaceuticals (e.g., Telmisartan, Doxycycline, Ciprofloxacin, Atenolol) in pregnant or lactating patients.
- **Pediatric Safety & Dosing (Block / Warning)**: Flags missing body weight for patients under 12 years of age and calculates mg/kg dosage thresholds (e.g., Paracetamol 10–15 mg/kg per dose, max 60 mg/kg/day).
- **Drug-Drug Interactions & Look-Alike Sound-Alike (LASA)**: Detects interaction pairs (e.g., Metformin + Metronidazole, NSAIDs + Telmisartan, Fluoroquinolones + Iron/Calcium) and alerts clinicians to phonetically similar drugs (e.g., Metformin vs. Metronidazole, Atenolol vs. Atorvastatin).
- **Geriatric Risk Alerts**: Flags high-risk hypoglycemic agents (e.g., Glimepiride) and NSAIDs in patients aged 65 and older.
- **Mandatory Justification Log**: Safety blocks cannot be bypassed without entering a clinical rationale, which is committed permanently to an append-only audit trail.

### 2.4 Bilingual Clinical Output & Non-Smartphone Accessibility
- **Dual-Language Prescriptions (A4 & A5)**: Formatted with standard Tamil Nadu Health Department and NHM headers, bilingual table columns (மருந்து, அளவு, எத்தனை முறை, உணவு, நாட்கள்), dosage scheduling icons, and electronic authorization stamps.
- **Patient QR Identity Card (85 x 54 mm)**: Generates a durable identification card encoding solely the unique Patient ID (`PHC-TN-YYYY-NNNNNN`), ensuring no protected health information (PHI) resides within the visual code.
- **Standardized Referral Notes**: Formats clinical summary, vitals, active interventions, and provisional diagnosis for District Headquarter or Medical College Hospitals.
- **Unicode Tamil SMS Preview**: Formats 70-character single-segment or 67-character multi-segment SMS summaries for non-smartphone button phones.

### 2.5 Role-Based Access Control & Clinical Security
- Strict role isolation between **Medical Officer (Doctor)**, **Staff Nurse / ANM**, and **Pharmacist**.
- Route guards preventing unauthorized navigation across role boundaries (e.g., pharmacists and nurses cannot approve clinical orders or access raw audit logs).
- Append-only, tamper-resistant audit trail recording login events, record viewings, edits, safety overrides, approval timestamps, and pharmacy dispenses.
- Client-side data encryption ready for AES-GCM (256-bit key) derived from clinician credentials via PBKDF2.

### 2.6 PHC Aggregation & HMIS Reporting
- Automated extraction of Health Management Information System (HMIS) metrics: Total OPD footfall, Non-Communicable Disease (NCD) reviews, Antenatal Care (ANC) encounters, Acute Respiratory Infections (ARI), and Antibiotic Stewardship prescribing indices.
- Documentation efficiency metrics calculating exact consultation time saved versus baseline historical benchmarks.
- Instant CSV export for district health reporting.

---

## 3. Technology Stack

| Layer | Component | Description |
|---|---|---|
| Frontend Framework | React 19 + TypeScript | High-performance, strictly typed single-page application |
| Build Tool | Vite 8 + TSX | Optimized bundle compilation and fast hot-module replacement |
| Styling & Typography | Tailwind CSS 4 + Custom Tokens | High-contrast clinical theme, 48px minimum touch targets, Noto Sans Tamil |
| Motion & Transitions | Motion (Framer Motion 12) | Purposeful UI transitions, recording pulse indicators, spring physics |
| Client Storage | StorageService (LocalStorage / IndexedDB) | Offline-first encrypted schema with sync queue |
| Speech Engine | Web Speech API (`ta-IN`, `en-IN`) | In-browser zero-dependency voice capture |
| Backend & Sync Server | Node.js + Express 4 | Development middleware, central PHC sync hub, and HMIS reporting |
| AI Integration | Google GenAI SDK (`@google/genai`) | Server-side Gemini 2.5 Flash clinical structuring (optional fallback) |
| Barcode & QR | QRCode Library | Client-side vector and raster QR generation |
| Icons | Lucide React | Minimalist, clinical-grade vector iconography |

---

## 4. Directory Structure

```
Arogya_Voice_Scribe_Tcs_Hackathon/
├── package.json                   # Project dependencies and script declarations
├── tsconfig.json                  # Strict TypeScript configuration
├── vite.config.ts                 # Vite bundler and Tailwind CSS plugin setup
├── server.ts                      # Express API server, sync hub, and Gemini proxy
├── metadata.json                  # Application capabilities and hardware permissions
├── README.md                      # Primary project documentation
├── WORKFLOW.md                    # End-to-end clinical and system architecture workflow
├── public/
│   ├── assets/                    # Public assets and branding
│   └── favicon.ico                # Application icon
└── src/
    ├── main.tsx                   # React root entry point
    ├── App.tsx                    # Root orchestrator: tabs, roles, modals, and global state
    ├── index.css                  # Clinical design tokens, print stylesheets, typography
    ├── assets/
    │   └── images/                # Clinical facility and consultation showcase assets
    ├── components/
    │   ├── NavigationRail.tsx     # Role-aware sidebar navigation
    │   ├── TopNav.tsx             # Header with connectivity status, role selector, dark mode
    │   ├── PatientBanner.tsx      # Active patient demographics, allergy alerts, past visits
    │   ├── VoiceScribeSection.tsx # Push-to-talk voice recording, transcript editor, presets
    │   ├── StructuredNoteEditor.tsx# Clinical field editor, medication table, ICD-10 mapper
    │   ├── SafetyAlertsPanel.tsx  # Clinical safety alerts, block indicators, override dialog
    │   ├── NurseVitalsView.tsx    # Vitals intake station, BMI calculator, triage flags
    │   ├── PharmacyDispenseView.tsx# Pharmacist dispensing verification and label printer
    │   ├── PrescriptionPrintModal.tsx# Dual A4/A5 prescription and referral print engine
    │   ├── PatientCommunicationDrawer.tsx# Tamil SMS, WhatsApp, and simulated voice readback
    │   ├── PatientLookupModal.tsx # Search, QR barcode scanner, and new patient onboarding
    │   ├── HmisReportDashboard.tsx# PHC performance analytics, antibiotic stewardship, CSV
    │   ├── AuditTrailModal.tsx    # Tamper-resistant append-only event ledger
    │   ├── FacilityShowcaseSlides.tsx# Rural PHC operational workflow walkthrough
    │   └── TamilNaduLogos.tsx     # Vector emblems of Tamil Nadu Government and NHM
    ├── data/
    │   ├── seedPatients.ts        # Six representative clinical profiles across all demographics
    │   ├── phcMedicines.ts        # Tamil Nadu PHC Essential Drug List with safety metadata
    │   ├── icd10Reference.ts      # Standardized primary health ICD-10 diagnostic codes
    │   └── clinicalCasePresets.ts # Multi-case clinical demonstration scripts with Tamil audio
    ├── services/
    │   ├── clinicalParser.ts      # Deterministic NLP rule-based parser and token extractor
    │   ├── safetyEngine.ts        # Comprehensive clinical decision support safety engine
    │   └── storageService.ts      # Persistent offline store, sync queue, and audit logger
    ├── types/
    │   └── clinical.ts            # Core TypeScript interfaces, entities, and clinical data models
    └── utils/
        └── motion.ts              # Animation curves, spring physics, and count-up utilities
```

---

## 5. Clinical Safety Engine Rule Matrix

| Rule ID | Category | Severity | Trigger Condition | System Behavior |
|---|---|---|---|---|
| R1 | Dosage | Warning | Dose prescribed below standard therapeutic range | Displays advisory message; clinician acknowledges |
| R2 | Dosage | Block | Single dose exceeds maximum adult/pediatric limit | Halts approval; requires dosage correction or typed override |
| R3 | Dosage | Block | Daily cumulative dose exceeds safe 24-hour ceiling | Calculates total mg/day; blocks sign-off until corrected |
| R4 | Pregnancy | Block | Category X / Contraindicated drug in pregnant patient | Blocks approval; mandates alternative selection or justified override |
| R5 | Pregnancy | Warning | Category C / Cautionary drug in pregnant patient | Displays warning regarding fetal monitoring; requires clinician sign-off |
| R6 | Allergy | Block | Drug name or therapeutic class matches patient allergy | Flags severe anaphylaxis risk; blocks prescription |
| R7 | Pediatrics | Block | Patient age < 12 years with unrecorded body weight | Halts prescription until weight is captured by nurse or doctor |
| R8 | Pediatrics | Block | Pediatric dose exceeds weight-based mg/kg ceiling | Computes precise mg/kg/dose; flags overdose risk |
| R9 | Age Ceiling | Block | Drug contraindicated in pediatric age group | Prevents prescription of restricted drugs (e.g., Ciprofloxacin < 18y) |
| R10 | Duplication | Block | Identical chemical entity prescribed multiple times | Flags redundant therapy; prompts clinician to consolidate |
| R11 | LASA | Warning | Co-prescription of Look-Alike Sound-Alike medications | Prompts re-verification of drug identity and dosage strength |
| R12 | Interaction | Warning | Adverse pharmacodynamic or pharmacokinetic pairing | Displays clinical interaction advisory and administration spacing |
| R13 | Geriatrics | Warning | Sulfonylurea or high-dose NSAID prescribed to age >= 65 | Alerts to hypoglycemia or nephrotoxicity risks in older adults |
| R14 | Completeness | Block | Missing dose, frequency, or course duration | Requires complete regimen details prior to approval |
| R15 | Triage Flag | Info | Abnormal vital sign recorded without referral consideration | Suggests secondary referral toggle for specialist evaluation |

---

## 6. Getting Started

### 6.1 Prerequisites
- **Node.js**: Version 18.0.0 or higher (v20.x recommended)
- **Package Manager**: `npm` (v9+) or `bun`
- **Supported Browser**: Google Chrome, Microsoft Edge, or any Chromium-based browser supporting the Web Speech API and Web Crypto API

### 6.2 Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/aswinhub26/Arogya_Voice_Scribe_Tcs_Hackathon.git
   cd Arogya_Voice_Scribe_Tcs_Hackathon
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables** (Optional for Gemini fallback):
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *Note: If no API key is provided, the application automatically runs 100% offline using its built-in deterministic clinical parser and local safety engine.*

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be accessible at: `http://localhost:3000`

5. **Build for Production Deployment**:
   ```bash
   npm run build
   npm run start
   ```

---

## 7. Operational Roles & Test Credentials

The system provides pre-configured role profiles to demonstrate the full multidisciplinary primary health center workflow:

| Role | Default User | ID / PIN | Permitted Operations |
|---|---|---|---|
| **Medical Officer (Doctor)** | Dr. S. Kabilan, MBBS | `DOC-1029` / `1234` | Full clinical dictation, note editing, safety override authorization, prescription approval, referral generation, full audit inspection |
| **Staff Nurse / ANM** | Nurse Kavitha, GNM | `NURSE-4402` / `2345` | Patient registration, vitals recording, triage threshold review, QR card generation, history summary |
| **Pharmacist** | Pharmacist Ramesh, D.Pharm | `PHARM-8821` / `3456` | Approved prescription queue review, medicine-by-medicine dispensing verification, label printing, patient counselling |

---

## 8. Built-in Clinical Test Scenarios

The system includes pre-configured clinical presets accessible directly from the consultation console:

1. **Preset 1: Acute Upper Respiratory Tract Infection (Pediatric / General)**
   - *Case*: 62-year-old male with acute cold, nasal obstruction, headache.
   - *Test Objective*: Evaluates Tamil symptom extraction, ICD-10 (`J00`) assignment, and standard Paracetamol / Cetirizine dosage regimen.
2. **Preset 2: Chronic NCD Follow-Up (Hypertension & Diabetes Titration)**
   - *Case*: Uncontrolled BP (160/100) and elevated blood glucose (240 mg/dL).
   - *Test Objective*: Evaluates dual NCD ICD-10 coding (`I10`, `E11`), Metformin + Amlodipine regimen, lifestyle guidance, and 30-day review interval.
3. **Preset 3: Acute Gastroenteritis with Dehydration**
   - *Case*: Watery loose stools, vomiting, mild dehydration.
   - *Test Objective*: Evaluates ORS sachet dosage instructions, Zinc supplementation, and Metronidazole prescription.
4. **Preset 4: Pediatric Bronchitis with Penicillin Allergy Intercept**
   - *Case*: Patient with documented Penicillin hypersensitivity prescribed Amoxicillin.
   - *Test Objective*: Evaluates **Critical Safety Rule R6**, halting approval until the drug is substituted or an override justification is recorded.
5. **Preset 5: Antenatal Care (ANC) Second Trimester Follow-Up**
   - *Case*: 24-week pregnant female presenting for routine checkup.
   - *Test Objective*: Evaluates gestational tracking, Iron Folic Acid (IFA) + Calcium D3 protocols, and pregnancy contraindication screening (**Rule R4**).

---

## 9. Security, Privacy & Legal Architecture

- **Data Minimization**: The patient QR card contains solely the unique Patient ID (`PHC-TN-YYYY-NNNNNN`). It contains zero clinical diagnoses, medication lists, or personal identifying data.
- **No Raw Audio Retention**: Spoken audio is processed in volatile memory. Only the finalized, clinician-reviewed textual note is stored.
- **Append-Only Audit Ledger**: Modifying or deleting audit entries is architecturally prevented. All overrides, edits, logins, and dispenses are permanently logged with clinician ID and timestamp.
- **DPDP Act Alignment**: Built to comply with principles of India's Digital Personal Data Protection (DPDP) Act, 2023, featuring explicit clinical consent timestamps and strict role-based data isolation.

---

## 10. Acknowledgements

We extend our sincere gratitude to **Tata Consultancy Services (TCS)** and the organizers of the **TCS iON Hackathon** for conceptualizing a challenge that directly addresses one of the most critical bottlenecks in India's public healthcare infrastructure. 

The problem statement provided an invaluable platform to build solutions that empower rural medical officers, protect patient safety through automated decision support, and bridge linguistic and technological divides across Primary Health Centres.
