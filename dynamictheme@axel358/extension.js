const Main = imports.ui.main;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Settings = imports.ui.settings;
const Gio = imports.gi.Gio;

class DynamicThemeExtension {

    constructor(uuid) {
        this.settings = new Settings.ExtensionSettings(this, uuid);

        this.settings.bind("light-time", "light_time", this.update);
        this.settings.bind("dark-time", "dark_time", this.update);
        this.settings.bind("change-color-scheme", "change_color_scheme", this.on_settings_changed);
        this.settings.bind("change-gtk-theme", "change_gtk_theme", this.on_settings_changed);
        this.settings.bind("change-cinnamon-theme", "change_cinnamon_theme", this.on_settings_changed);
        this.settings.bind("change-cursor-theme", "change_cursor_theme");
        this.settings.bind("change-wallpaper", "change_wallpaper", this.on_settings_changed);
        this.settings.bind("light-gtk-theme", "light_gtk_theme", this.on_settings_changed);
        this.settings.bind("light-cursor-theme", "light_cursor_theme", this.on_settings_changed);
        this.settings.bind("light-wallpaper", "light_wallpaper", this.on_settings_changed);
        this.settings.bind("dark-gtk-theme", "dark_gtk_theme", this.on_settings_changed);
        this.settings.bind("dark-cursor-theme", "dark_cursor_theme", this.on_settings_changed);
        this.settings.bind("dark-wallpaper", "dark_wallpaper", this.on_settings_changed);
        //this.settings.connect("changed::light-time", Lang.bind(this, this.on_settings_changed));
        this.isDark = false;
    }

    on_settings_changed() {
        //this.forceUpdate();
    }

    enable() {
        this.forceUpdate();
        this.update();
    }

    forceUpdate() {

        const currentTime = new Date().getTime();
        const lightTime = this.getDateFromObject(this.light_time);
        const darkTime = this.getDateFromObject(this.dark_time);

        if (currentTime > lightTime && currentTime < darkTime)
            this.applyLightMode();
        else
            this.applyDarkMode();
    }

    update() {
    global.logError("up");
        const currentTime = new Date().getTime();
        const lightTime = this.getDateFromObject(this.light_time);
        const darkTime = this.getDateFromObject(this.dark_time);

        if (currentTime > lightTime && currentTime < darkTime) {
            if(this.isDark)
                this.applyLightMode();
        }
        else {
            if(!this.isDark)
                this.applyDarkMode();
        }

        this.update_loop_id = Mainloop.timeout_add(60000, Lang.bind(this, this.update));
    }

    applyLightMode() {
        global.logError("Changing to light mode");

        if(this.change_wallpaper)
            this.setWallpaper(this.light_wallpaper);

        if(this.change_gtk_theme)
            this.setGtkTheme(this.light_gtk_theme);

        if(this.change_cinnamon_theme) {
        global.logError("yes");
        this.setCinnamonTheme(this.light_gtk_theme)
        }


        if(this.change_cursor_theme)
            this.setCursorTheme(this.light_cursor_theme);

        if(this.change_color_scheme)
            this.setColorScheme("default");

        this.isDark = false;

    }

    applyDarkMode() {
        global.logError("Changing to dark mode");

        if(this.change_wallpaper)
            this.setWallpaper(this.dark_wallpaper);
        if(this.change_gtk_theme)
            this.setGtkTheme(this.dark_gtk_theme);
        if(this.change_cinnamon_theme)
            this.setCinnamonTheme(this.dark_gtk_theme)
        if(this.change_cursor_theme)
            this.setCursorTheme(this.dark_cursor_theme);
        if(this.change_color_scheme)
            this.setColorScheme("prefer-dark");

        this.isDark = true;
    }

    getDateFromObject(dateObject) {
        return new Date().setHours(dateObject["h"], dateObject["m"], dateObject["s"]);
    }

    setWallpaper(wallpaperUri) {
        if(wallpaperUri.length > 0){

            const wallpaperFile = Gio.File.new_for_uri(wallpaperUri);
            if(wallpaperFile.query_exists(null)){

                const wallpaperSettings = new Gio.Settings({schema: "org.cinnamon.desktop.background"});
                wallpaperSettings.set_string("picture-uri", wallpaperFile.get_uri());
                Gio.Settings.sync();
                wallpaperSettings.apply();

            }
        }
    }

    setGtkTheme(theme) {
        if(theme !== undefined && theme.length > 0){
            const gtkSettings = new Gio.Settings({schema: "org.cinnamon.desktop.interface"});
            gtkSettings.set_string("gtk-theme", theme);
            Gio.Settings.sync();
            gtkSettings.apply();
        }
    }

    setCinnamonTheme(theme) {
        if(theme !== undefined && theme.length > 0){
            const cinnamonSettings = new Gio.Settings({schema: "org.cinnamon.theme"});
            cinnamonSettings.set_string("name", theme);
            Gio.Settings.sync();
            cinnamonSettings.apply();
        }
    }

    setCursorTheme(theme) {
        if(theme !== undefined && theme.length > 0){
            const gtkSettings = new Gio.Settings({schema: "org.cinnamon.desktop.interface"});
            gtkSettings.set_string("cursor-theme", theme);
            Gio.Settings.sync();
            gtkSettings.apply();
        }
    }

    setColorScheme(scheme) {
        const portalSettings = new Gio.Settings({schema: "org.x.apps.portal"});
        portalSettings.set_string("color-scheme", scheme);
        Gio.Settings.sync();
        portalSettings.apply();
    }

    disable() {
        if (this.update_loop_id > 0) {
            Mainloop.source_remove(this.update_loop_id);
            this.update_loop_id = 0;
        }

        this.settings.finalize();
        this.settings = null;
    }
}

let extension = null;

function init(metadata) {
    extension = new DynamicThemeExtension(metadata.uuid);
}

function enable() {
    extension.enable();
}

function disable() {
    extension.disable();
    extension = null;
}
