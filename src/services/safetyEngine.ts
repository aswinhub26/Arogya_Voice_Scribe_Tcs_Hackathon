import { MedicationItem, Patient, SafetyAlert, Vitals } from '../types/clinical.ts';
import { PHC_ESSENTIAL_DRUGS } from '../data/phcMedicines.ts';

export function runClinicalSafetyChecks(
  patient: Patient,
  medications: MedicationItem[],
  vitals?: Vitals
): SafetyAlert[] {
  const alerts: SafetyAlert[] = [];

  medications.forEach((med, index) => {
    const drugRef = PHC_ESSENTIAL_DRUGS.find(
      (d) =>
        d.nameEn.toLowerCase() === med.drugName.toLowerCase() ||
        med.drugName.toLowerCase().includes(d.nameEn.toLowerCase())
    );

    // 1. ALLERGY CROSS-CHECKS (CRITICAL RED)
    if (patient.allergies && patient.allergies.length > 0) {
      patient.allergies.forEach((allergyStr) => {
        const lowerAllergy = allergyStr.toLowerCase();

        // Check Penicillin Class
        if (
          (lowerAllergy.includes('penicillin') || lowerAllergy.includes('amoxicillin')) &&
          (drugRef?.allergyClass === 'penicillin' ||
            med.drugName.toLowerCase().includes('amox') ||
            med.drugName.toLowerCase().includes('penicillin') ||
            med.drugName.toLowerCase().includes('ampicillin'))
        ) {
          alerts.push({
            id: `alert-allergy-penicillin-${index}`,
            severity: 'critical',
            type: 'allergy',
            title: `CRITICAL ALLERGY CONFLICT: ${med.drugName}`,
            titleTamil: `கடுமையான ஒவ்வாமை எச்சரிக்கை: ${med.tamilName || med.drugName}`,
            message: `Patient ${patient.name} has a documented Penicillin allergy ("${allergyStr}"). Prescribing ${med.drugName} can cause acute anaphylaxis, angioedema, or severe cutaneous reactions!`,
            messageTamil: `நோயாளிக்கு பெனிசிலின் மருந்து அலர்ஜி பதிவாகியுள்ளது. ${med.tamilName} கொடுப்பது உயிருக்கு ஆபத்தான ஒவ்வாமையை ஏற்படுத்தலாம்!`,
            targetDrug: med.drugName,
            suggestedAlternative: 'Substitute with Azithromycin 500mg OD or Erythromycin.',
          });
        }

        // Check NSAID Class
        if (
          (lowerAllergy.includes('nsaid') ||
            lowerAllergy.includes('ibuprofen') ||
            lowerAllergy.includes('aspirin') ||
            lowerAllergy.includes('ulcer')) &&
          (drugRef?.allergyClass === 'nsaid' ||
            med.drugName.toLowerCase().includes('ibuprofen') ||
            med.drugName.toLowerCase().includes('diclofenac') ||
            med.drugName.toLowerCase().includes('aspirin'))
        ) {
          alerts.push({
            id: `alert-allergy-nsaid-${index}`,
            severity: 'critical',
            type: 'allergy',
            title: `NSAID / GASTRO-ALLERGY WARNING: ${med.drugName}`,
            titleTamil: `NSAID வலி நிவாரணி அலர்ஜி எச்சரிக்கை`,
            message: `Patient has documented NSAID sensitivity / gastric bleeding risk ("${allergyStr}"). Avoid ${med.drugName}.`,
            messageTamil: `நோயாளிக்கு அல்சர் / வலி நிவாரணி மருந்து ஒவ்வாமை உள்ளது. ${med.tamilName} உட்கொள்வது ரத்தக்கசிவை உண்டாக்கலாம்.`,
            targetDrug: med.drugName,
            suggestedAlternative: 'Use Paracetamol 500mg-650mg for analgesia/pyrexia instead.',
          });
        }

        // Check Sulfa Class
        if (
          lowerAllergy.includes('sulfa') &&
          (drugRef?.allergyClass === 'sulfa' || med.drugName.toLowerCase().includes('glimepiride'))
        ) {
          alerts.push({
            id: `alert-allergy-sulfa-${index}`,
            severity: 'warning',
            type: 'allergy',
            title: `SULFONAMIDE SENSITIVITY: ${med.drugName}`,
            titleTamil: `சல்ஃபா மருந்து அலர்ஜி எச்சரிக்கை`,
            message: `Patient has reported Sulfa drug hypersensitivity. ${med.drugName} is a sulfonylurea with potential cross-reactivity.`,
            messageTamil: `நோயாளிக்கு சல்ஃபா வகை மருந்து ஒவ்வாமை உள்ளது. கவனமாக கண்காணிக்கவும்.`,
            targetDrug: med.drugName,
            suggestedAlternative: 'Consider Metformin titration or dietary control.',
          });
        }
      });
    }

    // 2. PREGNANCY & LACTATION SAFETY CHECKS (CRITICAL RED / AMBER)
    if (patient.isPregnant) {
      if (drugRef?.pregnancyCategory === 'Contraindicated') {
        alerts.push({
          id: `alert-preg-contra-${index}`,
          severity: 'critical',
          type: 'pregnancy',
          title: `TERATOGENIC RISK IN PREGNANCY: ${med.drugName}`,
          titleTamil: `கர்ப்பகாலத்தில் முற்றிலும் தடை செய்யப்பட்ட மருந்து: ${med.tamilName || med.drugName}`,
          message: `${med.drugName} is CONTRAINDICATED in pregnancy! ${drugRef.pregnancyWarning || 'Poses severe risk of fetal harm or malformations.'}`,
          messageTamil: `கர்ப்ப காலத்தில் இந்த மருந்து கருவுக்கு ஆபத்தை விளைவிக்கும்! உடனடியாக மாற்று மருந்தை தேர்ந்தெடுக்கவும்.`,
          targetDrug: med.drugName,
          suggestedAlternative:
            drugRef.category === 'Cardiovascular'
              ? 'Switch to Labetalol 100mg BD or Methyldopa (safe for pregnancy hypertension).'
              : 'Consult obstetric formulary guideline.',
        });
      } else if (drugRef?.pregnancyCategory === 'Caution') {
        alerts.push({
          id: `alert-preg-caution-${index}`,
          severity: 'warning',
          type: 'pregnancy',
          title: `PREGNANCY PRECAUTION: ${med.drugName}`,
          titleTamil: `கர்ப்பகால முன்னெச்சரிக்கை: ${med.tamilName || med.drugName}`,
          message: `${med.drugName} requires caution during pregnancy (${patient.gestationalWeeks || 24} weeks gestation). ${drugRef.pregnancyWarning || ''}`,
          messageTamil: `கர்ப்பிணிகளுக்கு இந்த மருந்தை மிகக் கவனத்துடன் அளவோடு பரிந்துரைக்கவும்.`,
          targetDrug: med.drugName,
        });
      }
    }

    // 3. PEDIATRIC & DOSAGE CHECKS
    if (patient.age < 12) {
      if (med.form === 'Tablet' && (med.dosage.includes('500') || med.dosage.includes('650'))) {
        alerts.push({
          id: `alert-pediatric-dose-${index}`,
          severity: 'warning',
          type: 'dose',
          title: `PEDIATRIC DOSE ALERT: ${med.drugName} for Child (${patient.age}y / ${patient.weightKg || 18}kg)`,
          titleTamil: `குழந்தைகளுக்கான டோஸ் எச்சரிக்கை`,
          message: `Adult tablet strength (${med.dosage}) prescribed for a child. Recommended pediatric liquid suspension: ${drugRef?.pediatricDose || '10-15 mg/kg/dose'}.`,
          messageTamil: `சிறுவருக்கு பெரியவர்களுக்கான மாத்திரை டோஸ் பரிந்துரைக்கப்பட்டுள்ளது. சிரப் அல்லது குறைந்த டோஸ் கொடுக்கவும்.`,
          targetDrug: med.drugName,
          suggestedAlternative: 'Paracetamol Syrup 120mg/5ml (5ml to 7.5ml TDS).',
        });
      }
    }

    // 4. LOOK-ALIKE SOUND-ALIKE (LASA) WARNINGS
    if (drugRef?.lookAlikes && drugRef.lookAlikes.length > 0) {
      alerts.push({
        id: `alert-lasa-${index}`,
        severity: 'info',
        type: 'lasa',
        title: `LASA MEDICATION SAFETY: ${med.drugName}`,
        titleTamil: `ஒரே மாதிரியான மருந்துப் பெயர் விழிப்புணர்வு (LASA)`,
        message: `Caution: "${med.drugName}" has look-alike / sound-alike similarity with ${drugRef.lookAlikes.join(', ')}. Please verify strength & clinical indication.`,
        messageTamil: `"${med.tamilName || med.drugName}" பெயர் வேறு மருந்துடன் குழப்பமடையாமல் சரியான மாத்திரை என உறுதிப்படுத்தவும்.`,
        targetDrug: med.drugName,
      });
    }

    // 5. PHC ESSENTIAL LIST CHECK
    if (drugRef && !drugRef.inPhcList) {
      alerts.push({
        id: `alert-formulary-${index}`,
        severity: 'info',
        type: 'formulary',
        title: `NON-ESSENTIAL PHC DRUG: ${med.drugName}`,
        titleTamil: `PHC அத்தியாவசிய மருந்துகள் பட்டியலில் இல்லை`,
        message: `${med.drugName} is not standardly supplied by Tamil Nadu Medical Services Corporation (TNMSCL) at this PHC. Patient may need external purchase.`,
        messageTamil: `இந்த மருந்து ஆரம்ப சுகாதார நிலைய இருப்பில் இல்லாமல் போகலாம்.`,
        targetDrug: med.drugName,
      });
    }
  });

  // 6. VITALS & DISEASE COMBINATION CHECKS
  if (vitals?.bp) {
    const parts = vitals.bp.split('/');
    if (parts.length === 2) {
      const systolic = parseInt(parts[0], 10);
      const diastolic = parseInt(parts[1], 10);
      if (systolic >= 160 || diastolic >= 100) {
        // High BP alert
        alerts.push({
          id: 'alert-stage-2-htn',
          severity: 'warning',
          type: 'interaction',
          title: `STAGE 2 HYPERTENSION DETECTED (BP: ${vitals.bp})`,
          titleTamil: `கடுமையான உயர் ரத்த அழுத்தம் (BP: ${vitals.bp})`,
          message: `Systolic BP ≥ 160 or Diastolic ≥ 100 mmHg. Ensure adherence to anti-hypertensive regimen and evaluate for target organ symptoms (headache, blurred vision, chest pain).`,
          messageTamil: `ரத்த அழுத்தம் அதிகமாக உள்ளது. தொடர் கண்காணிப்பு மற்றும் வாழ்க்கை முறை மாற்றம் அவசியம்.`,
        });
      }
    }
  }

  return alerts;
}
