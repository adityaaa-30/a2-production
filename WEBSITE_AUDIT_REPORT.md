# Website Audit Report

**Project:** A2 Production  
**Audit completed:** 2026-11-08  
**Scope:** Final verification of the existing security, accessibility, performance, responsive, pricing-management, and navigation changes. This report records observed evidence; it does not imply production credentials or a live Supabase database were available.

## Summary and evidence-based scores

No numerical baseline score was recorded before the existing fixes, so a before/after score comparison is unavailable. The dependency audit did record seven findings before remediation (six high and one critical in the production dependency tree). No Lighthouse baseline or Core Web Vitals baseline exists.

| Area | Final score | Evidence and limits |
|---|---:|---|
| Code quality and build | 9/10 | ESLint, TypeScript, and production build passed. Manual review is not a substitute for all unit/integration coverage. |
| Dependency security | 9/10 | `npm audit --audit-level=moderate` reports zero vulnerabilities. This does not establish production configuration security. |
| Application security | 7/10 | API validation, request-origin checks, rate limiting, server-only key usage, and SQL policy changes were reviewed. Supabase policies and secrets were not verified against a live project; rate limiting is process-local. |
| Accessibility | 7/10 | Semantic controls, labels, dialog/menu focus behavior, and reduced-motion handling were reviewed; basic interactions were exercised. No automated axe/contrast audit or full keyboard-only walkthrough was completed. |
| Responsive behavior | 8/10 | Homepage and plans page had horizontal-overflow measurements at all 11 requested widths. Admin login/modal were viewed at mobile width. Authenticated admin dashboard/pricing layouts were not available for browser testing. |
| Performance | 7/10 | Static bundle and large media assets were measured and loading hints inspected. Lighthouse and Core Web Vitals were not run. |

Scores are internal evidence-based summaries, not a standardized certification. None is 10/10.

## Final code verification

- `npm run lint` — passed, no lint errors or warnings.
- `npx tsc --noEmit --incremental false` — passed.
- `npm run build` — passed using Next.js 16.4.5 and Turbopack. Routes generated: `/`, `/_not-found`, `/admin`, `/admin/pricing`, `/api/project-inquiry`, `/plans`, and `/robots.txt`.
- `npm audit --audit-level=moderate` — passed, zero vulnerabilities.
- `git diff --check` — passed; Git only reported line-ending normalization notices.
- Production build emitted no deprecation or build warnings.

The previous production dependency audit found seven vulnerabilities (six high, one critical). Next.js and the Next ESLint config were updated to 16.4.5; Zod was updated to v4 with the existing resolver's declared v4 support; safe transitive fixes and a scoped patched `minimatch` override removed the remaining findings. The Next.js Windows-hosted advisory is documented at [GHSA-p293-qw3h-jr36](https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36), and the `minimatch` advisory at [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249). No broad dependency upgrade was used as a substitute for audit remediation.

## Browser and route verification

- Project scripts identify `npm run dev` (`next dev`) and `npm run start` (`next start`) as the development and production startup commands. The verified browser URL was `http://127.0.0.1:3000/`.
- The page loaded in Chrome and remained available after a browser refresh. Browser automation, rather than a PowerShell HTTP probe, provided the localhost reachability evidence because the shell sandbox denied socket access to the loopback port.
- The following routes returned HTTP 200 in the production-route checks: `/`, `/plans`, `/admin`, `/admin/pricing`, and `/robots.txt`. The API route is exercised by POST below.
- Browser UI checks: the mobile navigation opened, selecting Process changed the URL to `/#process`, scrolled to the Process section, and closed the menu; `/plans` search for “Starter” reduced the results to one plan; the project inquiry modal opened and closed at a 414 CSS-pixel viewport; admin sign-in layout was visually checked at mobile width.
- The inquiry endpoint returned 200 for a same-origin honeypot submission (success response without a database write), 400 for a malformed empty object, and 403 for a cross-site request. No real inquiry was submitted.
- The current Chrome Console snapshot after refresh showed **0 messages**. Chrome surfaced two possible improvements in its separate Issues counter; the exact issue details were not inspected. An old separate tab labeled “localhost - Network error” remained from an earlier failed attempt; it is not evidence of an error on the current loaded page. A comprehensive Network-panel request audit was not completed, so failed third-party/static requests are not certified absent.
- No valid admin login was performed because no test credentials were provided. Consequently, admin-only pricing CRUD, deletion, featured-plan selection, logout interception, and authenticated dashboard interactions were not re-tested end to end. Their routes being HTTP 200 does not prove those workflows.

