package com.duobiblia.app;

import android.app.Activity;
import android.app.Application;
import android.os.Bundle;
import com.google.android.gms.ads.MobileAds;

public class DuoBibliaApplication extends Application implements Application.ActivityLifecycleCallbacks {
    private Activity currentActivity;
    private AppOpenAdManager appOpenAdManager;

    @Override
    public void onCreate() {
        super.onCreate();
        registerActivityLifecycleCallbacks(this);
        getSharedPreferences("duobiblia_ads", MODE_PRIVATE)
            .edit()
            .putInt("launch_count", getLaunchCount() + 1)
            .apply();
        appOpenAdManager = new AppOpenAdManager(this);
        MobileAds.initialize(this, status -> appOpenAdManager.loadAd());
    }

    int getLaunchCount() {
        return getSharedPreferences("duobiblia_ads", MODE_PRIVATE).getInt("launch_count", 0);
    }

    Activity getCurrentActivity() {
        return currentActivity;
    }

    @Override public void onActivityStarted(Activity activity) {
        currentActivity = activity;
        appOpenAdManager.showAdIfAvailable(activity);
    }
    @Override public void onActivityStopped(Activity activity) {
        if (currentActivity == activity) currentActivity = null;
    }
    @Override public void onActivityCreated(Activity activity, Bundle state) {}
    @Override public void onActivityResumed(Activity activity) { currentActivity = activity; }
    @Override public void onActivityPaused(Activity activity) {}
    @Override public void onActivitySaveInstanceState(Activity activity, Bundle state) {}
    @Override public void onActivityDestroyed(Activity activity) {
        if (currentActivity == activity) currentActivity = null;
    }
}
