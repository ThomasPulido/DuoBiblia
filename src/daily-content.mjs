import calendar from "./annual-prayer-calendar.json" with { type: "json" };
import { getLocalDayPeriod } from "./core.mjs";

export const ANNUAL_CONTENT_DAYS = 365;
export const ANNUAL_PRAYER_VERSE_COUNT = calendar.verseCount;

const themes = [
  { title: { es: "Paz que permanece", en: "Peace that remains" }, meditation: { es: "La paz de Dios no depende de que todo esté resuelto; puede ordenar el corazón mientras el camino todavía se aclara.", en: "God's peace does not depend on everything being resolved; it can steady the heart while the path is still becoming clear." }, prayer: { es: "Llena mi interior de tu paz y enséñame a compartirla.", en: "Fill me with your peace and teach me to share it." } },
  { title: { es: "Confianza para avanzar", en: "Trust to move forward" }, meditation: { es: "Confiar no es conocer cada respuesta, sino caminar recordando quién te acompaña.", en: "Trust is not knowing every answer; it is walking while remembering who is with you." }, prayer: { es: "Afirma mi confianza cuando no pueda ver el camino completo.", en: "Steady my trust when I cannot see the whole path." } },
  { title: { es: "Gratitud consciente", en: "Mindful gratitude" }, meditation: { es: "La gratitud abre los ojos a la bondad que suele esconderse dentro de lo cotidiano.", en: "Gratitude opens our eyes to the goodness often hidden inside ordinary life." }, prayer: { es: "Abre mis ojos a tus regalos y hazme agradecido.", en: "Open my eyes to your gifts and make me grateful." } },
  { title: { es: "Fuerza en la debilidad", en: "Strength in weakness" }, meditation: { es: "La debilidad no te aparta de Dios; puede convertirse en el lugar donde aprendes a recibir ayuda.", en: "Weakness does not push you away from God; it can become the place where you learn to receive help." }, prayer: { es: "Sostén mi debilidad y dame fuerzas para el siguiente paso.", en: "Hold my weakness and give me strength for the next step." } },
  { title: { es: "Sabiduría para elegir", en: "Wisdom to choose" }, meditation: { es: "Una pausa delante de Dios puede transformar la manera en que respondes, decides y tratas a los demás.", en: "A pause before God can transform the way you respond, decide, and treat others." }, prayer: { es: "Dame sabiduría, humildad y claridad para elegir bien.", en: "Give me wisdom, humility, and clarity to choose well." } },
  { title: { es: "Perdón que libera", en: "Forgiveness that frees" }, meditation: { es: "Perdonar no llama bueno al daño; entrega a Dios el derecho de sanar y hacer justicia.", en: "Forgiveness does not call harm good; it gives God room to heal and bring justice." }, prayer: { es: "Sana mis heridas y guíame en el camino del perdón.", en: "Heal my wounds and guide me along the path of forgiveness." } },
  { title: { es: "Esperanza renovada", en: "Renewed hope" }, meditation: { es: "La esperanza bíblica no ignora el dolor; espera la fidelidad de Dios dentro de él.", en: "Biblical hope does not ignore pain; it waits for God's faithfulness within it." }, prayer: { es: "Renueva mi esperanza y ayúdame a no rendirme.", en: "Renew my hope and help me not to give up." } },
  { title: { es: "Amor puesto en práctica", en: "Love put into practice" }, meditation: { es: "El amor se vuelve visible en la paciencia, la verdad, el servicio y la atención sincera.", en: "Love becomes visible through patience, truth, service, and sincere attention." }, prayer: { es: "Haz que mi amor se convierta en acciones sinceras.", en: "Let my love become sincere action." } },
  { title: { es: "Descanso para el alma", en: "Rest for the soul" }, meditation: { es: "Descansar también es un acto de confianza: el mundo sigue en las manos de Dios.", en: "Rest is also an act of trust: the world remains in God's hands." }, prayer: { es: "Calma mi mente y enséñame a recibir el descanso.", en: "Quiet my mind and teach me to receive rest." } },
  { title: { es: "Valentía con propósito", en: "Courage with purpose" }, meditation: { es: "La valentía no elimina el temor; decide hacer lo correcto aun mientras tiembla.", en: "Courage does not erase fear; it chooses what is right even while trembling." }, prayer: { es: "Dame valor para hacer lo correcto con amor.", en: "Give me courage to do what is right with love." } },
  { title: { es: "Presencia en el camino", en: "Presence along the way" }, meditation: { es: "Dios no solo te espera al final; permanece presente en cada parte del camino.", en: "God does not only wait at the finish; he remains present in every part of the journey." }, prayer: { es: "Hazme consciente de tu presencia en cada momento.", en: "Make me aware of your presence in every moment." } },
  { title: { es: "Fe en lo cotidiano", en: "Faith in ordinary life" }, meditation: { es: "La fe crece mediante decisiones pequeñas y constantes, no solo en momentos extraordinarios.", en: "Faith grows through small, steady choices, not only extraordinary moments." }, prayer: { es: "Fortalece mi fe en las tareas sencillas de hoy.", en: "Strengthen my faith in today's simple tasks." } },
  { title: { es: "Gozo que vuelve", en: "Joy that returns" }, meditation: { es: "El gozo puede convivir con las preguntas porque nace de una esperanza más profunda que las circunstancias.", en: "Joy can coexist with questions because it grows from a hope deeper than circumstances." }, prayer: { es: "Devuélveme el gozo y hazme portador de ánimo.", en: "Restore my joy and make me a bearer of encouragement." } },
  { title: { es: "Paciencia que madura", en: "Patience that matures" }, meditation: { es: "Esperar con Dios no es perder el tiempo; es permitir que el carácter madure sin forzar cada respuesta.", en: "Waiting with God is not wasted time; it allows character to mature without forcing every answer." }, prayer: { es: "Enséñame a esperar sin endurecer el corazón.", en: "Teach me to wait without hardening my heart." } },
  { title: { es: "Humildad para aprender", en: "Humility to learn" }, meditation: { es: "La humildad abre espacio para escuchar, corregir el rumbo y reconocer que necesitamos gracia.", en: "Humility makes room to listen, correct our course, and admit that we need grace." }, prayer: { es: "Dame un corazón enseñable y libre de orgullo.", en: "Give me a teachable heart, free from pride." } },
  { title: { es: "Propósito en lo pequeño", en: "Purpose in small things" }, meditation: { es: "Lo pequeño hecho con fidelidad también forma parte del propósito de Dios para tu vida.", en: "Small things done faithfully are also part of God's purpose for your life." }, prayer: { es: "Ayúdame a servirte con fidelidad en lo que hoy parece pequeño.", en: "Help me serve you faithfully in what seems small today." } },
  { title: { es: "Consuelo verdadero", en: "True comfort" }, meditation: { es: "Dios no exige que ocultes el dolor; se acerca a él y ofrece compañía antes que respuestas rápidas.", en: "God does not ask you to hide pain; he draws near and offers presence before quick answers." }, prayer: { es: "Abrázame en el dolor y ayúdame a acompañar a otros.", en: "Hold me in pain and help me walk beside others." } },
  { title: { es: "Generosidad alegre", en: "Joyful generosity" }, meditation: { es: "Dar con libertad recuerda que lo recibido puede convertirse en bendición para alguien más.", en: "Giving freely reminds us that what we receive can become a blessing to someone else." }, prayer: { es: "Hazme generoso con mi tiempo, mis recursos y mi atención.", en: "Make me generous with my time, resources, and attention." } },
  { title: { es: "Verdad con gracia", en: "Truth with grace" }, meditation: { es: "La verdad de Dios no humilla; ilumina el camino y nos enseña a hablar con firmeza y ternura.", en: "God's truth does not humiliate; it lights the way and teaches us to speak with firmness and tenderness." }, prayer: { es: "Pon verdad y gracia en mis palabras.", en: "Place truth and grace in my words." } },
  { title: { es: "Renovación interior", en: "Inner renewal" }, meditation: { es: "La renovación comienza cuando permites que Dios examine lo que nadie más ve y forme nuevos hábitos.", en: "Renewal begins when you let God examine what no one else sees and form new habits." }, prayer: { es: "Renueva mis pensamientos, deseos y decisiones.", en: "Renew my thoughts, desires, and decisions." } },
  { title: { es: "Servicio que refleja a Jesús", en: "Service that reflects Jesus" }, meditation: { es: "Servir no te hace menos; imita a Jesús y convierte el amor en una presencia concreta.", en: "Serving does not make you less; it follows Jesus and turns love into a tangible presence." }, prayer: { es: "Muéstrame a quién puedo servir hoy con alegría.", en: "Show me whom I can serve with joy today." } },
  { title: { es: "Libertad para comenzar de nuevo", en: "Freedom to begin again" }, meditation: { es: "La gracia permite reconocer el error sin quedar definido para siempre por él.", en: "Grace lets us acknowledge failure without being forever defined by it." }, prayer: { es: "Perdóname, levántame y enséñame a comenzar de nuevo.", en: "Forgive me, lift me, and teach me to begin again." } },
  { title: { es: "Unidad que construye", en: "Unity that builds" }, meditation: { es: "La unidad no exige pensar igual en todo; aprende a cuidar el vínculo mientras busca la verdad.", en: "Unity does not require agreement on everything; it protects the relationship while seeking truth." }, prayer: { es: "Hazme constructor de paz y reconciliación.", en: "Make me a builder of peace and reconciliation." } },
  { title: { es: "Fidelidad hasta el final", en: "Faithfulness to the end" }, meditation: { es: "La constancia nace de volver a Dios una y otra vez, incluso después de días difíciles.", en: "Faithfulness grows by returning to God again and again, even after difficult days." }, prayer: { es: "Sostén mi constancia y termina en mí la obra que comenzaste.", en: "Sustain my faithfulness and finish the work you began in me." } }
];

