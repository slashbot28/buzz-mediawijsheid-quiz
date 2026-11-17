/**
 * CloudQuizStore: Online opslag & API via Cloud Firestore (project: de-schaal-van-m)
 * Werkt zowel voor BUZZ! Mediawijsheid als voor externe projecten (zoals PS5 Buzz Quiz).
 */
window.CloudQuizStore = (() => {
  const PROJECT_ID = 'de-schaal-van-m';
  const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

  function decodeDoc(doc) {
    if (!doc || !doc.fields) return null;
    const f = doc.fields;
    const id = doc.name ? doc.name.split('/').pop() : '';
    let categories = [];
    let questions = [];
    try {
      categories = JSON.parse((f.categoriesJson && f.categoriesJson.stringValue) || '[]');
    } catch {}
    try {
      questions = JSON.parse((f.questionsJson && f.questionsJson.stringValue) || '[]');
    } catch {}

    return {
      id,
      title: (f.title && f.title.stringValue) || id,
      categories,
      questions,
      hasPin: !!(f.editPin && f.editPin.stringValue),
      updatedAt: (f.updatedAt && f.updatedAt.timestampValue) || ''
    };
  }

  async function listSets() {
    const res = await fetch(`${BASE_URL}/quiz_sets?pageSize=50`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Kon online vragensets niet ophalen (HTTP ${res.status}).`);
    }
    const data = await res.json();
    const docs = Array.isArray(data.documents) ? data.documents : [];
    return docs.map(decodeDoc).filter(Boolean);
  }

  async function getSet(setId) {
    const cleanId = encodeURIComponent(setId.trim().toLowerCase());
    const res = await fetch(`${BASE_URL}/quiz_sets/${cleanId}`, { cache: 'no-store' });
    if (res.status === 404) {
      throw new Error(`Vragenset "${setId}" niet gevonden in de cloud.`);
    }
    if (!res.ok) {
      throw new Error(`Fout bij ophalen van "${setId}" (HTTP ${res.status}).`);
    }
    return decodeDoc(await res.json());
  }

  async function saveSet({ id, title, categories, questions, editPin = '' }) {
    const cleanId = id
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/(^-|-$)/g, '');
    if (!cleanId) throw new Error('Vul een geldige Set-ID in (bv. ps5-buzz of mediawijsheid).');

    const body = {
      fields: {
        title: { stringValue: (title || cleanId).trim().slice(0, 120) },
        categoriesJson: { stringValue: JSON.stringify(categories || []) },
        questionsJson: { stringValue: JSON.stringify(questions || []) },
        editPin: { stringValue: (editPin || '').trim().slice(0, 32) },
        updatedAt: { timestampValue: new Date().toISOString() }
      }
    };

    const res = await fetch(`${BASE_URL}/quiz_sets/${encodeURIComponent(cleanId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errText = await res.text();
      if (res.status === 403) {
        throw new Error('Opslaan geweigerd: controleer de pincode (als deze set beveiligd is met een PIN).');
      }
      throw new Error(`Opslaan mislukt (HTTP ${res.status}): ${errText}`);
    }

    return decodeDoc(await res.json());
  }

  function getApiUrl(setId) {
    const cleanId = encodeURIComponent((setId || 'mediawijsheid').trim().toLowerCase());
    return `${BASE_URL}/quiz_sets/${cleanId}`;
  }

  return {
    listSets,
    getSet,
    saveSet,
    getApiUrl
  };
})();
