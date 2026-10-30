# Arogya Voice Scribe – Hackathon Build Plan

---

## 1. Problem Statement

Primary Health Centre (PHC) doctors in rural and semi‑urban Tamil Nadu are overloaded with manual documentation:

- Each patient visit requires 3–5 minutes of writing prescriptions, referral notes, registers, and scheme/reporting data.
- Existing government IT systems are designed for reporting and compliance, not for the real-time flow of consultation.
- Doctors often become “data entry operators,” breaking eye contact and rapport with patients.
- PHCs are noisy, often offline, and patients may only have basic feature phones, so most digital tools don’t fit their reality.
- Documentation is often incomplete or delayed, affecting continuity of care, safety (drug interactions, allergies), and reporting quality.

This project addresses the **system-level misalignment** between clinical workflow and documentation by creating a **consultation-first, reporting-as-by-product** tool that fits real PHC constraints.

---

## 2. Solution Overview

**Arogya Voice Scribe** is an offline-first tablet/phone app for PHC doctors and nurses. After examining the patient, the doctor:

1. Scans a QR/ABHA card or searches by phone number to open the patient’s one-page summary.
2. Taps a **push-to-talk mic button** and speaks a short Tamil summary (and later Telugu) of the visit (complaints, findings, diagnosis, treatment).
3. The app converts this speech to text **on-device** and auto-generates a **structured visit note** (complaints, vitals, diagnosis, medicines, advice).
4. A **safety layer** checks diagnoses and medicines against a fixed list (PHC essential medicines list, ICD-10, local drug names) and flags possible issues.
5. The doctor quickly edits/approves and prints a Tamil prescription and referral note. For patients with button phones, the system also sends an SMS (and optional voice call) with dose and timing.
6. Visit data is stored locally and **synced securely** to a central server when internet is available. Required government reporting fields are auto-populated from the same data.

The target outcome: **reduce documentation time from 3–5 minutes to under 1 minute per patient** without compromising safety or reporting.

---

## 3. Target Users

### Primary Users

1. **PHC Doctors (MO/SMO) in rural & semi-urban Tamil Nadu**
   - Needs:
     - Very fast, low-friction documentation during busy OPD hours.
     - Reliable Tamil speech capture in noisy settings.
     - Safety checks on drugs and doses, but with minimal extra clicks.
     - Quick access to past history, chronic conditions, allergies.
     - Offline operation; print prescriptions immediately.

2. **Nurses / ANMs / Pharmacists**
   - Needs:
     - Easy lookup of patient records and prescriptions.
     - Role-based access (e.g., dispensing, vitals entry).
     - Ability to reprint/confirm prescriptions and prepare reports.

### Secondary Stakeholders

3. **Patients (mostly with feature phones)**
   - Needs:
     - Clear printed prescription in Tamil.
     - Simple SMS/voice reminders for dose/timing (no app needed).
     - Assurance that their data is private and used with consent.

4. **Health Administrators / Program Managers**
   - Needs:
     - Accurate, timely aggregate data (maternal health, immunization, NCDs, schemes).
     - No extra burden on doctors for data entry beyond clinical workflow.
     - Compliance with DPDP and ABHA/NDHM standards.

---

## 4. Key Features

> All confirmed features below are explicitly included and will be referenced throughout the plan.

1. **Real-Time Speech-to-Text Conversion (Tamil-first, on-device)**
   - Push-to-talk mic: doctor taps after exam and speaks a short summary in Tamil (Telugu later).
   - On-device ASR (Automatic Speech Recognition) converts speech to text in real time.
   - Optimized for PHC environment (accent, noise, medical vocabulary).
   - Works fully offline; no audio leaves the device.

2. **Automated Structured Note Generation**
   - NLP pipeline parses the transcribed text into a **simple EMR visit note**:
     - Chief complaints
     - Vitals (if mentioned or from nurse inputs)
     - Findings / Diagnosis
     - Medications (drug name, dose, frequency, duration)
     - Advice / follow-up / lifestyle instructions
   - Generated note auto-fills a visit form that is editable before saving/printing.

3. **Offline Functionality with Secure Data Sync**
   - Entire app (speech-to-text, records, safety checks) works offline on PHC tablet/PC.
   - Local encrypted database stores:
     - Patient profiles (QR/ABHA ID, demographics, allergies)
     - Visit notes and prescriptions
   - Background sync service:
     - When internet is available, syncs with central server using secure APIs.
     - Handles conflict resolution (last-write-wins or versioning).
   - Encryption at rest and in transit, plus audit logging.