const focuses = [
  { es: "mis decisiones", en: "my decisions" }, { es: "mi familia", en: "my family" }, { es: "mi trabajo", en: "my work" },
  { es: "mi salud", en: "my health" }, { es: "mis pensamientos", en: "my thoughts" }, { es: "mis conversaciones", en: "my conversations" },
  { es: "mis planes", en: "my plans" }, { es: "mis temores", en: "my fears" }, { es: "mi gratitud", en: "my gratitude" },
  { es: "mi cansancio", en: "my weariness" }, { es: "mis relaciones", en: "my relationships" }, { es: "mis finanzas", en: "my finances" },
  { es: "mis estudios", en: "my studies" }, { es: "mi servicio a otros", en: "my service to others" }, { es: "mi futuro", en: "my future" },
  { es: "mi pasado", en: "my past" }, { es: "mi hogar", en: "my home" }, { es: "mi comunidad", en: "my community" },
  { es: "mi iglesia", en: "my church" }, { es: "mis amistades", en: "my friendships" }, { es: "quienes me han herido", en: "those who have hurt me" },
  { es: "mis esperanzas", en: "my hopes" }, { es: "mis hábitos", en: "my habits" }, { es: "mi tiempo", en: "my time" },
  { es: "mis palabras", en: "my words" }, { es: "mi cuerpo", en: "my body" }, { es: "mi descanso", en: "my rest" },
  { es: "mi propósito", en: "my purpose" }, { es: "mis dudas", en: "my doubts" }, { es: "mis alegrías", en: "my joys" },
  { es: "mis necesidades", en: "my needs" }
];

