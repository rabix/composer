const crypto = require("crypto");

const algorithm = "aes128";
const key       = "tygkvhbjkniop9t675ruetxdhfcghjbio86r5e4s";

export function encrypt(content: string | Buffer): string {
    const cipher = crypto.createCipher(algorithm, key);
    return cipher.update(content, "utf8", "hex") + cipher.final("hex");
}

export function decrypt(encrypted: string | Buffer): string {
    const decipher = crypto.createDecipher(algorithm, key);
    return decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
}
