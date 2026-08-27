from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    errors = []
    page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
    page.on("pageerror", lambda err: errors.append(str(err)))
    page.goto("http://127.0.0.1:4173", wait_until="networkidle")

    assert page.locator("#coffee-g").inner_text() == "32"
    assert page.locator("#water-ml").inner_text() == "480"
    page.get_by_role("button", name="French Press").click()
    assert page.locator("#coffee-g").inner_text() == "40"
    page.get_by_role("button", name="Coffee on hand").click()
    page.locator("#quantity").fill("30")
    assert page.locator("#water-ml").inner_text() == "360"
    assert page.locator("#water-oz").inner_text() == "12.2 fl oz"
    page.locator("#quantity").fill("0")
    assert page.locator("#input-error").inner_text() != ""
    assert page.locator("#quantity").get_attribute("aria-invalid") == "true"
    page.locator("#quantity").fill("0.09")
    assert page.locator("#quantity").get_attribute("aria-invalid") == "true"
    page.locator("#quantity").fill("30")
    page.locator("#quantity").press("Enter")
    assert page.url.endswith("/")
    page.locator("#strength").fill("2")
    assert page.locator("#strength-output").inner_text() == "Strong"
    assert page.locator("#water-ml").inner_text() == "300"
    page.reload(wait_until="networkidle")
    assert page.get_by_role("button", name="French Press").get_attribute("aria-pressed") == "true"
    assert page.get_by_role("button", name="Coffee on hand").get_attribute("aria-pressed") == "true"
    for width in (320, 375, 390, 760, 768, 1024, 1440):
        page.set_viewport_size({"width": width, "height": 812})
        assert page.locator("body").evaluate("el => el.scrollWidth <= innerWidth"), width
    page.set_viewport_size({"width": 375, "height": 812})
    page.screenshot(path="browser-check-mobile.png", full_page=True)
    assert not errors, errors
    page.evaluate("localStorage.setItem('first-pour-preferences-v1', '{}')")
    page.reload(wait_until="networkidle")
    assert "damaged" in page.locator("#system-message").inner_text()
    page.get_by_role("button", name="Drip Machine").click()
    assert page.locator("#system-message").is_hidden()
    browser.close()
    print("Browser checks passed: calculations, validation, persistence, mobile overflow, console")
