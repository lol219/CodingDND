/**
 * @name CodingDND
 * @invite AaMz4gp
 * @authorId 395598378387636234
 * @website https://github.com/SMC242/CodingDND
 * @source https://github.com/SMC242/CodingDND/blob/master/src/CodingDND.plugin.js
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
@cc_on
@if (@_jscript)
// Offer to self-install for clueless users that try to run this directly.
var shell = WScript.CreateObject("WScript.Shell");
var fs = new ActiveXObject("Scripting.FileSystemObject");
var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
var pathSelf = WScript.ScriptFullName;
// Put the user at ease by addressing them in the first person
shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
    shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
} else if (!fs.FolderExists(pathPlugins)) {
    shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
    fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
    // Show the user where to put plugins in the future
    shell.Exec("explorer " + pathPlugins);
    shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
}
WScript.Quit();

@else@
*/
// @ts-ignore
const Bapi = BdApi;
const { exec } = require("child_process");
/**
 * System agnostic method of finding all the process names
 * @returns Promise<Array<string>> of process names
 */
function get_all_processes() {
    return __awaiter(this, void 0, void 0, function* () {
        /**
         * Get the running process list and parse it into just the names. System agnostic
         * @param system_specifics The relevant information of the current environment
         * @returns Array<string> of process names
         */
        function parser(system_specifics) {
            return __awaiter(this, void 0, void 0, function* () {
                let processes = [];
                const slicer = (row) => row.slice(...system_specifics.row_range); // get the end of the name/command column
                // iterate over each row and parse it into the name only
                exec(system_specifics.command, (err, stdout) => {
                    const process_rows = stdout.split(system_specifics.line_ending);
                    // there's 3 rows of table formatting so start from i = 3
                    for (let i = system_specifics.table_start; i < process_rows.length; i++) {
                        processes.push(slicer(process_rows[i]).trim());
                    }
                });
                yield new Promise((r) => setTimeout(r, 300)); // block function until tasklist finishes
                return processes;
            });
        }
        const windows_settings = {
            row_range: [0, 29],
            table_start: 3,
            line_ending: "\r\n",
            command: "tasklist",
        };
        const linux_settings = {
            row_range: [67, undefined],
            table_start: 3,
            line_ending: "\r\n",
            command: "ps -aux",
        };
        return yield parser(process.platform === "win32" ? windows_settings : linux_settings);
    });
}
module.exports = (() => {
    const config = {
        info: {
            name: "CodingDND",
            authors: [
                {
                    name: "[DTWM] benmitchellmtbV5",
                    discord_id: "395598378387636234",
                    github_username: "SMC242",
                },
            ],
            version: "0.0.0",
            description: "This plugin will set the Do Not Disturb status when you open an IDE. You must install `process-list` via NPM to use this plugin",
            github: "https://github.com/SMC242/CodingDND",
            github_raw: "https://github.com/SMC242/CodingDND/blob/master/src/CodingDND.plugin.js",
        },
        changelog: [
            { title: "New Stuff", items: ["Added more settings", "Added changelog"] },
        ],
        main: "CodingDND.js",
    };
    // @ts-ignore
    return !global.ZeresPluginLibrary
        ? class {
            constructor() {
                this._config = config;
            }
            getName() {
                return config.info.name;
            }
            getAuthor() {
                return config.info.authors.map((a) => a.name).join(", ");
            }
            getDescription() {
                return config.info.description;
            }
            getVersion() {
                return config.info.version;
            }
            load() {
                Bapi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                    confirmText: "Download Now",
                    cancelText: "Cancel",
                    onConfirm: () => {
                        require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", (error, response, body) => __awaiter(this, void 0, void 0, function* () {
                            if (error)
                                return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                            yield new Promise((r) => require("fs").writeFile(require("path").join(Bapi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                        }));
                    },
                });
            }
            start() { }
            stop() { }
        }
        : (([Plugin, Api]) => {
            const CodingDND = (Plugin, Library) => {
                const { Logger, Patcher, Settings } = Library;
                return class CodingDND extends Plugin {
                    constructor() {
                        var _a;
                        super();
                        this.running = [];
                        this.targets = [];
                        this.settings = (_a = Bapi.loadData("CodingDND", "settings")) !== null && _a !== void 0 ? _a : {
                            tracked_items: new Map([
                                ["Atom", false],
                                ["Visual Studio Code", false],
                                ["IntelliJ", false],
                                ["Eclipse", false],
                                ["Visual Studio", false],
                                ["Pycharm", false],
                            ]),
                        };
                        // get the names of the processes
                        this.targets = Array.from(this.settings.tracked_items, (pair) => pair[0]);
                    }
                    getName() {
                        return config.info.name;
                    }
                    getAuthor() {
                        return config.info.name;
                    }
                    getDescription() {
                        return config.info.description;
                    }
                    getVersion() {
                        return config.info.version;
                    }
                    onStart() {
                        Logger.log("Started");
                        Patcher.before(Logger, "log", (t, a) => {
                            a[0] = "Patched Message: " + a[0];
                        });
                        this.loop();
                    }
                    onStop() {
                        Logger.log("Stopped");
                        Patcher.unpatchAll();
                    }
                    load() { }
                    getSettingsPanel() {
                        return Settings.SettingPanel.build(this.saveSettings.bind(this), 
                        // this group is for selecting `targets`
                        new Settings.SettingGroup("Target Processes").append(...this.button_set()));
                    }
                    /**
                     * Get the targeted tasks that are running
                     */
                    check_tasks() {
                        return __awaiter(this, void 0, void 0, function* () {
                            const current_tasks = yield get_all_processes();
                            return current_tasks
                                .map((value) => {
                                return this.targets.includes(value) ? value : null;
                            })
                                .filter((value) => value); // check if any of the values are truthy
                        });
                    }
                    /**
                     * Set the user's status
                     * @param set_to The status to set. This may be dnd, online, invisible, or idle
                     */
                    set_status(set_to) {
                        return __awaiter(this, void 0, void 0, function* () {
                            let UserSettingsUpdater = Bapi.findModuleByProps("updateLocalSettings");
                            UserSettingsUpdater.updateLocalSettings({
                                status: set_to,
                            });
                        });
                    }
                    /**
                     * Continually check for a target being started or stopped
                     */
                    loop() {
                        return __awaiter(this, void 0, void 0, function* () {
                            const sleep = () => new Promise((r) => setTimeout(r, 15000)); // sleep for 15 seconds
                            let new_running = [];
                            while (true) {
                                const current_targets = yield this.check_tasks();
                                console.log(`Current targets: ${current_targets}`);
                                // add the new tasks and remove the ones that have stopped
                                this.running.forEach((value) => {
                                    if (current_targets.includes(value)) {
                                        new_running = new_running.concat(value);
                                    }
                                });
                                this.running = new_running;
                                console.log(`New running: ${new_running}`);
                                // set the status if running, remove status if not running
                                const change_to = this.running.length // an empty list is truthy BRUH
                                    ? "dnd"
                                    : "online";
                                console.log(`New status: ${change_to}`);
                                this.set_status(change_to);
                                // sleep for 15 seconds
                                yield sleep();
                            }
                        });
                    }
                    /**
                     * Create a set of switches to take in whether to check for their status
                     * @returns n switches with values from names
                     */
                    button_set() {
                        return Array.from(this.settings.tracked_items, (pair) => pair[0]).map((name) => {
                            return new Settings.Switch(name, "Set DND when this process runs", this.settings.tracked_items[name], (new_val) => {
                                console.log(`This in cb: ${this}, type: ${typeof this}`);
                                const f = new_val ? this.track : this.untrack;
                                Logger.log(f);
                                f(name);
                            });
                        });
                    }
                    /**
                     * Track a process
                     * @param name The process to add
                     */
                    track(name) {
                        Logger.log("tracked");
                        console.log(`This: ${this}`);
                        this.settings.tracked_items[name] = true;
                        this.targets.push(name);
                    }
                    /**
                     * Untrack a process
                     * @param name The process to remove
                     */
                    untrack(name) {
                        Logger.log("untracked");
                        this.settings.tracked_items[name] = false;
                        this.targets.filter((value) => value !== name);
                    }
                };
            };
            return CodingDND(Plugin, Api);
            // @ts-ignore
        })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
//# sourceMappingURL=CodingDND.plugin.js.map