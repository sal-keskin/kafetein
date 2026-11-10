# Kafetein

Kafein ve tein hesaplayıcı. Gün içinde içtiğin espresso ve çayın vücudunda ne kadar kafein bıraktığını nokta grafiğiyle gösterir.

Canlı sayfa: https://sal-keskin.github.io/kafetein/

## Kullanım

- **Espresso** veya **Çay** düğmesine dokun; içecek şu anki saate eklenir ve mavi olur.
- Mavi noktayı zaman çizgisinde sürükle ya da `−15` / `+15` ile kaydır. `SİL` içeceği kaldırır.
- **AYARLAR** altında kilo, yarı ömür, uyku saati, bardak başına kafein ve dil bulunur.
- Arayüz Türkçe açılır; sağ üstteki `EN` düğmesi İngilizceye çevirir.
- Kayıtlar yalnızca tarayıcında saklanır ve her sabah 06:00'da sıfırlanır.

## Varsayımlar

| | Varsayılan | Not |
|---|---|---|
| Kişi | 60 kg yetişkin kadın | Ayarlardan değişir |
| Yarı ömür | 5 saat | Sigara içenlerde kısalır, doğum kontrol hapı ve hamilelikte uzar |
| Espresso | 1 fincan, ~30 ml, 63 mg | USDA değeri |
| Çay | 1 ince belli bardak, ~100 ml, 25 mg | Tahmin; deme göre 15–40 mg |
| Günlük sınır | 5,7 mg/kg (60 kg için ~340 mg) | EFSA 2015 |
| Uyku eşiği | ~0,8 mg/kg (60 kg için 50 mg) | Pratik kural, klinik eşik değil |

Model tek bölmeli, birinci derece emilimli bir farmakokinetik eğridir: her içecek yaklaşık 50 dakikada tepe yapar, sonra yarı ömre göre azalır. "Tein" çaydaki kafeinin adıdır; aynı moleküldür ve aynı eğriye eklenir.

Bu bir tahmin aracıdır, tıbbi tavsiye değildir.

## Geliştirme

Derleme adımı yok; `index.html`, `style.css` ve `app.js` doğrudan çalışır.

```sh
python3 -m http.server 8000
```

## Yayın

`main` dalına her gönderimde `.github/workflows/pages.yml` siteyi GitHub Pages'e yükler. Bir kereliğine depo ayarlarında **Settings → Pages → Source: GitHub Actions** seçilmelidir.

---

## English

A caffeine calculator for coffee and Turkish tea, drawn as a dot-matrix chart. The interface opens in Turkish and switches to English with the `EN` button. Defaults assume a 60 kg adult woman, a 5 hour half-life, 63 mg per espresso and 25 mg per ~100 ml glass of tea; all of these can be changed under Settings. It is an estimate, not medical advice.

Font: JetBrains Mono (SIL Open Font License, see `fonts/OFL.txt`).
