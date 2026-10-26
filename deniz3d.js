// Deniz 3D — Moda Event Club maskotu (Three.js, anime tarzı cel-shading)
// Durumu (konuşuyor / ağız açık / el sallıyor) 2D SVG'deki sınıflardan okur; böylece
// maskotun konuşma kodu değişmeden 3D karakteri de yönetir.
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export function denizBaslat(kap, durumKaynagi, secenek = {}) {
  const W = kap.clientWidth || 140, H = kap.clientHeight || 161;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: !!secenek.goruntuAl });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(W, H);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  kap.appendChild(renderer.domElement);

  const sahne = new THREE.Scene();
  const kamera = new THREE.PerspectiveCamera(30, W / H, 0.1, 50);
  kamera.position.set(0, 1.55, 6.2);
  kamera.lookAt(0, 1.25, 0);

  // Işıklar: yumuşak gün batımı
  sahne.add(new THREE.HemisphereLight(0xfff6ec, 0xf3dccb, 2.1));
  const gunes = new THREE.DirectionalLight(0xffffff, 1.8);
  gunes.position.set(2, 3, 6);
  sahne.add(gunes);

  // Anime gölgelendirme için 3 basamaklı ton haritası (açık tonlar: yüz grileşmesin)
  const tonVeri = new Uint8Array([170, 215, 255]);
  const tonHarita = new THREE.DataTexture(tonVeri, 3, 1, THREE.RedFormat);
  tonHarita.minFilter = tonHarita.magFilter = THREE.NearestFilter;
  tonHarita.needsUpdate = true;
  const toon = (renk, ek = {}) => new THREE.MeshToonMaterial({ color: renk, gradientMap: tonHarita, ...ek });
  const duz = (renk, ek = {}) => new THREE.MeshBasicMaterial({ color: renk, ...ek });
  const cizgiMat = new THREE.MeshBasicMaterial({ color: 0x3a2430, side: THREE.BackSide });

  // Anime dış çizgi: nesnenin biraz büyük, ters yüzlü kopyası
  function cizgili(mesh, kalinlik = 1.045) {
    const c = new THREE.Mesh(mesh.geometry, cizgiMat);
    c.scale.setScalar(kalinlik);
    mesh.add(c);
    return mesh;
  }
  const kure = (r, ws = 32, hs = 24) => new THREE.SphereGeometry(r, ws, hs);

  // Renkler
  const TEN = 0xffe1cc, SAC = 0xf7d36a, SAC_KOYU = 0xe6b84a, LACI = 0x1d3a6e, TURUNCU = 0xe8774a, HASIR = 0xf3d79f;

  // Çizgili bluz dokusu
  const tuval = document.createElement("canvas"); tuval.width = 64; tuval.height = 64;
  const tc = tuval.getContext("2d");
  tc.fillStyle = "#ffffff"; tc.fillRect(0, 0, 64, 64);
  tc.fillStyle = "#1d3a6e"; for (let y = 0; y < 64; y += 16) tc.fillRect(0, y, 64, 6);
  const cizgiDoku = new THREE.CanvasTexture(tuval);
  cizgiDoku.wrapS = cizgiDoku.wrapT = THREE.RepeatWrapping; cizgiDoku.repeat.set(4, 4);
  cizgiDoku.magFilter = THREE.NearestFilter; cizgiDoku.anisotropy = 4;
  cizgiDoku.colorSpace = THREE.SRGBColorSpace;

  const karakter = new THREE.Group();
  sahne.add(karakter);

  // ---------- GÖVDE ----------
  const govde = new THREE.Group(); karakter.add(govde);
  const bluz = cizgili(new THREE.Mesh(new THREE.CapsuleGeometry(0.48, 0.3, 8, 24), toon(0xffffff, { map: cizgiDoku })));
  bluz.position.y = 0.62; bluz.scale.set(1.08, 1, 0.8); govde.add(bluz);
  const yaka = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.06, 10, 32, Math.PI), toon(LACI));
  yaka.position.set(0, 1.0, 0.18); yaka.rotation.set(-0.35, 0, Math.PI); govde.add(yaka);
  const fular = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.32, 4), toon(TURUNCU));
  fular.position.set(0, 0.86, 0.36); fular.rotation.set(-0.25, Math.PI / 4, Math.PI); fular.scale.z = 0.4; govde.add(fular);

  // Kollar (omuzdan dönen gruplar)
  function kolYap(yon) {
    const omuz = new THREE.Group(); omuz.position.set(0.5 * yon, 0.92, 0);
    const kol = cizgili(new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.42, 6, 16), toon(0xffffff, { map: cizgiDoku })));
    kol.position.y = -0.3; omuz.add(kol);
    const el = cizgili(new THREE.Mesh(kure(0.12), toon(TEN)));
    el.position.y = -0.6; omuz.add(el);
    omuz.rotation.z = 0.18 * yon;
    govde.add(omuz);
    return omuz;
  }
  const solKol = kolYap(-1), sagKol = kolYap(1);

  // ---------- KAFA ----------
  const kafa = new THREE.Group(); kafa.position.y = 1.62; karakter.add(kafa);
  const boyun = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.3, 16), toon(0xf8cfb6));
  boyun.position.y = -0.55; kafa.add(boyun);
  const yuz = cizgili(new THREE.Mesh(kure(0.6, 48, 36), toon(TEN)), 1.03);
  yuz.scale.set(1, 0.95, 0.92); kafa.add(yuz);
  // çene hafif sivri: alta küçük küre
  const cene = new THREE.Mesh(kure(0.36), toon(TEN)); cene.position.set(0, -0.25, 0.12); cene.scale.set(1, 0.8, 0.9); kafa.add(cene);

  // Saç (sarı)
  const sacMat = toon(SAC), sacKoyu = toon(SAC_KOYU);
  const arkaSac = cizgili(new THREE.Mesh(kure(0.66, 40, 30), sacMat), 1.025);
  arkaSac.position.set(0, 0.06, -0.08); arkaSac.scale.set(1.03, 1.0, 0.98); kafa.add(arkaSac);
  // uzun arka saç (omuzlara iner)
  const uzunSac = cizgili(new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 0.75, 8, 24), sacMat), 1.03);
  uzunSac.position.set(0, -0.62, -0.32); uzunSac.scale.set(1.15, 1, 0.55); kafa.add(uzunSac);
  // yan tutamlar
  [-1, 1].forEach(yon => {
    const tutam = cizgili(new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.7, 6, 16), sacMat), 1.06);
    tutam.position.set(0.56 * yon, -0.38, 0.14); tutam.rotation.z = -0.12 * yon; kafa.add(tutam);
    const uc = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.22, 16), sacMat);
    uc.position.set(0.6 * yon, -0.86, 0.14); uc.rotation.z = Math.PI; kafa.add(uc);
  });
  // perçem: alın üzerinde sivri tutamlar
  // perçem: alnın üstünde, kısa sivri tutamlar (yüzü kapatmasın)
  const percem = [[-0.4, 0.36, 0.36, 0.55, 0.3], [-0.2, 0.42, 0.45, 0.2, 0.26], [0.02, 0.43, 0.47, -0.05, 0.24], [0.22, 0.42, 0.45, -0.3, 0.26], [0.42, 0.34, 0.34, -0.6, 0.3]];
  percem.forEach(([x, y, z, rz, boy]) => {
    const p = cizgili(new THREE.Mesh(new THREE.ConeGeometry(0.12, boy, 16), sacMat), 1.07);
    p.position.set(x, y, z); p.rotation.set(-0.75, 0, Math.PI + rz); kafa.add(p);
  });
  // alın saç çizgisi: perçemleri kafaya bağlayan yay
  const sacBant = new THREE.Mesh(new THREE.SphereGeometry(0.615, 40, 16, 0, Math.PI * 2, 0, Math.PI * 0.32), sacMat);
  sacBant.scale.set(1, 0.95, 0.94); kafa.add(sacBant);
  const parlak = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.025, 8, 40, Math.PI * 0.5), duz(0xfff4c4));
  parlak.position.set(0, 0.2, 0.42); parlak.rotation.set(-0.45, 0, Math.PI * 0.25); kafa.add(parlak);

  // Gözler: iri anime gözü (beyaz + mavi iris + bebek + parıltılar), kırpmak için grup
  const gozler = [];
  [-1, 1].forEach(yon => {
    const g = new THREE.Group(); g.position.set(0.22 * yon, 0.0, 0.5); g.rotation.y = 0.32 * yon;
    const beyaz = new THREE.Mesh(kure(0.13), duz(0xffffff)); beyaz.scale.set(0.95, 1.25, 0.35); g.add(beyaz);
    const iris = new THREE.Mesh(kure(0.105), duz(0x2f86a8)); iris.position.z = 0.035; iris.scale.set(0.95, 1.2, 0.3); g.add(iris);
    const alt = new THREE.Mesh(kure(0.07), duz(0x7fd6e6)); alt.position.set(0, -0.06, 0.05); alt.scale.set(1, 0.7, 0.3); g.add(alt);
    const bebek = new THREE.Mesh(kure(0.052), duz(0x0d1a33)); bebek.position.z = 0.06; bebek.scale.set(1, 1.25, 0.3); g.add(bebek);
    const p1 = new THREE.Mesh(kure(0.032), duz(0xffffff)); p1.position.set(-0.035, 0.05, 0.08); g.add(p1);
    const p2 = new THREE.Mesh(kure(0.014), duz(0xffffff)); p2.position.set(0.04, -0.05, 0.08); g.add(p2);
    const kirpik = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.018, 6, 20, Math.PI * 0.9), duz(0x3a2430));
    kirpik.position.set(0, 0.03, 0.05); kirpik.rotation.z = Math.PI * 0.05; g.add(kirpik);
    kafa.add(g); gozler.push(g);
    const kas = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 6, 16, Math.PI * 0.7), duz(0xb98a3a));
    kas.position.set(0.22 * yon, 0.22, 0.5); kas.rotation.set(0, 0.3 * yon, Math.PI * 0.15); kafa.add(kas);
    const al = new THREE.Mesh(new THREE.CircleGeometry(0.08, 24), duz(0xff8fa3, { transparent: true, opacity: 0.45 }));
    al.position.set(0.33 * yon, -0.17, 0.48); al.rotation.y = 0.55 * yon; al.scale.y = 0.55; kafa.add(al);
  });

  // Ağız: kapalı gülümseme + açık ağız
  const agizKapali = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 6, 16, Math.PI), duz(0xb5485a));
  agizKapali.position.set(0, -0.24, 0.545); agizKapali.rotation.z = Math.PI; kafa.add(agizKapali);
  const agizAcik = new THREE.Mesh(kure(0.065), duz(0x8f2438));
  agizAcik.position.set(0, -0.25, 0.54); agizAcik.scale.set(1, 0.8, 0.3); agizAcik.visible = false; kafa.add(agizAcik);

  // Hasır şapka
  const sapka = new THREE.Group(); sapka.position.set(0, 0.5, -0.02); sapka.rotation.x = -0.12; kafa.add(sapka);
  const kenar = cizgili(new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.08, 0.05, 48), toon(HASIR)), 1.02);
  sapka.add(kenar);
  const tepe = cizgili(new THREE.Mesh(new THREE.SphereGeometry(0.58, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), toon(0xf0cc8a)), 1.03);
  tepe.scale.y = 0.75; sapka.add(tepe);
  const kurdele = new THREE.Mesh(new THREE.CylinderGeometry(0.59, 0.59, 0.12, 40, 1, true), toon(TURUNCU, { side: THREE.DoubleSide }));
  kurdele.position.y = 0.07; sapka.add(kurdele);
  const cicek = new THREE.Group(); cicek.position.set(0.42, 0.1, 0.4); sapka.add(cicek);
  for (let i = 0; i < 6; i++) {
    const yap = new THREE.Mesh(kure(0.05), duz(0xffffff)); yap.scale.set(1, 0.5, 0.4);
    yap.position.set(Math.cos(i / 6 * Math.PI * 2) * 0.06, Math.sin(i / 6 * Math.PI * 2) * 0.06, 0); yap.rotation.z = i / 6 * Math.PI * 2;
    cicek.add(yap);
  }
  const gobek = new THREE.Mesh(kure(0.035), duz(0xf8b13c)); gobek.position.z = 0.02; cicek.add(gobek);

  karakter.position.y = -0.1;

  // ---------- ANİMASYON ----------
  const fare = { x: 0, y: 0 };
  if (secenek.fareTakip !== false) {
    window.addEventListener("pointermove", e => {
      const r = kap.getBoundingClientRect();
      fare.x = THREE.MathUtils.clamp((e.clientX - (r.left + r.width / 2)) / 600, -1, 1);
      fare.y = THREE.MathUtils.clamp((e.clientY - (r.top + r.height / 3)) / 600, -1, 1);
    }, { passive: true });
  }
  const azHareket = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saat = new THREE.Clock();
  let sonrakiKirpma = 2.5, kirpmaBas = -1, sallaBas = -1, gorunur = true, calisiyor = true;

  function cerceve() {
    if (!calisiyor) return;
    requestAnimationFrame(cerceve);
    if (!gorunur || document.hidden) return;
    const t = saat.getElapsedTime();
    const sinif = durumKaynagi ? durumKaynagi.classList : { contains: () => false };

    // Nefes ve süzülme
    if (!azHareket) {
      karakter.position.y = -0.1 + Math.sin(t * 1.8) * 0.04;
      govde.scale.y = 1 + Math.sin(t * 1.8) * 0.012;
    }
    // Baş ve gözler fareyi takip eder; konuşurken hafif sallanır
    const konus = sinif.contains("konusuyor");
    const hedefY = fare.x * 0.45 + (konus ? Math.sin(t * 3.2) * 0.08 : 0);
    const hedefX = fare.y * 0.25 + (konus ? Math.sin(t * 4.1) * 0.04 : 0);
    kafa.rotation.y += (hedefY - kafa.rotation.y) * 0.08;
    kafa.rotation.x += (hedefX - kafa.rotation.x) * 0.08;
    kafa.rotation.z += ((konus ? Math.sin(t * 2.6) * 0.05 : Math.sin(t * 0.9) * 0.02) - kafa.rotation.z) * 0.1;
    govde.rotation.y = kafa.rotation.y * 0.25;

    // Göz kırpma
    if (t > sonrakiKirpma && kirpmaBas < 0) { kirpmaBas = t; sonrakiKirpma = t + 2.5 + Math.random() * 3; }
    let kapak = 1;
    if (kirpmaBas >= 0) {
      const k = (t - kirpmaBas) / 0.16;
      kapak = k < 1 ? 1 - Math.sin(k * Math.PI) * 0.92 : 1;
      if (k >= 1) kirpmaBas = -1;
    }
    gozler.forEach(g => { g.scale.y = kapak; });

    // Ağız
    const acik = sinif.contains("agiz-acik");
    agizAcik.visible = acik; agizKapali.visible = !acik;
    if (acik) agizAcik.scale.y = 0.6 + Math.random() * 0.5;

    // El sallama
    if (sinif.contains("el-salla") && sallaBas < 0) sallaBas = t;
    if (!sinif.contains("el-salla")) sallaBas = -1;
    const sallaHedef = sallaBas >= 0 ? 2.5 + Math.sin((t - sallaBas) * 11) * 0.35 : 0.18;
    sagKol.rotation.z += (sallaHedef - sagKol.rotation.z) * 0.18;
    solKol.rotation.z = -0.18 + (azHareket ? 0 : Math.sin(t * 1.8) * 0.03);

    renderer.render(sahne, kamera);
  }
  cerceve();

  // Kutunun boyutu değişirse (telefon/bilgisayar) çizim alanını uydur
  if ("ResizeObserver" in window) {
    new ResizeObserver(() => {
      const w = kap.clientWidth, h = kap.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h); kamera.aspect = w / h; kamera.updateProjectionMatrix();
    }).observe(kap);
  }

  // Ekranda değilken çizmeyi durdur (pil dostu)
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(g => { gorunur = g[0].isIntersecting; }).observe(kap);
  }
  return { durdur: () => { calisiyor = false; renderer.dispose(); }, renderer };
}