const periods = {
  morning: { iconName: "sunrise", title: { es: "Oración de la mañana", en: "Morning prayer" }, intro: { es: "Respira. Dios está aquí.", en: "Breathe. God is here." }, duration: { es: "7 minutos para comenzar con propósito", en: "7 minutes to begin with purpose" }, prayerTitle: { es: "Oración para comenzar", en: "A prayer to begin" }, opening: { es: "Padre celestial, gracias por este nuevo día.", en: "Heavenly Father, thank you for this new day." }, focus: { es: "Hoy pongo delante de ti", en: "Today I place before you" } },
  afternoon: { iconName: "sun", title: { es: "Pausa de oración", en: "Afternoon prayer pause" }, intro: { es: "Haz una pausa. Él camina contigo.", en: "Pause. He walks with you." }, duration: { es: "7 minutos para renovar tus fuerzas", en: "7 minutes to renew your strength" }, prayerTitle: { es: "Oración para continuar", en: "A prayer to continue" }, opening: { es: "Señor, hago una pausa y vuelvo mi atención a ti.", en: "Lord, I pause and turn my attention back to you." }, focus: { es: "Acompáñame mientras te entrego", en: "Stay with me as I entrust to you" } },
  night: { iconName: "moonStars", title: { es: "Oración de la noche", en: "Night prayer" }, intro: { es: "Descansa. Dios permanece cerca.", en: "Rest. God remains near." }, duration: { es: "7 minutos para cerrar el día en paz", en: "7 minutes to close the day in peace" }, prayerTitle: { es: "Oración para descansar", en: "A prayer for rest" }, opening: { es: "Padre, al terminar este día descanso en tu cuidado.", en: "Father, as this day ends I rest in your care." }, focus: { es: "Esta noche dejo en tus manos", en: "Tonight I leave in your hands" } }
};

