import { Capacitor } from "@capacitor/core";
import { Language, Translation } from "@capacitor-mlkit/translation";

const CACHE_KEY = "duobiblia-translation-cache-v1";
const MODEL_READY_KEY = "duobiblia-translation-models-ready-v1";
const MAX_CACHE_ITEMS = 240;
let modelPreparationPromise = null;
let modelsMarkedReady = globalThis.localStorage?.getItem(MODEL_READY_KEY) === "true";

function readCache() {
  try {
    return JSON.parse(globalThis.localStorage?.getItem(CACHE_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

const translationCache = readCache();

function cacheResult(key, value) {
  translationCache[key] = value;
  const keys = Object.keys(translationCache);
  keys.slice(0, Math.max(0, keys.length - MAX_CACHE_ITEMS)).forEach((oldKey) => delete translationCache[oldKey]);
  try {
    globalThis.localStorage?.setItem(CACHE_KEY, JSON.stringify(translationCache));
  } catch { /* memory cache remains available */ }
}

export function prepareTranslationModels(forceCheck = false) {
  if (!Capacitor.isNativePlatform()) return Promise.resolve(false);
  if (modelsMarkedReady && !forceCheck) return Promise.resolve(true);
  if (modelPreparationPromise) return modelPreparationPromise;
  modelPreparationPromise = (async () => {
    const required = [Language.English, Language.Spanish];
    const { languages = [] } = await Translation.getDownloadedModels();
    await Promise.all(required
      .filter((language) => !languages.includes(language))
      .map((language) => Translation.downloadModel({ language })));
    modelsMarkedReady = true;
    globalThis.localStorage?.setItem(MODEL_READY_KEY, "true");
    return true;
  })().catch((error) => {
    modelPreparationPromise = null;
    throw error;
  });
  return modelPreparationPromise;
}

export async function translateWithContext(word, context = word, sourceLang = "en") {
  if (!Capacitor.isNativePlatform()) return null;
  const normalizedWord = String(word || "").trim();
  const normalizedContext = String(context || normalizedWord).trim();
  const cacheKey = `${sourceLang}:${normalizedWord}\u0000${normalizedContext}`;
  if (translationCache[cacheKey]) return translationCache[cacheKey];

  await prepareTranslationModels();
  const sourceLanguage = sourceLang === "es" ? Language.Spanish : Language.English;
  const targetLanguage = sourceLang === "es" ? Language.English : Language.Spanish;
  const translate = () => {
    const wordPromise = Translation.translate({ text: normalizedWord, sourceLanguage, targetLanguage });
    const contextPromise = normalizedWord === normalizedContext
      ? wordPromise
      : Translation.translate({ text: normalizedContext, sourceLanguage, targetLanguage });
    return Promise.all([wordPromise, contextPromise]);
  };
  let wordResult;
  let contextResult;
  try {
    [wordResult, contextResult] = await translate();
  } catch (error) {
    if (!modelsMarkedReady) throw error;
    modelsMarkedReady = false;
    globalThis.localStorage?.removeItem(MODEL_READY_KEY);
    modelPreparationPromise = null;
    await prepareTranslationModels(true);
    [wordResult, contextResult] = await translate();
  }
  const targetIsSpanish = sourceLang === "en";
  const result = {
    translated: wordResult.text,
    es: wordResult.text,
    pronunciation: targetIsSpanish ? "Escuchar" : "Listen",
    type: targetIsSpanish ? "traducción contextual" : "contextual translation",
    meaning: targetIsSpanish
      ? "Traducción generada en el dispositivo. El recuadro de contexto ayuda a interpretar el sentido dentro del versículo."
      : "Translation generated on the device. The context box helps interpret the meaning within the verse.",
    phrase: normalizedContext,
    phraseEs: contextResult.text
  };
  cacheResult(cacheKey, result);
  return result;
}
