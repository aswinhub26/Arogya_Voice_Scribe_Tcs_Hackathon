import { Icd10PHC } from '../types/clinical.ts';

export const PHC_ICD10_LIST: Icd10PHC[] = [
  {
    code: 'J00',
    nameEn: 'Acute Nasopharyngitis (Common Cold)',
    nameTa: 'சிம்பிள் ஜலதோஷம் / மூக்கொழுகுதல்',
    category: 'Respiratory',
  },
  {
    code: 'J06.9',
    nameEn: 'Acute Upper Respiratory Tract Infection, unspecified',
    nameTa: 'மேல் சுவாசப் பாதை தொற்று (சளி & தொண்டை வலி)',
    category: 'Respiratory',
  },
  {
    code: 'R50.9',
    nameEn: 'Fever, unspecified (Viral Pyrexia)',
    nameTa: 'வைரல் காய்ச்சல்',
    category: 'General / Infectious',
  },
  {
    code: 'E11.9',
    nameEn: 'Type 2 Diabetes Mellitus without complications',
    nameTa: 'டைப் 2 சர்க்கரை நோய் (நீரிழிவு)',
    category: 'NCD / Endocrine',
  },
  {
    code: 'I10',
    nameEn: 'Essential (Primary) Hypertension',
    nameTa: 'உயர் ரத்த அழுத்தம் (ஹைப்பர்டென்ஷன்)',
    category: 'NCD / Cardiovascular',
  },
  {
    code: 'A09',
    nameEn: 'Infectious Gastroenteritis and Colitis, unspecified',
    nameTa: 'வயிற்றுப்போக்கு மற்றும் வாந்தி (இரைப்பை குடல் அழற்சி)',
    category: 'Gastrointestinal',
  },
  {
    code: 'J20.9',
    nameEn: 'Acute Bronchitis, unspecified',
    nameTa: 'கடுமையான மூச்சுக்குழாய் அழற்சி / சளி இருமல்',
    category: 'Respiratory',
  },
  {
    code: 'J45.909',
    nameEn: 'Unspecified Asthma, uncomplicated',
    nameTa: 'ஆஸ்துமா / மூச்சுத்திணறல்',
    category: 'Respiratory',
  },
  {
    code: 'K21.9',
    nameEn: 'Gastro-esophageal Reflux Disease without esophagitis',
    nameTa: 'அசிடிட்டி / நெஞ்செரிச்சல் (GERD)',
    category: 'Gastrointestinal',
  },
  {
    code: 'Z34.0',
    nameEn: 'Encounter for supervision of normal first pregnancy',
    nameTa: 'வழக்கமான கர்ப்பகால பரிசோதனை (ANC)',
    category: 'Maternal Health',
  },
  {
    code: 'L30.9',
    nameEn: 'Dermatitis, unspecified / Eczema',
    nameTa: 'தோல் அழற்சி / அரிப்பு / ஒவ்வாமை',
    category: 'Dermatology',
  },
  {
    code: 'M54.5',
    nameEn: 'Low Back Pain',
    nameTa: 'கீழ் முதுகு வலி',
    category: 'Musculoskeletal',
  },
  {
    code: 'D50.9',
    nameEn: 'Iron deficiency anemia, unspecified',
    nameTa: 'இரும்புச்சத்து குறைபாடு ரத்த சோகை',
    category: 'Hematology',
  },
  {
    code: 'B35.9',
    nameEn: 'Dermatophytosis (Fungal skin infection)',
    nameTa: 'படர்தாமரை / பூஞ்சை தொற்று',
    category: 'Dermatology',
  },
];
