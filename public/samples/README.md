# Ukázková CSV (TrueLife FitScale)

Importuj ručně do profilu (doporučení: výška **175 cm**, věk ~54 — sedí s dopočty BMI/BMR).
Ideální křivka v aplikaci míří na **BMI 22** (~67,4 kg při 175 cm).

## demo-radical-110-to-70.csv

- **Start:** 110 kg → **konec:** ~70 kg za 1 rok (týdenní měření)
- **Příběh:** velmi rychlý úbytek (~110→78 za ~16 týdnů), pak dojezd k 70 kg
- **K čemu:** proti šedé ideální křivce má vypadat **moc radikální tempo** (tooFast)

## demo-volatile-110-to-125.csv

- **Start:** 110 kg → **konec:** ~125 kg za 1 rok
- **Příběh:**
  1. první ~3 měsíce ubytek (~110→98)
  2. další ~3 měsíce přibrání (~98→112)
  3. ostrý úbytek ~20 kg za ~3 měsíce (~112→92)
  4. závěr roku rebound nahoru ke ~125 kg
- **K čemu:** kolísání a finální nárůst vs. klesající ideál — hubnutí **nefunguje / tooSlow**, občas i krátký tooFast úsek

## Regenerace

```bash
node scripts/generate-demo-csvs.mjs
```