4. **Quick Edit and Approval Interface**
   - Single-screen “Review & Approve” view:
     - Transcribed note with **low-confidence words highlighted**.
     - Structured fields (diagnosis, medications, advice) auto-filled but editable.
     - Clinical safety alerts displayed inline.
   - The doctor:
     - Taps to correct highlighted words or chooses suggestions.
     - Confirms diagnosis and drugs.
     - Taps **“Approve & Print”**; no document is printed or finalized without approval.
   - All edits and approvals are recorded in an audit log.

5. **Printable Prescription & Referral Note + Patient Communication**
   - **Prescription and referral templates**:
     - Print in **Tamil** (with English drug names if needed).
     - Show diagnosis, medicines (name, dose, frequency, duration), precautions, next visit date.
   - Configured to fit common A4/Thermal printers in PHCs.
   - For patients with button phones:
     - Generate **SMS** in Tamil with:
       - Drug name(s), simple dose/timing, duration.
     - Optional **automated voice call reminder** (text-to-speech in Tamil) for complex regimens or chronic meds.

6. **QR / ABHA Patient History Lookup & Clinical Safety Check**
   - **Patient Identity & History (QR / ABHA lookup)**:
     - Scan a printed **QR health card** (card or sticker) or search by phone number.
     - Align IDs with **ABHA health ID** for interoperability.
     - Load a concise one-page summary:
       - Past visits, chronic conditions (e.g., diabetes, hypertension), long-term meds.
       - Allergies (drug/food), previous adverse reactions.
   - **Clinical Safety Layer**:
     - Match diagnoses against **ICD-10** (or a curated subset relevant to PHCs).
     - Match drugs against:
       - **PHC essential medicines list**.
       - Tamil and English medication names; handle common misspellings.
     - Safety checks:
       - Dose-range alerts by age/weight.
       - Pregnancy and lactation warnings.
       - Allergy cross-checks against recorded allergies.
       - Look-alike/sound-alike drug name warnings.
     - **Low-confidence words** from speech recognition or NLP are highlighted and must be tapped/confirmed by the doctor.
     - No prescription/referral is printed or finalized without explicit doctor approval.
     - Every modification is logged (who, what, when) for safety and medico-legal traceability.

---

## 5. User Flow

### 5.1 Setup & Login

1. **App Installation**
   - Installed on a PHC tablet, Android phone, or low-end laptop.
   - Required initial setup:
     - Create PHC facility profile.
     - Create user accounts: Doctor, Nurse/ANM, Pharmacist (role-based access).

2. **Login**
   - User selects role and logs in via:
     - PIN/password or device-bound login (for hackathon, simple username+PIN).
   - Home screen shows:
     - “New Patient Visit”
     - “Search / Scan Patient”
     - “Reports” (basic)
     - Sync status (e.g., Offline / Syncing / Up to date)

---

### 5.2 Patient Lookup & Registration (QR / ABHA)

**Scenario A – Returning Patient**

1. Nurse/doctor selects **“Search / Scan Patient”**.
2. Uses device camera/scanner to scan **QR health card** OR types phone number.
3. System:
   - Loads patient record linked to QR / ABHA ID.
   - Displays:
     - Demographics
     - Chronic conditions
     - Allergies
     - Recent visits and prescriptions in a one-page summary.
4. User taps **“Start New Visit”**.

**Scenario B – New Patient**

1. Click **“New Patient Visit”**.
2. Minimal registration form:
   - Name, age, gender, phone number, optional address.
   - Ask if patient has ABHA ID; if yes, capture; if no, create placeholder local ID.
3. System generates and displays a **QR code** for printing on a small sticker/card.
4. User taps **“Start Visit”**.

---

### 5.3 Nurse/ANM Vitals Entry (Optional but Recommended)

1. Nurse records vitals:
   - BP, pulse, temperature, weight, SpO₂ (if available).
2. Inputs directly into the app or on a small vitals entry screen.
3. Vitals are stored and visible in the doctor’s visit screen.

---

### 5.4 Doctor Consultation & Voice Capture

1. Doctor opens the active visit:
   - Sees name, age, key history, allergies, vitals.
2. Conducts consultation as usual (no recording during conversation for MVP).
3. After finishing, the doctor:
   - Taps the **mic button** (push-to-talk).
   - Patient is verbally informed: “I will dictate your summary into the system to print your prescription.”
   - Speaks in Tamil:
     - Example: “60 வயது ஆண், இரண்டு நாட்களாக ஜலதோஷம், காய்ச்சல் இல்லை, இருமல் உள்ளது… Diagnosis: சிம்பிள் கோல்ட், BP 130/80, Tab Paracetamol 500mg நாள் மூன்று முறை, மூன்று நாட்கள்…”
