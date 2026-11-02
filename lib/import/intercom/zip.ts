import { deflateRawSync, inflateRawSync } from "node:zlib";

import {
  MAX_UNCOMPRESSED_BYTES,
  MAX_ZIP_FILES,
} from "./types";

const SIG_LOCAL = 0x04034b50;
const SIG_CENTRAL = 0x02014b50;
const SIG_EOCD = 0x06054b50;

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

export function crc32(buf: Uint8Array): number {
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

export function isZipBuffer(buf: Buffer): boolean {
  return buf.length >= 4 && buf.readUInt32LE(0) === SIG_LOCAL;
}

function findEocd(buf: Buffer): number {
  const min = Math.max(0, buf.length - 22 - 65535);
  for (let i = buf.length - 22; i >= min; i--) {
    if (buf.readUInt32LE(i) === SIG_EOCD) return i;
  }
  throw new Error("The zip file is missing a central directory.");
}

function basename(name: string): string {
  const parts = name.replace(/\\/g, "/").split("/");
  return parts.filter((part) => part && part !== "." && part !== "..").pop() ?? "";
}

function isTextExportName(name: string): boolean {
  const lower = name.toLowerCase();
  return (
    lower.endsWith(".json") ||
    lower.endsWith(".jsonl") ||
    lower.endsWith(".ndjson") ||
    lower.endsWith(".txt")
  );
}

export interface UnzippedText {
  files: Record<string, string>;
  warnings: string[];
}

/**
 * Reads stored (0) and deflated (8) text files from a zip. Skips directories,
 * binaries, zip64 entries, and anything past the uncompressed-size cap.
 */
export function unzipTextFiles(buf: Buffer): UnzippedText {
  const warnings: string[] = [];
  const files: Record<string, string> = {};
  const eocd = findEocd(buf);
  const count = buf.readUInt16LE(eocd + 8);
  const cdSize = buf.readUInt32LE(eocd + 12);
  const cdOffset = buf.readUInt32LE(eocd + 16);
  if (count > MAX_ZIP_FILES) {
    throw new Error(`The zip has ${count} files; the limit is ${MAX_ZIP_FILES}.`);
  }
  if (cdOffset + cdSize > buf.length) {
    throw new Error("The zip central directory is truncated.");
  }

  let cursor = cdOffset;
  let uncompressedTotal = 0;
  for (let i = 0; i < count; i++) {
    if (cursor + 46 > buf.length || buf.readUInt32LE(cursor) !== SIG_CENTRAL) {
      throw new Error("The zip central directory is invalid.");
    }
    const method = buf.readUInt16LE(cursor + 10);
    const compressedSize = buf.readUInt32LE(cursor + 20);
    const uncompressedSize = buf.readUInt32LE(cursor + 24);
    const nameLen = buf.readUInt16LE(cursor + 28);
    const extraLen = buf.readUInt16LE(cursor + 30);
    const commentLen = buf.readUInt16LE(cursor + 32);
    const localOff = buf.readUInt32LE(cursor + 42);
    const name = buf.subarray(cursor + 46, cursor + 46 + nameLen).toString("utf8");
    cursor += 46 + nameLen + extraLen + commentLen;

    if (name.endsWith("/")) continue;
    if (uncompressedSize === 0xffffffff || compressedSize === 0xffffffff) {
      warnings.push(`Skipped zip64 entry ${basename(name) || name}.`);
      continue;
    }
    const fileName = basename(name);
    if (!fileName || !isTextExportName(fileName)) continue;

    if (localOff + 30 > buf.length || buf.readUInt32LE(localOff) !== SIG_LOCAL) {
      warnings.push(`Skipped ${fileName}: local header is missing.`);
      continue;
    }
    const localNameLen = buf.readUInt16LE(localOff + 26);
    const localExtraLen = buf.readUInt16LE(localOff + 28);
    const dataOff = localOff + 30 + localNameLen + localExtraLen;
    if (dataOff + compressedSize > buf.length) {
      warnings.push(`Skipped ${fileName}: compressed data is truncated.`);
      continue;
    }

    uncompressedTotal += uncompressedSize;
    if (uncompressedTotal > MAX_UNCOMPRESSED_BYTES) {
      throw new Error(
        `Uncompressed zip contents exceed ${MAX_UNCOMPRESSED_BYTES} bytes.`,
      );
    }

    const compressed = buf.subarray(dataOff, dataOff + compressedSize);
    let raw: Buffer;
    try {
      if (method === 0) raw = Buffer.from(compressed);
      else if (method === 8) raw = inflateRawSync(compressed);
      else {
        warnings.push(`Skipped ${fileName}: compression method ${method}.`);
        continue;
      }
    } catch {
      warnings.push(`Skipped ${fileName}: it could not be decompressed.`);
      continue;
    }
    files[fileName] = raw.toString("utf8");
  }

  if (Object.keys(files).length === 0) {
    throw new Error("The zip has no JSON or JSONL files.");
  }
  return { files, warnings };
}

/** Builds a deflate zip for tests and the in-repo sample. */
export function zipTextFiles(files: Record<string, string>): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  const names = Object.keys(files);

  for (const name of names) {
    const raw = Buffer.from(files[name], "utf8");
    const compressed = deflateRawSync(raw);
    const crc = crc32(raw);
    const nameBuf = Buffer.from(name, "utf8");

    const local = Buffer.alloc(30);
    local.writeUInt32LE(SIG_LOCAL, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    const localChunk = Buffer.concat([local, nameBuf, compressed]);
    locals.push(localChunk);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(SIG_CENTRAL, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(raw.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(Buffer.concat([central, nameBuf]));
    offset += localChunk.length;
  }

  const cd = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(SIG_EOCD, 0);
  eocd.writeUInt16LE(names.length, 8);
  eocd.writeUInt16LE(names.length, 10);
  eocd.writeUInt32LE(cd.length, 12);
  eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, eocd]);
}
