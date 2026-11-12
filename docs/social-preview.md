# Social preview verification

**Hosted status: NOT VERIFIED.** No real Cloudflare Pages preview URL was supplied for PF-004. A successful local build or static verifier does not prove that a social platform can fetch the site or image.

## Before checking a platform

Use a public, HTTPS preview origin that does not require sign-in. Set `SITE_URL` to that exact origin before building the preview so the generated Open Graph and Twitter URLs point to the preview itself. Then build and inspect both localized routes:

```powershell
$env:SITE_URL = "https://<actual-pages-preview-origin>"
npm run build
npm run verify:output

curl.exe -I "$env:SITE_URL/en/"
curl.exe -I "$env:SITE_URL/pl/"
curl.exe -I "$env:SITE_URL/assets/og/portfolio-cover.png"
```

The pages and PNG should return `200`; the image response should be `image/png`. The preview source should contain one localized `og:title`, `og:description`, `og:url`, and `og:image`, plus matching Twitter card fields. Without `SITE_URL`, the pages are marked `noindex` and absolute social image/URL tags are intentionally omitted.

## LinkedIn

Enter each public locale URL in [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) and confirm the title, description, and cover image. If the URL was shared earlier, request a refresh and inspect a new draft; LinkedIn notes that refreshed preview data applies to new posts, while existing posts retain their prior preview ([LinkedIn Help](https://www.linkedin.com/help/linkedin/answer/a6269011)).

## X

The owner does not have an X account, so X's post-draft preview is **NOT VERIFIED** and is not a required owner check. Twitter card tags are emitted only when `SITE_URL` is configured, for consumers that support them. Do not claim an X preview was tested. X's help describes posting links but does not provide evidence that a local build or third-party preview guarantees the rendered card ([X Help](https://help.x.com/en/using-x/how-to-post-a-link)).

Record the exact preview origin, check date, locale, and observed title/image only after these hosted checks have actually run. Do not describe the preview as verified before then.
