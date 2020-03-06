// jsonnet manifest.jsonnet --ext-str browser=chrome|firefox -o extension/manifest.json
local icons() = {
    [size]: "icon.png"
    for size in ["16","48","128"]
};
local js_files(name, files) = ["%s/%s.js" % [name, file] for file in files];
local manifest = {
      manifest_version: 2,
      name: "Rust Search Extension",
      description: "Search std docs, crates, builtin attributes, official books, and error codes, etc in your address bar instantly.",
      version: "0.8",
      icons: icons(),
      browser_action: {
        default_icon: $.icons,
        default_popup: "popup/index.html",
        default_title: $.description,
      },
      content_security_policy: "script-src 'self'; object-src 'self';",
      omnibox: {
        keyword: "rs"
      },
      web_accessible_resources:["compat.js"] + js_files("script", ["crate-docs"]),
      externally_connectable: {
          matches: [
            "*://docs.rs/*"
          ]
      },
      content_scripts: [{
            matches: [
              "*://docs.rs/*"
            ],
            js: ["compat.js"] + js_files("script", ["docs-rs"]),
            css: ["script/docs-rs.css"],
            run_at: "document_start"
      }],
      background: {
        scripts: ["compat.js", "settings.js", "deminifier.js",] +
                 js_files("search" ,["book", "doc", "crate", "attribute", "lint"]) +
                 js_files("index" ,["books", "crates", "std-docs", "lints"]) +
                 js_files("command" ,["base", "history", "manager"]) +
                 ["omnibox.js", "main.js","app.js",]
      },
      permissions: [
        "tabs"
      ],
      // The production extension public key to get the constant extension id during development.
      key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxOX+QfzcFnxPwwmzXDhuU59XGCSMZq+FGo0vOx/ufg/Vw7HfKEPVb9TKzrGtqW38kafWkjxOxGhF7VyyX2ymi55W0xqf8BedePbvMtV6H1tY5bscJ0dLKGH/ZG4T4f645LgvOWOBgyv8s3NDWXzwOMS57ER1y+EtHjDsWD1M0nfe0VCCLW18QlAsNTHfLZk6lUeEeGXZrl6+jK+pZxwhQFmc8cJvOyw7uAq6IJ9lnGDvxFVjGUepA0lKbLuIZjN3p70mgVUIuBYzKE6R8HDk4oBbKAK0HyyKfnuAYbfwVYotHw4def+OW9uADSlZEDC10wwIpU9NoP3szh+vWSnk0QIDAQAB",
      appendContentSecurityPolicy(policy)::self + {
            content_security_policy +: policy,
      }
};

if std.extVar("browser") == "firefox" then
  manifest
else
  manifest.appendContentSecurityPolicy(" script-src-elem 'self' https://rust-search-extension.now.sh/crates/index.js;")