4. Doctor taps **Stop** when done.

---

### 5.5 Speech-to-Text & Structured Note Generation

1. On-device speech model:
   - Streams or processes recorded audio, producing Tamil text.
   - Marks words with confidence scores.
2. NLP pipeline:
   - Identifies:
     - Chief complaints (symptom keywords, duration).
     - Vitals (if dictated).
     - Diagnosis phrase(s).
     - Medication patterns (“Tab X 500 mg, thrice a day for 5 days”).
     - Advice and follow-up instructions.
3. System fills the **structured note**:
   - Chief Complaint: “ஜலதோஷம், இருமல் – 2 நாட்கள்”
   - Diagnosis: “Simple common cold (J00)”
   - Medications:
     - Paracetamol 500 mg, 1-1-1, 3 days.
   - Advice: rest, fluids, return if high fever.

---

### 5.6 Clinical Safety Check & Review Screen

1. **Safety Check Triggers**
   - Each diagnosis mapped to relevant **ICD-10** entry (for internal representation).
   - Each medication name matched to:
     - Local medicine dictionary with Tamil/English names.
     - Allowed dosage ranges by age/weight.
2. The system runs checks:
   - Is drug in **PHC essential medicines list**?
   - Is dose within recommended range?
   - Any conflict with known **allergies**?
   - Any pregnancy/lactation flags for this drug?
   - Any look-alike drug name confusion possible?

3. **Quick Edit & Approval UI**
   - Doctor sees:
     - **Section 1 – Transcript**:
       - Text from speech with **low-confidence words highlighted** (e.g., yellow).
       - Tapping a highlighted word opens:
         - Alternative suggestions.
         - Manual text edit option.
     - **Section 2 – Structured Fields**:
       - Chief complaints (editable).
       - Vitals (from nurse / speech).
       - Diagnosis (with suggested code).
       - Medication table (drug, strength, frequency, duration).
       - Advice text box.
     - **Section 3 – Alerts & Safety**:
       - Red: “Allergy conflict with [Amoxicillin].”
       - Amber: “Dose slightly high for age; recommended: 250–500 mg.”
       - Info: “Not in PHC essential list; consider [X] alternative.”
   - Doctor:
     - Edits or confirms highlighted fields.
     - Resolves alerts (either adjust or override with a reason).
     - Taps **“Approve & Save”**.

4. System:
   - Ensures **no note is finalized / printed until doctor approves**.
   - Logs:
     - Changes to diagnosis/meds.
     - Overrides of safety warnings.
     - Timestamps and user ID.

---

### 5.7 Prescription, Referral & Patient Communication

1. Upon approval:
   - System generates:
     - **Printable prescription** (Tamil primary; English drug names optional).
     - Optional **referral note** (if doctor selected “Referral needed”).
   - Includes:
     - Patient details (ID, name, age, sex).
     - Diagnosis (in Tamil; internal ICD-10 code not shown to patient).
     - Medicines with clear schedule:
       - E.g. “காலை – 1 மாத்திரை; மதியம் – 1; இரவு – 1; 3 நாட்கள்.”
     - Advice and return visit date.

2. Printing:
   - App sends output to paired printer (via USB, Wi-Fi, or Bluetooth).
   - For hackathon demo: simulate printing as PDF download/view.

3. SMS / Voice Reminder:
   - For phone number on record:
     - Generate **Tamil SMS**:
       - “பராசிட்டமால் 500mg: காலை 1, மதியம் 1, இரவு 1, 3 நாட்கள். உணவுக்குப் பிறகு.”
     - (Optional) Schedule a **voice call reminder**:
       - Use text-to-speech to send a pre-recorded style call with instructions (for full product; for MVP, just simulate trigger).

---

### 5.8 Offline Storage & Sync

1. All data saved to **local encrypted DB** immediately.
2. When connectivity appears:
   - Background sync module pushes:
     - New/updated patients.
     - Visit notes, prescriptions, and coded data (diagnoses, procedures).
   - Receives:
     - Updated drug lists.
     - Updated ICD codes subset.
     - App config changes.

3. Server-side (demo):
   - Simple central API to accept JSON visit records.
   - Aggregate data for:
     - Number of visits, disease patterns, drug utilization.

4. Reporting by-product:
   - Required government forms (e.g., for maternal health, immunization, NCD) are pre-filled from existing visit data.
   - For hackathon, show a **simple report screen**:
     - Count of ANC visits, immunizations, NCD follow-ups, etc., extracted from the structured notes.

---

## 6. Technical Approach

### 6.1 High-Level Architecture

