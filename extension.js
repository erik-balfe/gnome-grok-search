import St from 'gi://St';
import Gio from 'gi://Gio';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

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
                gicon: Gio.icon_new_for_string(`${this.extension.dir.get_path()}/icon.jpg`) ||
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

export default class GrokSearchExtension extends Extension {
    constructor(metadata) {
        super(metadata);
    }

    enable() {
        this._provider = new GrokSearchProvider(this);
        Main.overview.searchController.addProvider(this._provider);
    }

    disable() {
        if (this._provider) {
            Main.overview.searchController.removeProvider(this._provider);
            this._provider = null;
        }
    }
}
