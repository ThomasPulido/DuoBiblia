import { Capacitor } from "@capacitor/core";
import { Language, Translation } from "@capacitor-mlkit/translation";

export async function translateWithContext(word, context = word, sourceLang = "en") {
  if (!Capacitor.isNativePlatform()) return null;
  const sourceLanguage = sourceLang === "es" ? Language.Spanish : Language.English;
  const targetLanguage = sourceLang === "es" ? Language.English : Language.Spanish;
  const [wordResult, contextResult] = await Promise.all([
    Translation.translate({ text: word, sourceLanguage, targetLanguage }),
    Translation.translate({ text: context, sourceLanguage, targetLanguage })
  ]);
  const targetIsSpanish = sourceLang === "en";
  return {
    translated: wordResult.text,
    es: wordResult.text,
    pronunciation: targetIsSpanish ? "Escuchar" : "Listen",
    type: targetIsSpanish ? "traducción automática" : "automatic translation",
    meaning: targetIsSpanish
      ? "Traducción generada en el dispositivo. El recuadro de contexto ayuda a interpretar el sentido dentro del versículo."
      : "Translation generated on the device. The context box helps interpret the meaning within the verse.",
    phrase: context,
    phraseEs: contextResult.text
  };
}