const specialDays = {
  "01-01": { name: { es: "Año Nuevo", en: "New Year's Day" }, morning: { verse: "ISA:43:19", title: { es: "Dios abre caminos nuevos", en: "God opens new ways" }, meditation: { es: "Un año nuevo no exige tener todo resuelto. Dios puede comenzar algo bueno mientras das el siguiente paso con fe.", en: "A new year does not require having everything resolved. God can begin something good as you take the next faithful step." }, prayer: { es: "Señor, recibo este año de tus manos. Guía mis decisiones, renueva mis fuerzas y hazme fiel en cada etapa. Amén.", en: "Lord, I receive this year from your hands. Guide my decisions, renew my strength, and make me faithful in every season. Amen." } }, night: { verse: "LAM:3:23", title: { es: "Misericordia nueva para cada mañana", en: "New mercy for every morning" }, meditation: { es: "El primer día termina, pero la fidelidad de Dios no. Mañana habrá misericordia suficiente para volver a comenzar.", en: "The first day ends, but God's faithfulness does not. Tomorrow there will be enough mercy to begin again." }, prayer: { es: "Gracias por acompañarme en este primer día. Descanso en tu fidelidad y te entrego lo que aún no comprendo. Amén.", en: "Thank you for walking with me through this first day. I rest in your faithfulness and entrust what I still do not understand. Amen." } } },
  "02-14": { name: { es: "Día del amor", en: "Day of love" }, morning: { verse: "1CO:13:4", title: { es: "Un amor paciente y bondadoso", en: "A patient and kind love" }, meditation: { es: "El amor bíblico no se reduce a una emoción; toma forma en paciencia, bondad y cuidado por la dignidad del otro.", en: "Biblical love is more than an emotion; it takes shape through patience, kindness, and care for another's dignity." }, prayer: { es: "Dios de amor, sana mi manera de amar. Hazme paciente, sincero y generoso con las personas que has puesto cerca de mí. Amén.", en: "God of love, heal the way I love. Make me patient, sincere, and generous toward the people you have placed near me. Amen." } }, night: { verse: "1JO:4:19", title: { es: "Amamos porque fuimos amados", en: "We love because we were loved" }, meditation: { es: "Antes de cualquier logro o relación, ya eres alcanzado por el amor de Dios. Desde esa seguridad puedes amar sin vivir mendigando aprobación.", en: "Before any achievement or relationship, God's love has already reached you. From that security you can love without begging for approval." }, prayer: { es: "Padre, gracias por amarme primero. Que tu amor sane mis vacíos y se refleje en mis relaciones. Amén.", en: "Father, thank you for loving me first. Let your love heal my emptiness and be reflected in my relationships. Amen." } } },
  "12-24": { name: { es: "Nochebuena", en: "Christmas Eve" }, morning: { verse: "LUK:2:10", title: { es: "Buenas noticias para todos", en: "Good news for everyone" }, meditation: { es: "La Navidad comienza con una noticia capaz de vencer el temor: Dios se acercó y su alegría también alcanza a quienes se sienten lejos.", en: "Christmas begins with news able to overcome fear: God came near, and his joy also reaches those who feel far away." }, prayer: { es: "Señor, prepara mi corazón para recibir a Jesús con gratitud y compartir su alegría con otros. Amén.", en: "Lord, prepare my heart to receive Jesus with gratitude and share his joy with others. Amen." } }, night: { verse: "LUK:2:14", title: { es: "Gloria a Dios y paz", en: "Glory to God and peace" }, meditation: { es: "En medio de reuniones, ausencias y recuerdos, el anuncio de los ángeles vuelve a dirigir el corazón hacia la gloria de Dios y su paz.", en: "Amid gatherings, absences, and memories, the angels' announcement turns the heart again toward God's glory and peace." }, prayer: { es: "Dios de paz, habita esta noche en cada hogar. Consuela al que está solo y haznos instrumentos de reconciliación. Amén.", en: "God of peace, dwell in every home tonight. Comfort those who are alone and make us instruments of reconciliation. Amen." } } },
  "12-25": { name: { es: "Navidad", en: "Christmas Day" }, morning: { verse: "LUK:2:11", title: { es: "Ha nacido el Salvador", en: "The Savior is born" }, meditation: { es: "La esperanza cristiana tiene un nombre: Jesús. Dios entró en nuestra historia con humildad para traer salvación y cercanía.", en: "Christian hope has a name: Jesus. God entered our story in humility to bring salvation and nearness." }, prayer: { es: "Jesús, gracias por venir a nuestro encuentro. Reina en mi corazón y permite que mi vida anuncie tu esperanza. Amén.", en: "Jesus, thank you for coming to meet us. Reign in my heart and let my life announce your hope. Amen." } }, night: { verse: "JOH:1:14", title: { es: "Dios habitó entre nosotros", en: "God dwelt among us" }, meditation: { es: "Al cerrar la Navidad, recuerda que Dios no observó el dolor desde lejos: vino a habitar entre nosotros, lleno de gracia y verdad.", en: "As Christmas Day closes, remember that God did not watch pain from afar: he came to dwell among us, full of grace and truth." }, prayer: { es: "Señor, gracias por tu presencia. Que la gracia y la verdad de Jesús permanezcan en mi hogar mucho después de esta celebración. Amén.", en: "Lord, thank you for your presence. May the grace and truth of Jesus remain in my home long after this celebration. Amen." } } },
  "12-31": { name: { es: "Fin de año", en: "New Year's Eve" }, morning: { verse: "PSA:90:12", title: { es: "Contar los días con sabiduría", en: "Numbering our days with wisdom" }, meditation: { es: "Cerrar el año invita a mirar el tiempo con honestidad: agradecer, aprender, pedir perdón y escoger con sabiduría lo que continuará.", en: "Closing the year invites us to look honestly at time: to give thanks, learn, seek forgiveness, and wisely choose what will continue." }, prayer: { es: "Señor, gracias por cada día de este año. Dame sabiduría para aprender de lo vivido y caminar contigo en lo que viene. Amén.", en: "Lord, thank you for every day of this year. Give me wisdom to learn from what has passed and walk with you into what comes next. Amen." } }, night: { verse: "PSA:103:2", title: { es: "No olvides sus beneficios", en: "Forget not his benefits" }, meditation: { es: "Antes de la medianoche, haz memoria de la gracia que te sostuvo. Incluso en un año difícil hubo señales de cuidado que merecen gratitud.", en: "Before midnight, remember the grace that sustained you. Even in a difficult year there were signs of care worthy of gratitude." }, prayer: { es: "Padre, recibo con gratitud lo bueno, te entrego lo doloroso y descanso mi futuro en tus manos. Amén.", en: "Father, I receive the good with gratitude, surrender the painful, and rest my future in your hands. Amen." } } }
};