## Responsive checks

At each CSS viewport width below, `window.innerWidth`, `document.documentElement.scrollWidth`, and `document.body.scrollWidth` matched on both the homepage and `/plans`; no horizontal document scrolling was measured:

`320, 360, 375, 390, 414, 430, 768, 1024, 1366, 1440, 1920` pixels.

The admin sign-in card and inquiry dialog were visually checked at 414px, and the mobile navigation was exercised at 320px. There was no authenticated browser session for direct responsive testing of the project-request dashboard or pricing editor. The table/card layout at those widths therefore remains unverified in a live authenticated UI.

## Accessibility recheck

- Inspected semantic form labels, button/link controls, dialog roles and accessible naming, navigation menu state, and keyboard event handlers for Escape/focus containment and focus return.
- Exercised the mobile menu open, selection, and close flow and the inquiry dialog open/close flow. The full keyboard-only tab sequence and focus return were not independently proven in this final pass.
- Reduced-motion support was added to ambient lighting: it keeps a static glow and stops wander, pointer-follow, and color animation when `prefers-reduced-motion: reduce` is active. Smooth-scroll and other motion components already have reduced-motion handling.
- No axe/Lighthouse accessibility scan or automated contrast calculation was run. Contrast for every state, browser zoom, screen reader output, and all authenticated admin controls remain unverified.

## Security and Supabase

### Inquiry API

Reviewed `app/api/project-inquiry/route.ts`: it enforces a bounded request body, server-side schema/allow-list validation, honeypot handling, same-origin/Fetch Metadata checks, sanitized database error output, and creates the Supabase client on the server. The service-role key is read only from `SUPABASE_SERVICE_ROLE_KEY`; scanning `.next/static` found no reference to that key name in browser bundles. No key value was read or exposed.

A local-origin comparison issue was fixed: origin validation now compares the parsed origin host with the request `Host` header, accommodating the actual `127.0.0.1` URL while retaining the cross-site Fetch Metadata rejection. The three API response cases above were observed in the browser. Since the current `.env.local` has no `SUPABASE_SERVICE_ROLE_KEY`, a valid insert and database error path were not tested.

`proxy.ts` applies a limit of five requests per IP per minute and request-body limits. Its rate-limit state is an in-memory map per process; it is not shared across serverless workers or multiple instances. For a multi-instance production deployment, configure a shared durable rate-limit store and confirm the host's trusted client-IP forwarding behavior before relying on the limit globally.

### Migration and required manual setup

`supabase/migrations/20261108030000_route_public_requests_through_api.sql` drops the old public insert policy, revokes `INSERT` from `PUBLIC`, `anon`, and `authenticated`, and grants insert to `service_role`. This matches the design where public inquiry writes pass through the API. SQL syntax/order was reviewed in the repository; it was **not applied to a live database** and live grants/RLS behavior remain unverified.

Before production inquiry writes and admin pricing management can be considered configured:

1. In the intended Supabase project's SQL Editor, apply migrations in order: `20261106000000_manage_monthly_packages.sql`, `20261108000000_dynamic_monthly_package_ids.sql`, `20261108010000_monthly_package_discovery_metadata.sql`, `20261108020000_featured_monthly_packages.sql`, and `20261108030000_route_public_requests_through_api.sql`. Ensure the base `20260802000000_create_project_requests.sql` migration has already been applied; apply it first if missing.
2. Add that project's **service role key** as a server-only `SUPABASE_SERVICE_ROLE_KEY` secret in local environment and the deployment host's server environment. Never prefix it with `NEXT_PUBLIC_`, commit it, or send it to the browser. Restart/redeploy after adding it. This audit did not configure or reveal a secret.
3. Set the intended administrator's trusted Supabase `app_metadata.role` to `admin`; the reviewed RLS policies rely on that trusted claim for administrative access. Do not use user-editable metadata for authorization.
4. Verify policies and table grants in the Supabase dashboard, then test a valid inquiry and admin pricing CRUD using a non-production/test record. No production Supabase settings were changed.

