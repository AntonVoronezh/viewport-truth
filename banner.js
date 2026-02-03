try {
    if (
        process.env.CI ||
        process.env.ADBLOCK ||
        process.env.DISABLE_OPENCOLLECTIVE ||
        process.env.npm_config_ignore_scripts === "true" ||
        process.env.NODE_ENV === "test"
    ) {
        process.exit(0);
    }

    const loglevel = (process.env.npm_config_loglevel || "").toLowerCase();
    if (loglevel === "silent") process.exit(0);

    const reset = "\x1b[0m";
    const cyan = "\x1b[36m";
    const green = "\x1b[32m";
    const yellow = "\x1b[33m";
    const dim = "\x1b[2m";
    const bold = "\x1b[1m";

    const box = `${cyan}===============================================================${reset}`;

    const msg = `
${box}
${green}${bold} Thanks for installing nope-click!${reset} ${green}🚀${reset}
${box}

${yellow}This project is community-supported.${reset}
If it saves you time, please consider supporting development:

${green}Boosty (Cards/PayPal):${reset} https://boosty.to/antonvoronezh/donate
${green}Crypto (Telegram):${reset}     https://t.me/AntonVoronezhh/4

${dim}Tip: hide install messages with --silent (or npm config set loglevel silent).${reset}
${dim}Scripts can be disabled with --ignore-scripts (then this won’t run).${reset}
`;

    process.stderr.write(msg);

    process.stderr.write(
        `${bold}Support:${reset} https://boosty.to/antonvoronezh/donate | https://t.me/AntonVoronezhh/4\n`
    );
} catch (_) {
    process.exit(0);
}
