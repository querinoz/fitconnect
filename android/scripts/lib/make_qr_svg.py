#!/usr/bin/env python3
"""Emit an SVG QR for a URL. Dev-only; not shipped in the Android APK.

Uses vendored Nayuki qrcodegen (MIT) — no pip install required.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

_VENDOR = Path(__file__).resolve().parent / "vendor"
sys.path.insert(0, str(_VENDOR))

from qrcodegen import QrCode  # noqa: E402


def to_svg(qr: QrCode, *, border: int = 4, scale: int = 8) -> str:
    size = qr.get_size()
    dim = (size + border * 2) * scale
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {dim} {dim}" '
        f'width="{dim}" height="{dim}" role="img" aria-label="Installation QR code">'
        f'<rect width="100%" height="100%" fill="#F4F7F2"/>'
    ]
    for y in range(size):
        for x in range(size):
            if qr.get_module(x, y):
                px = (x + border) * scale
                py = (y + border) * scale
                parts.append(
                    f'<rect x="{px}" y="{py}" width="{scale}" height="{scale}" fill="#090402"/>'
                )
    parts.append("</svg>")
    return "".join(parts)


def to_ascii(qr: QrCode, *, border: int = 2) -> str:
    size = qr.get_size()
    lines: list[str] = []
    for y in range(-border, size + border):
        row = []
        for x in range(-border, size + border):
            dark = 0 <= x < size and 0 <= y < size and qr.get_module(x, y)
            # ASCII-safe for Windows consoles (SVG is the scannable artifact).
            row.append("##" if dark else "  ")
        lines.append("".join(row))
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="FitConnect local-distribution QR SVG")
    parser.add_argument("text", help="Exact URL to encode")
    parser.add_argument("--out", required=True, help="Output .svg path")
    parser.add_argument("--ascii-out", help="Optional ASCII art path for terminal")
    parser.add_argument("--ecl", choices=("L", "M", "Q", "H"), default="M")
    args = parser.parse_args()

    ecl = {
        "L": QrCode.Ecc.LOW,
        "M": QrCode.Ecc.MEDIUM,
        "Q": QrCode.Ecc.QUARTILE,
        "H": QrCode.Ecc.HIGH,
    }[args.ecl]

    qr = QrCode.encode_text(args.text, ecl)
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(to_svg(qr), encoding="utf-8")
    if args.ascii_out:
        Path(args.ascii_out).write_text(to_ascii(qr), encoding="utf-8")
    print(f"QR_SVG={out}")
    print(f"QR_MODULES={qr.get_size()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