function easterSunday(year) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451), month = Math.floor((h + l - 7 * m + 114) / 31);
  return new Date(year, month - 1, ((h + l - 7 * m + 114) % 31) + 1);
}

function christianSpecialDay(date) {
  const easter = easterSunday(date.getFullYear());
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  const sameDay = (left, right) => left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
  if (sameDay(date, goodFriday)) return {
    name: { es: "Viernes Santo", en: "Good Friday" },
    morning: { verse: "ISA:53:5", title: { es: "Herido por amor", en: "Wounded for love" }, meditation: { es: "La cruz revela la gravedad del pecado y, al mismo tiempo, la profundidad del amor que decidió cargar con él.", en: "The cross reveals the seriousness of sin and, at the same time, the depth of the love that chose to carry it." }, prayer: { es: "Jesús, gracias por tu entrega. Llévame al arrepentimiento, a la gratitud y a una vida transformada por tu amor. Amén.", en: "Jesus, thank you for giving yourself. Lead me to repentance, gratitude, and a life transformed by your love. Amen." } },
    night: { verse: "JOH:19:30", title: { es: "Consumado es", en: "It is finished" }, meditation: { es: "El silencio de este día no es derrota. En la cruz, Jesús completó la obra de amor y abrió un camino de reconciliación.", en: "The silence of this day is not defeat. On the cross, Jesus completed the work of love and opened a way of reconciliation." }, prayer: { es: "Señor, en silencio contemplo tu cruz. Recibe mi gratitud y enséñame a vivir bajo tu gracia. Amén.", en: "Lord, in silence I behold your cross. Receive my gratitude and teach me to live under your grace. Amen." } }
  };
  if (sameDay(date, easter)) return {
    name: { es: "Domingo de Resurrección", en: "Easter Sunday" },
    morning: { verse: "MAT:28:6", title: { es: "Él ha resucitado", en: "He is risen" }, meditation: { es: "La tumba vacía anuncia que la muerte no tiene la última palabra. En Jesús siempre existe una razón para esperar.", en: "The empty tomb announces that death does not have the final word. In Jesus there is always a reason to hope." }, prayer: { es: "Jesús resucitado, despierta mi fe y haz que tu vida nueva transforme cada área de mi historia. Amén.", en: "Risen Jesus, awaken my faith and let your new life transform every part of my story. Amen." } },
    night: { verse: "1CO:15:20", title: { es: "Una esperanza que vive", en: "A living hope" }, meditation: { es: "La celebración termina, pero la resurrección continúa sosteniendo la vida diaria, el duelo y el futuro.", en: "The celebration ends, but the resurrection continues to sustain daily life, grief, and the future." }, prayer: { es: "Padre, gracias porque Cristo vive. Que esta esperanza me acompañe al dormir y al despertar. Amén.", en: "Father, thank you that Christ lives. May this hope remain with me as I sleep and wake. Amen." } }
  };
  return null;
}

