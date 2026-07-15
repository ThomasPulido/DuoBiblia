package com.duobiblia.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "PremiumState")
public class PremiumStatePlugin extends Plugin {
    @PluginMethod
    public void setPremium(PluginCall call) {
        boolean premium = call.getBoolean("premium", false);
        getContext().getSharedPreferences("duobiblia_ads", 0)
            .edit()
            .putBoolean("premium", premium)
            .apply();
        JSObject result = new JSObject();
        result.put("premium", premium);
        call.resolve(result);
    }
}