- **Client app**: Android tablet/phone app (primary) OR web/electron app that can run offline.
- **Local services**:
  - On-device **Tamil speech-to-text** engine.
  - NLP module for structuring notes and safety checks.
  - Local **encrypted DB** (e.g., SQLite with SQLCipher).
- **Backend (Cloud / Local Server)**:
  - REST API for:
    - Patient & visit sync.
    - Config updates (drug list, ICD-10 subset).
  - Central relational DB (e.g., PostgreSQL).
  - Simple web dashboard for admin/reports (optional for hackathon).

---

### 6.2 Frontend / App Stack

**Option A (Recommended for hackathon)** – Web + Android wrapper

- **UI Framework**: React (with PWA capabilities) or React Native.
- **Offline Handling**:
  - Service Worker for caching assets and API calls.
  - Local DB via **IndexedDB** (web) or SQLite (React Native).
- **QR Scanning**:
  - Web: `react-qr-reader` or similar.
  - React Native: `react-native-camera` or `react-native-vision-camera`.
- **Print Support**:
  - Web: Printable HTML/PDF window.
  - Android: Print framework or generate PDF and open with a print intent.

**Key Screens & Components**

1. Login screen.
2. Home dashboard.
3. Patient search & QR scan component.
4. Patient summary view.
5. Visit screen:
   - Vitals section.
   - Mic push-to-talk button.
   - Transcript viewer.
   - Structured note editor.
   - Safety alerts panel.
6. Print preview (prescription/referral).
7. Sync status & simple analytics screen.

---

### 6.3 Speech-to-Text (Tamil/Telugu) – On-device

- Use **on-device ASR** with Tamil support:
  - Potential libraries/models:
    - Vosk (offline speech recognition) with Tamil model.
    - Whisper-small/medium models quantized and run via:
      - `whisper.cpp`
      - or an on-device inference engine (e.g., GGML).
- For hackathon MVP:
  - Focus on **Tamil** only.
  - Run model locally and send results to frontend via:
    - Local HTTP server (Node/Python) or
    - Native module (if React Native).

**Key Requirements:**

- Short utterances (30–60 seconds per dictation).
- Confidence scores per token/word to highlight low-confidence words.
- Domain-specific vocabulary injection:
  - Load PHC medicine names and common terms into a biasing lexicon if supported.

---

### 6.4 NLP for Structured Note Generation

- Language: Python (FastAPI/Flask microservice embedded on device) or Node.js.
- Steps:
  1. **Preprocessing**:
     - Normalize Tamil text (remove filler words where safe).
     - Tokenize sentences.
  2. **Information Extraction Rules/Models**:
     - Complaints:
       - Keyword/pattern-based (e.g., words for pain, fever, cough + duration).
     - Diagnosis:
       - Look for phrases after explicit markers like “Diagnosis”, “டயக்னோசிஸ்”.
       - Fallback: last sentence or key medical terms mapped to ICD-10 entries.
     - Medicines:
       - Regex + dictionary:
         - Match patterns: [form] + [drug name] + [strength] + [frequency] + [duration].
       - Use lookup table for Tamil/English drug names.
     - Advice:
       - Identify sentences with advice verbs (avoid, take, rest, drink, etc.).
  3. **Mapping to structured schema**:
     ```json
     {
       "chief_complaints": "...",
       "vitals": {...},
       "diagnosis": [{"text": "...", "icd10_code": "..."}],
       "medications": [
         {
           "drug_id": "...",
           "name": "...",
           "dose": "500 mg",
           "frequency": "1-1-1",
           "duration_days": 3
         }
       ],
       "advice": "..."
     }
     ```

- For hackathon, use **rule-based + dictionary** approach (faster to implement) rather than heavy NLP models.

---

### 6.5 Clinical Safety Layer Implementation

- **Reference Data** (seeded on device, updatable via sync):
  - `drugs` table:
    - ID, English name, Tamil name, form, strengths, standard dose ranges by age.
    - Flags: pregnancy_safe, lactation_safe, essential_list_member.
  - `diagnoses` table:
    - ICD-10 code, English name, Tamil name/description, PHC relevance.
- **Safety Engine Logic**:
  1. When structured note generated:
     - Map diagnosis text to highest similarity ICD-10 entry (string similarity).
     - Map medication names to closest drug record (with threshold).
  2. Run rule checks:
     - Dose vs. min/max recommended for patient age/weight.
     - Pregnancy/lactation conflicts.
     - Allergy conflicts (check recorded allergies vs. drug or class).
     - Flag if drug not in essential list.
  3. Generate warnings:
     - Return categorized alerts (error/warning/info) to frontend.

---

### 6.6 Data Storage & Sync

