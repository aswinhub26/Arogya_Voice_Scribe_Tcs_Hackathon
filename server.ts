import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Central In-Memory DB for PHC Sync
const centralDatabase = {
  syncedVisits: [] as any[],
  syncedPatients: [] as any[],
  lastSyncTimestamp: new Date().toISOString(),
};

// Initialize Gemini Client if API key is present
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

// API: Process Tamil Clinical Voice or Text with Gemini
app.post('/api/ai/structure-note', async (req: Request, res: Response) => {
  try {
    const { transcript, audioBase64, mimeType, patientContext } = req.body;

    if (!ai) {
      // Fallback response if no API key is provided
      return res.status(200).json({
        success: false,
        fallback: true,
        message: 'No server Gemini API key provided. Using client-side offline clinical parser.',
      });
    }

    const systemInstruction = `You are a clinical NLP scribe specialized in Tamil Nadu Primary Health Centre (PHC) medical consultations.
Your task is to parse a doctor's spoken or dictated Tamil summary (which may contain mixed Tamil and English medical terms like 'காய்ச்சல்', 'இருமல்', 'BP 130/80', 'Tab Paracetamol 500mg TDS') into a structured clinical EMR record with ICD-10 codes and PHC Essential Drug List mapping.

Respond ONLY with valid JSON matching this schema:
{
  "transcript": "Full Tamil/English transcript",
  "chiefComplaints": ["complaint 1 with duration in Tamil and English", "complaint 2..."],
  "vitals": {
    "bp": "120/80 or empty",
    "pulse": 76,
    "temperature": "98.6 F or empty",
    "weight": "62 kg or empty",
    "spo2": "98% or empty"
  },
  "diagnosis": [
    {
      "nameEn": "Acute Upper Respiratory Tract Infection",
      "nameTa": "மேல் சுவாசப் பாதை தொற்று (சளி/காய்ச்சல்)",
      "icd10": "J06.9"
    }
  ],
  "medications": [
    {
      "drugName": "Paracetamol",
      "tamilName": "பராசிட்டமால்",
      "dosage": "500 mg",
      "form": "Tablet",
      "frequency": "1-1-1",
      "frequencyTamil": "காலை 1, மதியம் 1, இரவு 1",
      "duration": "3 days",
      "durationDays": 3,
      "instructions": "After food",
      "instructionsTamil": "உணவுக்குப் பின்",
      "inEssentialList": true
    }
  ],
  "advice": "Drink warm fluids, rest well, steam inhalation. Return if high fever persists.",
  "adviceTamil": "வெதுவெதுப்பான நீர் அருந்தவும், நல்ல ஓய்வு எடுக்கவும். அதிக காய்ச்சல் நீடித்தால் உடனடியாக மீண்டும் வரவும்.",
  "referralNeeded": false,
  "referralFacility": "",
  "referralReason": "",
  "tokensWithConfidence": [
    { "word": "word", "confidence": 0.95, "isLowConfidence": false, "suggestions": [] }
  ]
}`;

    let contents: any[] = [];

    if (audioBase64) {
      contents = [
        {
          inlineData: {
            data: audioBase64,
            mimeType: mimeType || 'audio/webm',
          },
        },
        {
          text: `Doctor dictated a clinical summary in Tamil for patient: ${JSON.stringify(patientContext || {})}. Transcribe and extract structured clinical fields.`,
        },
      ];
    } else {
      contents = [
        {
          text: `Doctor Dictation: "${transcript}"\nPatient context: ${JSON.stringify(patientContext || {})}`,
        },
      ];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const responseText = response.text || '{}';
    const structuredData = JSON.parse(responseText);

    return res.status(200).json({
      success: true,
      data: structuredData,
    });
  } catch (error: any) {
    console.error('Gemini processing error:', error);
    return res.status(200).json({
      success: false,
      error: error?.message || 'Failed to process clinical dictation with AI',
      fallback: true,
    });
  }
});

// API: Authentic Google Translate Tamil Audio Stream Proxy
app.get('/api/tts/tamil', async (req: Request, res: Response) => {
  try {
    const text = (req.query.text as string) || 'வணக்கம், இது ஆரம்ப சுகாதார நிலையம்.';
    const encoded = encodeURIComponent(text.slice(0, 200));
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=ta&client=tw-ob`;

    const response = await fetch(googleTtsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        Referer: 'https://translate.google.com/',
      },
    });

    if (!response.ok) {
      throw new Error(`Google TTS responded with status ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(Buffer.from(audioBuffer));
  } catch (err: any) {
    console.warn('Google Translate TTS proxy failed:', err.message);
    res.status(502).json({ error: 'TTS audio unavailable', details: err.message });
  }
});

// API: PHC Central Sync Endpoint
app.post('/api/sync', (req: Request, res: Response) => {
  try {
    const { phcId, deviceId, visits = [], patients = [], lastSyncedAt } = req.body;

    // Merge patients
    let patientCount = 0;
    for (const p of patients) {
      const idx = centralDatabase.syncedPatients.findIndex((item) => item.id === p.id || item.abhaId === p.abhaId);
      if (idx >= 0) {
        centralDatabase.syncedPatients[idx] = { ...centralDatabase.syncedPatients[idx], ...p, syncedAt: new Date().toISOString() };
      } else {
        centralDatabase.syncedPatients.push({ ...p, syncedAt: new Date().toISOString() });
        patientCount++;
      }
    }

    // Merge visits
    let visitCount = 0;
    for (const v of visits) {
      const idx = centralDatabase.syncedVisits.findIndex((item) => item.id === v.id);
      if (idx >= 0) {
        centralDatabase.syncedVisits[idx] = { ...centralDatabase.syncedVisits[idx], ...v, syncedAt: new Date().toISOString() };
      } else {
        centralDatabase.syncedVisits.push({ ...v, syncedAt: new Date().toISOString() });
        visitCount++;
      }
    }

    centralDatabase.lastSyncTimestamp = new Date().toISOString();

    res.json({
      success: true,
      serverTime: centralDatabase.lastSyncTimestamp,
      recordsReceived: {
        patients: patients.length,
        visits: visits.length,
      },
      newlyAdded: {
        patients: patientCount,
        visits: visitCount,
      },
      totalCentralRecords: {
        patients: centralDatabase.syncedPatients.length,
        visits: centralDatabase.syncedVisits.length,
      },
      message: `Sync successful for PHC ${phcId || 'PHC-Valparai-01'}. All local records committed.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: PHC Sync Status & Government Reporting Aggregates
app.get('/api/sync/status', (_req: Request, res: Response) => {
  const visits = centralDatabase.syncedVisits;

  // Aggregate clinical metrics for government reporting
  const totalVisits = visits.length;
  const ncdVisits = visits.filter(
    (v) =>
      v.diagnosis?.some((d: any) => d.icd10?.startsWith('I10') || d.icd10?.startsWith('E11')) ||
      v.patientChronicConditions?.length > 0
  ).length;

  const maternalAncVisits = visits.filter(
    (v) => v.diagnosis?.some((d: any) => d.icd10?.startsWith('Z34') || d.icd10?.startsWith('O')) || v.isAntenatal
  ).length;

  const acuteRespiratoryVisits = visits.filter((v) =>
    v.diagnosis?.some((d: any) => d.icd10?.startsWith('J00') || d.icd10?.startsWith('J06'))
  ).length;

  const antibioticPrescriptions = visits.filter((v) =>
    v.medications?.some((m: any) =>
      ['Amoxicillin', 'Azithromycin', 'Ciprofloxacin', 'Cephalexin', 'Doxycycline', 'Metronidazole'].some((abx) =>
        m.drugName?.toLowerCase().includes(abx.toLowerCase())
      )
    )
  ).length;

  res.json({
    phcName: 'Valparai Government Primary Health Centre, Coimbatore District',
    state: 'Tamil Nadu',
    serverTime: centralDatabase.lastSyncTimestamp,
    totalSyncedVisits: totalVisits,
    totalSyncedPatients: centralDatabase.syncedPatients.length,
    hmisMetrics: {
      totalOpd: totalVisits,
      ncdConsultations: ncdVisits,
      maternalAnc: maternalAncVisits,
      acuteRespiratory: acuteRespiratoryVisits,
      antibioticStewardshipRate: totalVisits > 0 ? `${Math.round((antibioticPrescriptions / totalVisits) * 100)}%` : '0%',
    },
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Arogya Voice Scribe running on http://localhost:${PORT}`);
  });
}

startServer();