The reviewed policy intent allows anonymous reads of `monthly_packages` for public plan display while restricting project-request and package-management operations to the configured admin/service role. This was checked in repository SQL only, not by querying Supabase.

## Performance findings

- `.next/static/chunks`: 19 files, 1,696,931 bytes total (about 1.62 MiB); largest chunk measured about 367 KB. This is uncompressed on-disk output, not transferred/gzip size.
- Largest public assets: hero WebM 17,162,995 bytes (~16.4 MB); hero MP4 9,111,249 bytes (~8.7 MB); hero audio 2,399,085 bytes (~2.3 MB); team PNGs about 1.0 MB each. The hero video has a poster and `preload="metadata"`; hero audio uses `preload="none"`; team images use `next/image` with `sizes`.
- Fonts use `next/font` and a local Inter package in the app's styles. A third-party font request was not observed in the tested route, but a full request waterfall was not captured.
- CSS is emitted as production CSS chunks and the production build completed; no separate minified/transferred CSS total was measured.
- No Core Web Vitals (LCP, CLS, INP) were recorded. Lighthouse is not installed in this environment, so Lighthouse scores are **unavailable**, not zero. No claim is made that all animations or network waterfalls meet a performance target.
- Large hero video/audio assets are the clearest remaining optimization opportunity. Consider responsive/compressed encodes and verify quality on target devices before replacing current assets.

## Hero Video Optimization & Cross-Browser Compatibility

### Inventory and inspected media

`components/Hero.tsx` contains separate mobile and desktop hero `<video>` elements. Both use the same 20.90-second clip and the same poster; there are no different mobile/desktop video variants. The desktop element is scroll-scrubbed by GSAP, while the mobile element attempts muted inline playback in JavaScript. The page also uses the audio separately through `HERO_AUDIO_SRC`; it is not an audio track embedded in either video.

| Asset | Container / codec | Dimensions / frame rate | Bitrate | Size | Other findings |
|---|---|---:|---:|---:|---|
| `public/videos/gargantua-scrub.mp4` | MP4 / H.264 High (`avc1`) | 1280×720, 30 fps | 3,485 kb/s video; 3,487 kb/s container | 9,111,249 bytes (8.69 MiB) | Progressive, 8-bit `yuv420p`, BT.709, no audio stream, no alpha channel. |
| `public/videos/gargantua-scrub.webm` | WebM / VP9 Profile 0 | 1280×720, 30 fps | 6,569 kb/s | 17,162,995 bytes (16.37 MiB) | Progressive, 8-bit `yuv420p`, BT.709, no audio stream, no alpha channel. |
| `public/images/hero-poster.jpg` | JPEG baseline | 1920×1080 | — | 150,260 bytes (146.7 KiB) | Kept; used by both video elements and the static poster fallbacks. |
| `public/audio/hero-scroll-music.mp3` | MP3, stereo, 48 kHz | — | 320 kb/s | 2,399,085 bytes (2.29 MiB) | Kept; separately referenced by the hero sound control and set to `preload="none"`. |

FFmpeg 8.1.2 parsed and decoded both video streams through a full-file VMAF comparison without decode errors. Using WebM as the comparison reference, the MP4 encode scored 86.59 VMAF. This is a relative comparison between these two encodes, **not** a score against the original camera/master file or a substitute for a full-screen visual review. No original master was found in the referenced production assets.

### Decision and implementation

**Both video formats are retained.** H.264/MP4 is the robust fallback for Safari/iOS versions and devices that do not decode VP9/WebM. WebKit documents full WebM VP8/VP9 support on iOS/iPadOS starting with Safari 17.4, while older iOS Safari support was limited; retaining MP4 avoids dropping those users. See [WebKit's Safari 17.4 media notes](https://webkit.org/blog/15063/webkit-features-in-safari-17-4/) and [Mozilla's browser codec guidance](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs).

The video source order is now VP9 WebM first, then H.264 MP4 fallback. That gives compatible modern browsers the higher-bitrate encode while preserving the broadly supported fallback. Each `<source>` advertises its media type (VP9 is identified on the WebM source) so browsers can skip unsupported codecs. There is no separate mobile source. The expected HTML media source selection is one chosen playable source, not downloading every listed source; an actual browser Network trace could not be captured in this run, so “one request per playback” is not marked empirically verified.

