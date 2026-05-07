import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFT_PREFIX = 'medic:draft:';
const DRAFT_INDEX = 'medic:draft:index';
const REQUEST_PREFIX = 'medic:request:';
const REQUEST_INDEX = 'medic:request:index';

export type DraftRecord = {
  id: string;
  patientId: string;
  missionId: string;
  lastSaved: number;
  lastPage: number;
  snapshot: string;
};

export type RequestRecord = {
  id: string;
  patientId: string;
  missionId: string;
  sentAt: number;
  riskLevel: string;
  riskProbability: string;
  squirtPayload: string;
  payloadItems: string[];
  marchFlags: string[];
  shootdownRisk: number | null;
  vitalsSnapshot: string;
  snapshot?: string;
};

async function getIndex(key: string): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('storage: getIndex failed', key, e);
    return [];
  }
}

async function setIndex(key: string, ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(ids));
  } catch (e) {
    console.warn('storage: setIndex failed', key, e);
  }
}

export async function saveDraft(draft: DraftRecord): Promise<void> {
  try {
    const ids = await getIndex(DRAFT_INDEX);
    if (!ids.includes(draft.id)) {
      ids.unshift(draft.id);
      await setIndex(DRAFT_INDEX, ids);
    }
    await AsyncStorage.setItem(DRAFT_PREFIX + draft.id, JSON.stringify(draft));
  } catch (e) {
    console.warn('storage: saveDraft failed', e);
  }
}

export async function loadAllDrafts(): Promise<DraftRecord[]> {
  try {
    const ids = await getIndex(DRAFT_INDEX);
    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          const raw = await AsyncStorage.getItem(DRAFT_PREFIX + id);
          return raw ? (JSON.parse(raw) as DraftRecord) : null;
        } catch { return null; }
      }),
    );
    return results.filter((r): r is DraftRecord => r !== null)
      .sort((a, b) => b.lastSaved - a.lastSaved);
  } catch (e) {
    console.warn('storage: loadAllDrafts failed', e);
    return [];
  }
}

export async function loadDraft(id: string): Promise<DraftRecord | null> {
  try {
    const raw = await AsyncStorage.getItem(DRAFT_PREFIX + id);
    return raw ? (JSON.parse(raw) as DraftRecord) : null;
  } catch (e) {
    console.warn('storage: loadDraft failed', e);
    return null;
  }
}

export async function deleteDraft(id: string): Promise<void> {
  try {
    const ids = await getIndex(DRAFT_INDEX);
    await setIndex(DRAFT_INDEX, ids.filter((i) => i !== id));
    await AsyncStorage.removeItem(DRAFT_PREFIX + id);
  } catch (e) {
    console.warn('storage: deleteDraft failed', e);
  }
}

export async function saveRequest(request: RequestRecord): Promise<void> {
  try {
    const ids = await getIndex(REQUEST_INDEX);
    ids.unshift(request.id);
    await setIndex(REQUEST_INDEX, ids);
    await AsyncStorage.setItem(REQUEST_PREFIX + request.id, JSON.stringify(request));
  } catch (e) {
    console.warn('storage: saveRequest failed', e);
  }
}

export async function loadAllRequests(): Promise<RequestRecord[]> {
  try {
    const ids = await getIndex(REQUEST_INDEX);
    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          const raw = await AsyncStorage.getItem(REQUEST_PREFIX + id);
          return raw ? (JSON.parse(raw) as RequestRecord) : null;
        } catch { return null; }
      }),
    );
    return results.filter((r): r is RequestRecord => r !== null)
      .sort((a, b) => b.sentAt - a.sentAt);
  } catch (e) {
    console.warn('storage: loadAllRequests failed', e);
    return [];
  }
}

export async function loadRequest(id: string): Promise<RequestRecord | null> {
  try {
    const raw = await AsyncStorage.getItem(REQUEST_PREFIX + id);
    return raw ? (JSON.parse(raw) as RequestRecord) : null;
  } catch (e) {
    console.warn('storage: loadRequest failed', e);
    return null;
  }
}

export async function deleteRequest(id: string): Promise<void> {
  try {
    const ids = await getIndex(REQUEST_INDEX);
    await setIndex(REQUEST_INDEX, ids.filter((i) => i !== id));
    await AsyncStorage.removeItem(REQUEST_PREFIX + id);
  } catch (e) {
    console.warn('storage: deleteRequest failed', e);
  }
}
