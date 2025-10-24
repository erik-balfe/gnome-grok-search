import St from 'gi://St';
import Gio from 'gi://Gio';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

class SearchProvider {
    constructor(extension) {
        this._extension = extension;
        this.terms = [];  // Store terms for metadata
    }

    get appInfo() {
        return null;
    }

    get canLaunchSearch() {
        return false;
    }

    get id() {
        return this._extension.uuid;
    }

    activateResult(result, terms) {
        if (result === 'grok-search') {
            const query = terms.join(' ');
            const url = `https://grok.com/?q=${encodeURIComponent(query)}`;
            Gio.AppInfo.launch_default_for_uri(url, null);
        }
    }

    launchSearch(terms) {
        // No-op
    }

    createResultObject(meta) {
        return null;
    }

    async getResultMetas(results, cancellable) {
        const {scaleFactor} = St.ThemeContext.get_for_stage(global.stage);
        const resultMetas = [];
        for (const id of results) {
            if (id === 'grok-search') {
                resultMetas.push({
                    id,
                    name: `Ask Grok: ${this.terms.join(' ')}`,
                    description: 'Search with Grok AI',
                    clipboardText: '',
                    createIcon: size => new St.Icon({
                        icon_name: 'system-search-symbolic',  // Or use a custom icon if you add one
                        width: size * scaleFactor,
                        height: size * scaleFactor,
                    }),
                });
            }
        }
        return resultMetas;
    }

    async getInitialResultSet(terms, cancellable) {
        this.terms = terms;  // Save for later
        return terms.length > 0 ? ['grok-search'] : [];
    }

    async getSubsearchResultSet(results, terms, cancellable) {
        return this.getInitialResultSet(terms, cancellable);
    }

    filterResults(results, maxResults) {
        return results.slice(0, maxResults);
    }
}

export default class GrokSearchExtension extends Extension {
    enable() {
        this._provider = new SearchProvider(this);
        Main.overview.searchController.addProvider(this._provider);
    }

    disable() {
        Main.overview.searchController.removeProvider(this._provider);
        this._provider = null;
    }
}