export function annualDayIndex(date = new Date()) {
  if (date.getMonth() === 1 && date.getDate() === 29) return 58;
  return Math.floor((Date.UTC(2025, date.getMonth(), date.getDate()) - Date.UTC(2025, 0, 1)) / 86400000);
}

function verseFor(index, period, overrideKey = null) {
  const key = overrideKey || calendar.days[index][period];
  return { ...calendar.verses[key], id: `annual-${index + 1}-${period}` };
}

function buildExperience(index, period, special = null) {
  const periodOffset = period === "morning" ? 0 : period === "afternoon" ? 7 : 14;
  const theme = themes[(index + periodOffset) % themes.length];
  const focus = focuses[(index * 3 + periodOffset) % focuses.length];
  const base = periods[period];
  const specialPeriod = special?.[period] || null;
  const verse = verseFor(index, period, specialPeriod?.verse);
  return {
    ...base, period, day: index + 1, id: `annual-${index + 1}-${period}`, verse, verseId: verse.id,
    eventName: special?.name || null,
    meditationTitle: specialPeriod?.title || theme.title,
    meditation: specialPeriod?.meditation || {
      es: `${theme.meditation.es} Al leer ${verse.reference.es}, presenta a Dios ${focus.es}; no necesitas resolverlo todo antes de acercarte a él.`,
      en: `${theme.meditation.en} As you read ${verse.reference.en}, bring ${focus.en} to God; you do not need to solve everything before coming near to him.`
    },
    prayer: specialPeriod?.prayer || {
      es: `${base.opening.es} ${base.focus.es} ${focus.es}. ${theme.prayer.es} Guía mis próximos pasos y forma en mí un corazón fiel. En el nombre de Jesús, amén.`,
      en: `${base.opening.en} ${base.focus.en} ${focus.en}. ${theme.prayer.en} Guide my next steps and form a faithful heart in me. In Jesus' name, amen.`
    }
  };
}

export const ANNUAL_DEVOTIONALS = Array.from({ length: ANNUAL_CONTENT_DAYS }, (_, index) => ({
  day: index + 1,
  morning: buildExperience(index, "morning"),
  afternoon: buildExperience(index, "afternoon"),
  night: buildExperience(index, "night")
}));

export function getAnnualDevotional(date = new Date(), requestedPeriod = getLocalDayPeriod(date)) {
  const period = periods[requestedPeriod] ? requestedPeriod : getLocalDayPeriod(date);
  const index = Math.min(ANNUAL_CONTENT_DAYS - 1, Math.max(0, annualDayIndex(date)));
  const fixedKey = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return buildExperience(index, period, specialDays[fixedKey] || christianSpecialDay(date));
}

export function getAnnualDailyVerse(date = new Date()) {
  return getAnnualDevotional(date, "morning").verse;
}
