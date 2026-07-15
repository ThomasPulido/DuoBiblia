export const ADMOB_IDS = Object.freeze({
  androidAppId: "ca-app-pub-8007313797348394~1152485477",
  iosAppId: "ca-app-pub-8007313797348394~9653183215",
  appOpen: {
    androidProduction: "ca-app-pub-8007313797348394/5227461859",
    androidTest: "ca-app-pub-3940256099942544/9257395921",
    iosProduction: "ca-app-pub-8007313797348394/7027019877",
    iosTest: "ca-app-pub-3940256099942544/5575463023"
  },
  achievementInterstitial: {
    androidProduction: "ca-app-pub-8007313797348394/7578293023",
    androidTest: "ca-app-pub-3940256099942544/1033173712",
    iosProduction: "ca-app-pub-8007313797348394/8172580587",
    iosTest: "ca-app-pub-3940256099942544/4411468910"
  }
});

// Los anuncios reales solo se activan en una compilación firmada con esta variable.
// Esto evita impresiones o clics accidentales mientras se desarrolla y se prueba.
export const USE_PRODUCTION_ADS = import.meta.env?.VITE_ADMOB_PRODUCTION === "true";
