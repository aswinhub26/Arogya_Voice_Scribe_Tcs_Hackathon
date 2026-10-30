export interface ClinicalCasePreset {
  id: string;
  title: string;
  titleTamil: string;
  patientId: string;
  doctorSpecialty: string;
  description: string;
  speechTamil: string;
  lowConfidenceIndices?: number[]; // indices of words flagged for review
  tokenAlternatives?: Record<string, string[]>;
}

export const CLINICAL_CASE_PRESETS: ClinicalCasePreset[] = [
  {
    id: 'case-common-cold',
    title: 'Acute Common Cold & Body Ache',
    titleTamil: 'ஜலதோஷம் & உடல் வலி',
    patientId: 'pat-001',
    doctorSpecialty: 'Dr. S. Kabilan, MBBS (Medical Officer, PHC)',
    description: 'Patient presents with 2 days of rhinorrhea, mild headache, and fatigue. No high fever.',
    speechTamil:
      '62 வயது ஆண் நோயாளி, இரண்டு நாட்களாக கடுமையான ஜலதோஷம், மூக்கடைப்பு மற்றும் லேசான உடல் வலி உள்ளது. காய்ச்சல் இல்லை. BP 124/82, நாடித்துடிப்பு 74. Diagnosis: Acute Nasopharyngitis J00. மருந்துகள்: Tab Paracetamol 500mg நாள் மூன்று முறை 3 நாட்களுக்கு உணவுக்குப் பின், Tab Cetirizine 10mg இரவு படுக்கும் முன் 1 மாத்திரை 3 நாட்கள். வெதுவெதுப்பான நீர் அருந்தவும், நல்ல ஓய்வு எடுக்கவும்.',
    lowConfidenceIndices: [6, 17, 24], // e.g. "ஜலதோஷம்", "J00", "Cetirizine"
    tokenAlternatives: {
      ஜலதோஷம்: ['ஜலதோஷம் (Cold)', 'வைரல் காய்ச்சல் (Fever)', 'தொண்டை வலி (Sore throat)'],
      Cetirizine: ['Cetirizine 10mg', 'Chlorpheniramine 4mg', 'Montelukast 10mg'],
      Paracetamol: ['Paracetamol 500mg', 'Paracetamol 650mg', 'Ibuprofen 400mg'],
    },
  },
  {
    id: 'case-ncd-review',
    title: 'NCD Follow-up: Hypertension & Diabetes Titration',
    titleTamil: 'உயர் ரத்த அழுத்தம் & சர்க்கரை நோய் மறுபரிசோதனை',
    patientId: 'pat-001',
    doctorSpecialty: 'Dr. S. Kabilan, MBBS (Medical Officer, PHC)',
    description: 'Elderly patient with uncontrolled BP (160/100) and fasting blood glucose 240 mg/dL.',
    speechTamil:
      'முத்துசாமி 62 வயது ஆண், வழக்கமான சர்க்கரை மற்றும் ரத்த அழுத்த பரிசோதனை. தலைபாரம் மற்றும் அசதி உள்ளது. BP 160/100, Blood Sugar 240. Diagnosis: Uncontrolled Essential Hypertension with Type 2 Diabetes E11. மருந்துகள்: Tab Metformin 500mg காலை 1 இரவு 1 உணவுக்குப் பின், Tab Amlodipine 5mg இரவு 1 மாத்திரை 30 நாட்கள். உப்பில்லா உணவு உட்கொள்ளவும், தினமும் 30 நிமிடம் நடைபயிற்சி செய்யவும். 1 மாதம் கழித்து மீண்டும் வரவும்.',
    lowConfidenceIndices: [14, 20, 27],
    tokenAlternatives: {
      '160/100': ['160/100 mmHg', '150/90 mmHg', '140/90 mmHg'],
      Metformin: ['Metformin 500mg', 'Metformin 850mg', 'Glimepiride 1mg'],
      Amlodipine: ['Amlodipine 5mg', 'Telmisartan 40mg', 'Atenolol 50mg'],
    },
  },
  {
    id: 'case-gastro-ors',
    title: 'Acute Gastroenteritis & Dehydration Management',
    titleTamil: 'கடுமையான வயிற்றுப்போக்கு & நீர்ச்சத்து குறைபாடு',
    patientId: 'pat-003',
    doctorSpecialty: 'Dr. Priya V, MBBS, DCH (Senior MO)',
    description: 'Watery stools 5 times since morning with vomiting. Immediate oral rehydration therapy required.',
    speechTamil:
      '46 வயது நோயாளி செல்வம், நேற்று இரவு முதல் 5 முறை நீர்த்துப்போன மலம் மற்றும் 2 முறை வாந்தி. நாக்கு வறண்டுள்ளது, லேசான மயக்கம். BP 110/70, Pulse 88. Diagnosis: Acute Gastroenteritis A09 with mild dehydration. மருந்துகள்: ORS sachet 1 லிட்டர் நீரில் கரைத்து ஒவ்வொரு முறை மலம் கழித்த பின்னும் குடிக்கவும், Tab Zinc 20mg காலை 1 மாத்திரை 14 நாட்கள் தொடர்ந்து சாப்பிடவும், Tab Metronidazole 400mg நாள் மூன்று முறை 3 நாட்கள். காய்ச்சல் அல்லது ரத்தக் கசிவு இருந்தால் உடனே வரவும்.',
    lowConfidenceIndices: [7, 18, 30],
    tokenAlternatives: {
      ORS: ['ORS sachet 20.5g', 'Electral powder', 'IV Normal Saline'],
      Zinc: ['Zinc 20mg', 'Multivitamin', 'Folic Acid'],
      Metronidazole: ['Metronidazole 400mg', 'Ciprofloxacin 500mg', 'Ofloxacin 200mg'],
    },
  },
  {
    id: 'case-pediatric-bronchitis',
    title: 'Pediatric Bronchitis with Allergy Check Intervention',
    titleTamil: 'சிறுவர் மூச்சுக்குழாய் அழற்சி (அலர்ஜி பாதுகாப்பு சோதனை)',
    patientId: 'pat-001', // Can also demonstrate on patient with penicillin allergy
    doctorSpecialty: 'Dr. Priya V, MBBS, DCH (Senior MO)',
    description: 'Child with persistent dry cough, chest rhonchi, and low grade fever. Demonstrates clinical allergy intercept!',
    speechTamil:
      'நோயாளி முத்துசாமி (அல்லது சிறுவன்), 3 நாட்களாக சளி இருமல் மற்றும் மூச்சுத்திணறல் உள்ளது. மார்பு பகுதியில் சளி சத்தம் உள்ளது. Diagnosis: Acute Bronchitis J20. மருந்துகள்: Cap Amoxicillin 500mg நாள் மூன்று முறை 5 நாட்கள் மற்றும் இருமல் சிரப் 10 மிலி மூன்று வேளை உணவுக்குப் பின்.',
    lowConfidenceIndices: [14, 21],
    tokenAlternatives: {
      Amoxicillin: ['Amoxicillin 500mg (Allergy Risk!)', 'Azithromycin 500mg (Safe alternative)', 'Cefixime 200mg'],
    },
  },
  {
    id: 'case-anc-maternal',
    title: 'Antenatal Checkup (ANC) Second Trimester',
    titleTamil: 'கர்ப்பகால தாய்-சேய் பரிசோதனை (24 வாரங்கள்)',
    patientId: 'pat-002',
    doctorSpecialty: 'Dr. Priya V, MBBS (Medical Officer, Valparai PHC)',
    description: 'Pregnant woman (24 weeks) routine antenatal follow-up, BP monitoring and anemia prevention.',
    speechTamil:
      '28 வயது கவிதா, 24 வார கர்ப்பிணி பெண். வழக்கமான ANC பரிசோதனை. கருவின் அசைவு சீராக உள்ளது. BP 118/76, எடை 54 கிலோ, Hb 11.2 gm. Diagnosis: Supervision of normal pregnancy Z34.0. மருந்துகள்: Tab Iron Folic Acid IFA இரவு உணவுக்குப் பின் 1 மாத்திரை, Tab Calcium D3 மதியம் உணவுக்குப் பின் 1 மாத்திரை 30 நாட்கள். சத்தான கீரைகள், முட்டை, பருப்பு வகைகள் சாப்பிடவும். அடுத்த பரிசோதனை 4 வாரங்களில்.',
    lowConfidenceIndices: [5, 18, 26],
    tokenAlternatives: {
      IFA: ['Iron Folic Acid (IFA)', 'Ferrous Ascorbate', 'Folic Acid 5mg'],
      Calcium: ['Calcium + Vit D3 500mg', 'Calcium Sandoz', 'Calcium Carbonate'],
    },
  },
];
