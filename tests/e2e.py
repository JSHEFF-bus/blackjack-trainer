# End-to-end check of every calculator in a real browser. Run against a local server:
#   npx next build && npx next start -p 3123   then   python tests/e2e.py

import re, sys
from playwright.sync_api import sync_playwright
B='http://localhost:3123'
ok=fail=0; errors=[]
def check(name, cond, detail=''):
    global ok, fail
    if cond: ok+=1; print(f"  PASS {name}")
    else: fail+=1; print(f"  FAIL {name}  {detail}")
def fill(page, label, val):
    el=page.get_by_label(label, exact=True); el.fill(''); el.type(val); page.wait_for_timeout(80)
def body(page): return page.inner_text('main').lower()
with sync_playwright() as p:
    br=p.chromium.launch()
    pg=br.new_page()
    pg.on('pageerror', lambda e: errors.append(f'{pg.url}: {e}'))
    pg.on('console', lambda m: errors.append(f'{pg.url}: console.{m.type}: {m.text}') if m.type=='error' and '404' not in m.text else None)
    pg.on('response', lambda r: errors.append(f'404 {r.url}') if r.status==404 and '/_vercel/' not in r.url else None)
    # 1 odds converter: -110 -> 52.38%, 1.909, 10/11
    pg.goto(f'{B}/odds-converter'); pg.wait_for_load_state('networkidle')
    t=body(pg); check('odds: -110 implies 52.38%', '52.38%' in t, t[:200])
    check('odds: -110 is 10/11 and 1.909', '10/11' in t and '1.909' in t)
    fill(pg,'Odds','+150'); t=body(pg); check('odds: +150 implies 40.00% and 3/2', '40.00%' in t and '3/2' in t)
    fill(pg,'Probability percent','25'); t=body(pg); check('odds: 25% -> +300 fair', '+300' in t)
    # 2 no-vig: -110/-110 -> 50.0% / 50.0%
    pg.goto(f'{B}/no-vig-calculator'); pg.wait_for_load_state('networkidle')
    fill(pg,'Side A odds','-110'); fill(pg,'Side B odds','-110'); t=body(pg)
    check('no-vig: -110/-110 -> 50.0% / 50.0%', '50.0% / 50.0%' in t, t[:300])
    check('no-vig: margin 4.76%', '4.76%' in t)
    fill(pg,'Side A odds','-400'); fill(pg,'Side B odds','+310'); t=body(pg)
    check('no-vig: -400/+310 Shin = 77.80% (matches Python)', '77.80%' in t, t[:400])
    # 3 EV: +150 at 45% -> +12.50%; kelly 8.3%
    pg.goto(f'{B}/expected-value-calculator'); pg.wait_for_load_state('networkidle')
    t=body(pg); check('EV: +150 at 45% = +12.50%', '+12.50%' in t, t[:300])
    check('EV: break-even 40.0%', '40.0%' in t)
    check('EV: full Kelly 8.3%', '8.3%' in t)
    fill(pg,'Win probability','35'); t=body(pg); check('EV: at 35% = -12.50% and Kelly says do not bet', '-12.50%' in t and 'do not bet' in t)
    # 4 parlay: two -110 legs -> +264
    pg.goto(f'{B}/parlay-calculator'); pg.wait_for_load_state('networkidle')
    fill(pg,'Leg 2 odds','-110'); t=body(pg); check('parlay: -110 x -110 = +264', '+264' in t, t[:400])
    fill(pg,'Leg 3 odds','-110'); t=body(pg); check('parlay: three -110 legs = +596', '+596' in t)
    fill(pg,'Leg 1 win probability','50'); fill(pg,'Leg 2 win probability','50'); fill(pg,'Leg 3 win probability','50')
    t=body(pg); check('parlay: three coin flips at -110 = -13.0% EV', '-13.0%' in t, t[:500])
    # 5 pick'em: 2-pick power 3x -> break-even 57.7%
    pg.goto(f'{B}/pick-em-calculator'); pg.wait_for_load_state('networkidle')
    pg.get_by_role('button', name='2-pick').click(); pg.wait_for_timeout(100)
    t=body(pg); check("pick'em: 2-pick Power 3x break-even 57.7%", '57.7%' in t, t[:400])
    fill(pg,'Pick 1 probability','50'); fill(pg,'Pick 2 probability','50'); t=body(pg)
    check("pick'em: two 50% picks at 3x = -25.0%", '-25.0%' in t)
    # 6 hedge: $50 at +400, hedge at -150 -> stake $150, locks $100
    pg.goto(f'{B}/hedge-calculator'); pg.wait_for_load_state('networkidle')
    t=body(pg); check('hedge: $50 @ +400 vs -150 -> hedge $150.00', '$150.00' in t, t[:400])
    check('hedge: locks in $50.00 either way', 'locks in $50.00 whichever side wins' in t)
    pg.get_by_role('button', name='Arbitrage').click(); pg.wait_for_timeout(100)
    fill(pg,'Side A odds','+105'); fill(pg,'Side B odds','+105'); t=body(pg)
    check('arb: +105/+105 is a 2.50% arbitrage', '+2.50%' in t, t[:300])
    fill(pg,'Side A odds','-110'); fill(pg,'Side B odds','-110'); t=body(pg)
    check('arb: -110/-110 is NOT an arbitrage', 'not an arbitrage' in t)
    # 7 the fixed house-edge page still works
    pg.goto(f'{B}/blackjack-house-edge-calculator'); pg.wait_for_load_state('networkidle')
    check('house edge: still renders its calculator', 'house edge' in body(pg) and '0.40%' in body(pg))
    # 8 mobile width: no horizontal scroll on any tool
    m=br.new_page(viewport={'width':375,'height':800})
    for s in ('odds-converter','no-vig-calculator','expected-value-calculator','parlay-calculator','pick-em-calculator','hedge-calculator','betting-calculators'):
        m.goto(f'{B}/{s}'); m.wait_for_load_state('networkidle')
        sw=m.evaluate('document.documentElement.scrollWidth')
        check(f'mobile 375px no sideways scroll: {s}', sw<=375, f'scrollWidth={sw}')
    br.close()
print(f"\n  {ok} passed, {fail} failed")
print("  browser errors: " + ("none" if not errors else "\n    " + "\n    ".join(errors[:10])))
sys.exit(1 if fail or errors else 0)
