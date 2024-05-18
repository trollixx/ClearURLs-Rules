// Script to minimize rules JSON for publishing.
// Docs: https://docs.clearurls.xyz/1.26.1/specs/rules/#dataminjson-catalog

type Provider = {
    urlPattern: string;
    completeProvider?: boolean;
    rules?: string[];
    referralMarketing?: string[];
    exceptions?: string[];
    rawRules?: string[];
    redirections?: string[];
    forceRedirection?: boolean;
};

const rule_file = "rules.jsonc";
const minimized_file = "build/rules.min.json";

const json = await Bun.file(rule_file).json();
console.log("Loaded", Object.keys(json.providers).length, "rules.");

const providers: { [key: string]: object } = {};

for (const key in json.providers) {
    const p = json.providers[key];
    if (!p.urlPattern || p.urlPattern === "") {
        console.error(
            "Missing or empty urlPattern property for provider:",
            key,
        );
        process.abort();
    }

    const pm: Provider = {
        urlPattern: p.urlPattern,
    };

    // Only set boolean values if `true`.
    if (p.completeProvider === true) {
        pm.completeProvider = true;
    }

    if (p.forceRedirection === true) {
        pm.forceRedirection = true;
    }

    // Only keep non-empty arrays.
    if (p.rules && p.rules.length > 0) {
        pm.rules = p.rules;
    }

    if (p.referralMarketing && p.referralMarketing.length > 0) {
        pm.referralMarketing = p.referralMarketing;
    }

    if (p.exceptions && p.exceptions.length > 0) {
        pm.exceptions = p.exceptions;
    }

    if (p.rawRules && p.rawRules.length > 0) {
        pm.rawRules = p.rawRules;
    }

    if (p.redirections && p.redirections.length > 0) {
        pm.redirections = p.redirections;
    }

    providers[key] = pm;
}

const buf = JSON.stringify({ providers });
const size = await Bun.write(minimized_file, buf);
console.log("Written", size, "bytes.");

// Calculate checksum.
const hasher = new Bun.CryptoHasher("sha256");
hasher.update(buf);

const sum = hasher.digest("hex");
console.log("Checksum:", sum);

await Bun.write(`${minimized_file}.hash`, sum);
