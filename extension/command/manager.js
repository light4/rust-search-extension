function CommandManager() {
    this.cmds = {
        "help": "Show the help messages.",
        "yet": "Show all Are We Yet websites.",
        "book": "Show all Rust official books.",
        "stable": "Show stable Rust scheduled release date in the next year.",
    };
    [new HistoryCommand()].forEach(cmd => this.addCommand(cmd));
}

CommandManager.prototype.execute = function(query) {
    query = query.replace(":", "").trim();
    let [cmd, arg] = query.split(" ");
    if (cmd in this.cmds) {
        return this[cmd](arg);
    } else {
        return this.wrap([
            `Not command found ${c.match(":" + cmd)}, try following commands?`,
            ...Object.entries(this.cmds).map(([name, description]) => {
                return `${c.match(":" + name)} - ${c.dim(description)}`
            }),
        ]);
    }
};

// Wrap the result array with the default content,
// as the content is required by omnibox api.
CommandManager.prototype.wrap = function(result) {
    return result.map((description, index) => {
        return {content: `${index + 1}`, description};
    });
};

CommandManager.prototype.help = function() {
    return this.wrap([
        `Prefix ${c.match(":")} to execute command (${Object.keys(this.cmds).map(c => ":" + c).join(", ")})`,
        `Prefix ${c.match("!")} to search crates, prefix ${c.match("!!")} to search crates's docs url`,
        `Prefix ${c.match("#")} to search builtin attributes`,
        `Prefix ${c.match("%")} to search Rust official book chapters`,
        `[WIP] Prefix ${c.match("@crate")} (${c.dim("e.g. @tokio")}) to search the dedicated crate's doc`,
        `[WIP] Prefix ${c.match("/")} to search official Rust project (rust-lang, rust-lang-nursery)`,
        `[WIP] Prefix ${c.match("?")} to search Rust tracking issues`,
        `[WIP] Prefix ${c.match(">")} to search Rust clippy lints`,
    ]);
};

CommandManager.prototype.yet = function(arg) {
    // https://wiki.mozilla.org/Areweyet
    const areweyet = [
        ["Are we async yet?", "Asynchronous I/O in Rust", "https://areweasyncyet.rs"],
        ["Are we audio yet?", "Audio related development in Rust", "https://areweaudioyet.com"],
        ["Are we game yet?", "Rust game development", "http://arewegameyet.com"],
        ["Are we GUI yet?", "Rust GUI development", "http://areweguiyet.com"],
        ["Are we IDE yet?", "Rust development environments", "http://areweideyet.com"],
        ["Are we learning yet?", "Rust machine learning ecosystem", "http://www.arewelearningyet.com"],
        ["Are we web yet?", "Rust libraries for web development", "http://arewewebyet.org"],
        ["Are we podcast yet?", "Rust Are We Podcast Yet", "https://soundcloud.com/arewepodcastyet"],
    ];
    return areweyet
        .filter(item => !arg || item[0].toLowerCase().indexOf(arg) > -1)
        .map(([title, description, content]) => {
            return {
                content,
                description: `${title} - ${c.dim(description)}`,
            }
        });
};

CommandManager.prototype.book = function(arg) {
    const books = [
        ["The Rust Programming Language", "https://doc.rust-lang.org/stable/book/"],
        ["Rust Async Book", "https://rust-lang.github.io/async-book/"],
        ["Rust Edition Guide Book", "https://doc.rust-lang.org/stable/edition-guide/"],
        ["The Cargo Book", "https://doc.rust-lang.org/cargo/index.html"],
        ["Rust and WebAssembly Book", "https://rustwasm.github.io/docs/book/"],
        ["The Embedded Rust Book", "https://rust-embedded.github.io/book/"],
        ["The Rust Cookbook", "https://rust-lang-nursery.github.io/rust-cookbook/"],
        ["Command line apps in Rust", "https://rust-cli.github.io/book/index.html"],
        ["Rust by Example", "https://doc.rust-lang.org/stable/rust-by-example/"],
        ["Rust RFC", "https://rust-lang.github.io/rfcs/"],
        ["The Rust Doc Book", "https://doc.rust-lang.org/rustdoc/index.html"],
        ["The rustc Book", "https://doc.rust-lang.org/rustc/index.html"],
        ["The Rust Reference", "https://doc.rust-lang.org/reference/index.html"],
        ["The Rustonomicon", "https://doc.rust-lang.org/nomicon/index.html"],
        ["The Unstable Book", "https://doc.rust-lang.org/unstable-book/index.html"],
        ["Rust bindgen User Guide", "https://rust-lang.github.io/rust-bindgen/"],
        ["The wasm-bindgen Guide", "https://rustwasm.github.io/docs/wasm-bindgen/"],
        ["Rust API Guidelines", "https://rust-lang.github.io/api-guidelines/"],
        ["Rust Fuzz Book", "https://rust-fuzz.github.io/book/"],
    ];
    return books
        .filter(item => !arg || item[0].toLowerCase().indexOf(arg) > -1)
        .map(([name, url]) => {
            return {
                content: url,
                description: `${c.match(name)} - ${c.dim(url)}`,
            }
        });
};

CommandManager.prototype.stable = function() {
    let dates = [];
    let startVersion = 42;
    let end = new Date();
    end.setFullYear(end.getFullYear() + 1);
    for (let n = 0, v = 0; ; v++) {
        let date = new Date("2020-01-30");
        date.setDate(date.getDate() + v * 42);
        if (date >= end) break;
        if (date >= new Date()) {
            dates.push(`Version ${c.match("1." + (startVersion + n++) + ".0")} scheduled release on ${c.match(c.normalizeDate(date))}`);
        }
    }
    return this.wrap(dates);
};

CommandManager.prototype.addCommand = function(command) {
    if (command.name in this.cmds) {
        return false;
    }

    this.cmds[command.name] = command.description;
    Object.defineProperty(CommandManager.prototype, command.name, {
        value: (arg) => {
            let result = command.onExecute(arg);
            if (!result || result.length < 1) {
                result = command.onBlankResult(arg);
            }

            if (command.wrap) {
                result = this.wrap(result);
            }
            return result;
        }
    });
};