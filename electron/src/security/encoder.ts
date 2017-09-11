export function encodeBase64(content: any): string {
    return new Buffer(content).toString("base64");
}

export function decodeBase64(content): string {
    return Buffer.from(content, "base64").toString("utf8");
}
