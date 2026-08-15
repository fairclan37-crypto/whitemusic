# Library Migration Fix (ytdl-core -> play-dl)

The error "Error when parsing watch.html" confirms that `ytdl-core` is currently broken due to YouTube's latest internal updates. This plan replaces the failing library with **`play-dl`**, which is currently the most stable and reliable library for YouTube streaming in Node.js.

## User Review Required

> [!IMPORTANT]
> **Library Swap**: I am removing `@distube/ytdl-core` and installing `play-dl`. This is a necessary architectural change to bypass YouTube's parsing blocks.

> [!TIP]
> **Better Stability**: `play-dl` is known for being faster and having a higher success rate with streaming than the traditional `ytdl` libraries.

## Proposed Changes

### 1. Backend: Dependency Management

#### [ACTION] [Terminal](file:///C:/Users/admin/Desktop/MusicApp/backend/)
- Run `npm uninstall @distube/ytdl-core`
- Run `npm install play-dl`

### 2. Backend: Streaming Route Refactor

#### [MODIFY] [stream.ts](file:///C:/Users/admin/Desktop/MusicApp/backend/src/routes/stream.ts)
- Replace all `ytdl` imports and logic with `play-dl`.
- Use `play_dl.stream(videoId)` to fetch the audio stream.
- Keep the HTTP Range and Chunked encoding support for compatibility.

### 3. Backend: Search Route Refactor (Optional but Recommended)

#### [MODIFY] [search.ts](file:///C:/Users/admin/Desktop/MusicApp/backend/src/routes/search.ts)
- Update search logic to use `play-dl` for even better metadata and speed.

## Verification Plan

### Manual Verification
- **Playback Test**: Verify that clicking a song no longer triggers the "Parsing watch.html" error.
- **Seeking**: Test that the progress bar seeking still works with the new stream provider.
- **Buffering**: Observe that the audio starts playing faster due to `play-dl`'s optimized fetching.