Both video elements now use `preload="metadata"`, keep their poster, remain muted and inline, and no longer carry an unconditional HTML `autoPlay` attribute. The mobile effect calls `play()` after media readiness and leaves the poster visible when autoplay fails. The desktop video is driven by scroll scrubbing and does not need to autoplay before the scrub timeline initializes. This avoids the old `preload="auto"` eager-fetch behavior while retaining above-the-fold video loading; this is not lazy loading. Reduced-motion preference stops the mobile playback and keeps the static poster visible; the desktop reduced-motion branch pauses and resets the clip, and CSS switches to the static poster.

### Cleanup, savings, and verification limits

- No MP4 or WebM file was deleted: each is still referenced in both responsive hero implementations for codec fallback. Keeping both costs 26,274,244 bytes (25.05 MiB) on disk. Removing WebM would save 17,162,995 bytes but eliminate the preferred VP9 encode; removing MP4 would save 9,111,249 bytes but drop the fallback for older/unsupported WebM decoders. Neither is a safe redundant-asset deletion under the requested Safari/iPhone compatibility target.
- No poster, thumbnail, or audio asset was removed. A repository-wide search found the video sources only in the two hero components; the poster is also used by the mobile and desktop static fallback and initial hero shell; the MP3 is separately used by the hero audio control.
- `npm run lint`, `npx tsc --noEmit --incremental false`, and `npm run build` passed after the hero changes. `git diff --check` passed.
- **Browser/device limitations:** CUA reported “Local browser use is disabled in Work settings” and no browser inventory was exposed. Thus there was no browser playback, Network-panel, console, poster-before-play, loop, scroll-scrub, responsive visual, or reduced-motion runtime test after these changes. No physical iPhone/iPad, macOS Safari, Android Chrome, Samsung Internet, or Firefox test was performed. Compatibility claims above rely on inspected codecs and published browser documentation, not a claim that those browsers/devices were exercised.
- The browser's actual codec choice and single-request behavior remain to verify in an enabled browser session, especially Safari on macOS and iPhone/iOS. Test Safari 17.4+ for WebM selection and an older/non-VP9 iOS environment for MP4 fallback before deciding whether to remove either file.

## Changes present in the audited working tree

Files changed or added by the accumulated audit work (this is the working-tree scope, not a claim that every change originated in this final verification turn):

- `.gitignore`, `AGENTS.md`, `next.config.ts`, `package.json`, `package-lock.json`
- `app/admin/page.tsx`, `app/layout.tsx`, `app/api/project-inquiry/route.ts`, `app/admin/pricing/`, `app/plans/`, `app/robots.ts`
- `components/AmbientLightBackground.tsx`, `components/Hero.tsx`, `components/Navbar.tsx`, `components/ProjectInquiryModal.tsx`, `components/Sections.tsx`, `components/SmoothScrollProvider.tsx`
- `hooks/`, `lib/monthly-packages.ts`, `lib/project-inquiry-options.ts`, `proxy.ts`
- `supabase/schema.sql`
- Added migrations: `supabase/migrations/20261106000000_manage_monthly_packages.sql`, `20261108000000_dynamic_monthly_package_ids.sql`, `20261108010000_monthly_package_discovery_metadata.sql`, `20261108020000_featured_monthly_packages.sql`, `20261108030000_route_public_requests_through_api.sql`
- Removed `middleware.ts` in favor of `proxy.ts` for the current Next.js proxy convention.
- Removed the 102 MB `public/videos/ffmpeg.exe` from the public asset tree and placed the local tool under ignored `tools/ffmpeg.exe`.
- Added this report: `WEBSITE_AUDIT_REPORT.md`.

Next.js 16.4.5 rewrites the generated guidance block in tracked `AGENTS.md` when the dev server runs; that generated change is retained.

## Remaining unverified/manual work

- Apply and verify the Supabase migrations, server secret, admin claim, live RLS/table grants, and valid write flow described above.
- Run authenticated end-to-end checks for admin dashboard/pricing workflows at desktop and mobile widths.
- Inspect the two Chrome Issues entries and perform a captured Network-panel audit on a clean browser profile.
- Run automated accessibility/contrast checks and a complete keyboard/screen-reader review.
- Run Lighthouse and collect lab metrics on a stable target device/network; compare large video variants before changing media.
- Verify shared rate limiting and trusted proxy IP behavior in the actual deployment environment.
