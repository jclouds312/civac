---
name: Real Bluetooth scale readings
description: CIVAC scale mode must not silently represent generated weights as real Bluetooth measurements.
---

**Rule:** When the user selects Bluetooth weighing, a failed or unsupported device connection must never start weight simulation or be recorded as a live measurement. Keep simulation behind an explicit user action.

**Why:** The user explicitly asked for real scale readings; fabricated weights could be mistaken for actual livestock measurements.

**How to apply:** Preserve the distinction between Bluetooth and simulated modes, and test a compatible physical scale before claiming device support.