**Local (device)**

- **DB**: SQLite with encryption (SQLCipher) or IndexedDB with crypto.
- Tables:
  - `users`: id, name, role, hashed_password.
  - `patients`: id, abha_id, qr_id, name, age, gender, phone, allergies, chronic_conditions.
  - `visits`: id, patient_id, date, vitals_json, diagnosis_json, meds_json, advice_text, doctor_id.
  - `audit_logs`: id, user_id, action, entity_type, entity_id, before_json, after_json, timestamp.
  - `drug_reference`, `diagnosis_reference`.

**Sync Engine**

- Maintain **sync metadata**:
  - last_synced_at per table.
- API endpoints (backend):
  - `POST /sync/patients`
  - `POST /sync/visits`
  - `GET /config/drugs`
  - `GET /config/diagnoses`
- Security:
  - HTTPS.
  - API key / token per PHC device (for hackathon, can be simplified).
- Conflict resolution:
  - For hackathon, assume single device per PHC to avoid complexity.

---

### 6.7 Security & Privacy

- **Offline-first security**:
  - Local DB encrypted.
  - App lock after inactivity (e.g., 5 minutes).
- **In transit**:
  - Use HTTPS for all sync calls.
- **Access control**:
  - Role-based:
    - Doctor: full clinical editing, approval.
    - Nurse: vitals entry, view history, no final approval.
    - Pharmacist: view prescriptions, mark as dispensed.
- **Auditability**:
  - Log all edits to diagnoses and medications.
  - Log safety alert overrides with reasons if provided.
- **Consent & DPDP alignment**:
  - Simple consent screen:
    - Before first use for a patient, show:
      - “We will store your visit details securely to improve your care.”
      - Checkbox “Patient has consented.”
  - No audio stored by default (only derived text and structured data).

---

## 7. Success Metrics

### 7.1 Core Outcome Metrics

1. **Documentation Time Reduction**
   - Measure average time from end of exam to printed prescription:
     - Baseline: 3–5 minutes.
     - Target: **< 1 minute** (median) over at least 30 visits.
   - Capture logs:
     - Time of mic button press.
     - Time of “Approve & Print” action.

2. **Adoption & Usability**
   - Percentage of visits where Arogya Voice Scribe is used vs. manual notes:
     - Target: >70% of eligible OPD visits during pilot week.
   - Doctor feedback (Likert scale):
     - Ease of use.
     - Perceived time saving.
     - Trust in AI-generated notes and safety checks.

3. **Accuracy & Safety**
   - Speech-to-text accuracy:
     - Word error rate (WER) on sample recorded dictations.
     - Target: practical accuracy where **<10% of words need manual correction**.
   - Structured note correctness:
     - Correct diagnosis captured: >90% on review.
     - Correct medicines (name + dose + duration): >90%.
   - Safety impact:
     - Number of alerts triggered.
     - Number of **actual prescribing errors caught** by the safety layer (e.g., incorrect dose, allergy conflict).

4. **Reporting Efficiency**
   - Number of government reporting fields auto-filled per visit.
   - Reduction in separate reporting time:
     - Target: **>50% reduction** in time spent filling registers/forms for schemes.

### 7.2 Technical Metrics

1. **Offline Reliability**
   - Number of successful visits recorded while offline without crashes.
   - Sync success rate when connection restored.

2. **Performance**
   - Median latency from speech end to structured note displayed:
     - Target: < 10 seconds with small ASR model.
   - App responsiveness on low-end Android device.

3. **Security**
   - No plaintext PHI stored on device (spot-check).
   - All sync logs show HTTPS use.

---

## Hackathon MVP Scope (Explicit)

For the hackathon demo, **must-have** subset:

1. **Tamil voice-to-text (on-device or simulated) with push-to-talk**.
2. **Automatic structured note generation** (complaints, diagnosis, drugs, advice) from the transcript.
3. **Doctor “Review & Approve” screen**:
   - Low-confidence word highlighting.
   - Editable structured fields.
   - Simple safety check (e.g., drug in essential list + basic dose check).
4. **Printable Tamil prescription and basic referral note** (PDF or print preview).
5. **QR / phone-based patient lookup** with a short history view.
6. **Offline mode demo**:
   - App works with network off (local save).
   - Later demonstrate sync to backend when network is turned on.

Optional stretch goals if time allows:

- SMS in Tamil for dosage instructions.
- Simple admin report screen auto-populating a few “government-like” metrics.

This plan provides the structure and details necessary for an AI prototyping tool (Lovable, Bolt, etc.) to scaffold a working prototype of **Arogya Voice Scribe** aligned with PHC workflows and constraints.