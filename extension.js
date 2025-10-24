const St = imports.gi.St;
const Gio = imports.gi.Gio;
const Main = imports.ui.main;
const { Extension } = imports.misc.extensionUtils.getCurrentExtension();

class GrokSearchProvider {
    constructor(extension) {
        this.extension = extension;
        this.terms = [];
    }

    getInitialResultSet(terms, callback) {
        this.terms = terms;
        callback(terms.length > 0 ? ['grok-search'] : []);
    }

    getSubsearchResultSet(previousResults, terms, callback) {
        this.getInitialResultSet(terms, callback);
    }

    getResultMetas(results, callback) {
        const { scaleFactor } = St.ThemeContext.get_for_stage(global.stage);
        const metas = results.map(id => ({
            id,
            name: `Ask Grok: ${this.terms.join(' ')}`,
            description: 'Search with Grok AI',
            createIcon: size => new St.Icon({
                // Use custom icon if present, fallback to symbolic
                gicon: Gio.icon_new_for_string(this.extension.dir.get_path() + '/icon.jpg') ||
                       new Gio.ThemedIcon({ name: 'system-search-symbolic' }),
                width: size * scaleFactor,
                height: size * scaleFactor,
            }),
        }));
        callback(metas);
    }

    activateResult(resultId, terms) {
        if (resultId === 'grok-search') {
            const query = terms.join(' ');
            const url = `https://grok.com/?q=${encodeURIComponent(query)}`;
            try {
                Gio.AppInfo.launch_default_for_uri(url, null);
            } catch (e) {
                logError(e, 'Failed to launch Grok URL');
            }
        }
    }
}

class ExtensionClass {
    constructor(extension) {
        this.extension = extension;
    }

    enable() {
        this.provider = new GrokSearchProvider(this.extension);
        Main.overview.searchController.addProvider(this.provider);
    }

    disable() {
        if (this.provider) {
            Main.overview.searchController.removeProvider(this.provider);
            this.provider = null;
        }
    }
}

function init(meta) {
    return new ExtensionClass(meta);
}
