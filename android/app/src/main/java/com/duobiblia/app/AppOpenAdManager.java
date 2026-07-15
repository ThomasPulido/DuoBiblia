package com.duobiblia.app;

import android.app.Activity;
import android.content.SharedPreferences;
import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.appopen.AppOpenAd;

final class AppOpenAdManager {
    private static final String TEST_ID = "ca-app-pub-3940256099942544/9257395921";
    private static final String PRODUCTION_ID = "ca-app-pub-8007313797348394/5227461859";
    private static final long FOUR_HOURS_MS = 4L * 60L * 60L * 1000L;
    private static final long TEST_COOLDOWN_MS = 30L * 60L * 1000L;

    private final DuoBibliaApplication application;
    private AppOpenAd appOpenAd;
    private boolean loading;
    private boolean showing;
    private long loadedAt;

    AppOpenAdManager(DuoBibliaApplication application) {
        this.application = application;
    }

    void loadAd() {
        if (isPremium()) {
            appOpenAd = null;
            return;
        }
        if (loading || isAvailable()) return;
        loading = true;
        String adUnitId = BuildConfig.USE_PRODUCTION_ADS ? PRODUCTION_ID : TEST_ID;
        AppOpenAd.load(application, adUnitId, new AdRequest.Builder().build(), new AppOpenAd.AppOpenAdLoadCallback() {
            @Override public void onAdLoaded(AppOpenAd ad) {
                loading = false;
                appOpenAd = ad;
                loadedAt = System.currentTimeMillis();
            }

            @Override public void onAdFailedToLoad(LoadAdError error) {
                loading = false;
                appOpenAd = null;
            }
        });
    }

    void showAdIfAvailable(Activity activity) {
        if (isPremium()) {
            appOpenAd = null;
            return;
        }
        if (activity == null || showing) return;
        // Never interrupt the first two launches while the person is onboarding.
        if (application.getLaunchCount() < 3) {
            loadAd();
            return;
        }
        SharedPreferences preferences = application.getSharedPreferences("duobiblia_ads", 0);
        long lastShown = preferences.getLong("last_app_open_ad", 0L);
        long cooldown = BuildConfig.USE_PRODUCTION_ADS ? FOUR_HOURS_MS : TEST_COOLDOWN_MS;
        if (System.currentTimeMillis() - lastShown < cooldown) return;
        if (!isAvailable()) {
            loadAd();
            return;
        }

        showing = true;
        appOpenAd.setFullScreenContentCallback(new FullScreenContentCallback() {
            @Override public void onAdShowedFullScreenContent() {
                preferences.edit().putLong("last_app_open_ad", System.currentTimeMillis()).apply();
            }
            @Override public void onAdDismissedFullScreenContent() { clearAndReload(); }
            @Override public void onAdFailedToShowFullScreenContent(AdError error) { clearAndReload(); }
        });
        appOpenAd.show(activity);
    }

    private boolean isAvailable() {
        return appOpenAd != null && System.currentTimeMillis() - loadedAt < FOUR_HOURS_MS;
    }

    private boolean isPremium() {
        return application.getSharedPreferences("duobiblia_ads", 0).getBoolean("premium", false);
    }

    private void clearAndReload() {
        showing = false;
        appOpenAd = null;
        loadAd();
    }
}
