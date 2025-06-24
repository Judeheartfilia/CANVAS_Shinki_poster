const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const posterWidth = 800;
const posterHeight = 1200;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

const bg = new Image();
bg.src = '/assets/bg-fuji.jpg';

const sakuraImage = new Image();
sakuraImage.src = '/assets/sakura.png';

const koiSrcs = ['/assets/koi1.png', '/assets/koi2.png', '/assets/koi3.png'];
const koiImages: HTMLImageElement[] = [];
let koiImagesLoaded = 0;
for (const src of koiSrcs) {
  const img = new Image();
  img.src = src;
  img.onload = () => koiImagesLoaded++;
  koiImages.push(img);
}

class Petal {
  x: number;
  y: number;
  speed: number;
  drift: number;
  angle: number;
  size: number;
  image: HTMLImageElement;

  constructor(image: HTMLImageElement) {
    this.image = image;
    this.reset();
  }

  reset() {
    this.x = Math.random() * posterWidth;
    this.y = Math.random() * -posterHeight;
    this.speed = 1 + Math.random() * 2;
    this.drift = (Math.random() - 0.5) * 2;
    this.angle = Math.random() * Math.PI * 2;
    this.size = 20 + Math.random() * 20;
  }

  update() {
    this.y += this.speed;
    this.x += this.drift * Math.sin(this.angle);
    this.angle += 0.01;
    if (this.y > posterHeight) this.reset();
  }

  draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
    ctx.save();
    ctx.translate(this.x + offsetX, this.y + offsetY);
    ctx.rotate(this.angle);
    ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

interface Fish {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  image: HTMLImageElement;
  opacity: number;
}

interface FishGroup {
  fish: Fish[];
  direction: number;
  immuneTimer: number;
  collisionCount: number;
  fleeing: boolean;
}

function createFishGroup(offsetX: number, offsetY: number): FishGroup {
  const fishCount = 5 + Math.floor(Math.random() * 3);
  const fish: Fish[] = [];
  const direction = Math.random() < 0.5 ? -1 : 1;
  const baseY = offsetY + 200 + Math.random() * (posterHeight - 400);
  const startX = direction === -1 ? offsetX + posterWidth - 100 : offsetX + 100;

  for (let i = 0; i < fishCount; i++) {
    const size = 40 + Math.random() * 20;
    fish.push({
      x: startX + i * direction * (size + 10),
      y: baseY + (Math.random() - 0.5) * 30,
      vx: 0.5 * direction,
      vy: 0,
      size,
      image: koiImages[Math.floor(Math.random() * koiImages.length)],
      opacity: 1
    });
  }
  return { fish, direction, immuneTimer: 300, collisionCount: 0, fleeing: false };
}

function drawFish(ctx: CanvasRenderingContext2D, f: Fish) {
  ctx.save();
  ctx.globalAlpha = f.opacity;
  ctx.translate(f.x, f.y);
  ctx.scale(f.vx > 0 ? 1 : -1, 1);
  ctx.drawImage(f.image, -f.size / 2, -f.size / 2, f.size, f.size);
  ctx.restore();
  ctx.globalAlpha = 1;
}

function updateFishGroup(group: FishGroup, offsetX: number, offsetY: number) {
  for (const f of group.fish) {
    const wave = Math.sin(Date.now() / 300 + f.x / 50) * 0.3;
    f.y += wave;

    if (group.fleeing) {
      f.vx *= 1.05;
      f.opacity *= 0.95;
    }

    f.x += f.vx;

    // Rebondir sur les bords
    if (!group.fleeing) {
      if (f.x < offsetX + f.size / 2 || f.x > offsetX + posterWidth - f.size / 2) {
        f.vx *= -1;
      }
    }
  }
}

function groupsCollide(g1: FishGroup, g2: FishGroup): boolean {
  for (const f1 of g1.fish) {
    for (const f2 of g2.fish) {
      const dx = f1.x - f2.x;
      const dy = f1.y - f2.y;
      if (Math.hypot(dx, dy) < (f1.size + f2.size) / 2) return true;
    }
  }
  return false;
}

function removeInvisible(groups: FishGroup[]) {
  return groups.filter(g => g.fish.some(f => f.opacity > 0.05));
}

const petals: Petal[] = [];
const PETAL_COUNT = 30;
sakuraImage.onload = () => {
  for (let i = 0; i < PETAL_COUNT; i++) {
    petals.push(new Petal(sakuraImage));
  }
};

let fishGroups: FishGroup[] = [];
let frameCount = 0;

function getOffset() {
  const x = (canvas.width - posterWidth) / 2;
  const y = (canvas.height - posterHeight) / 2;
  return { x, y };
}

function drawSunRays(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, frame: number) {
  const rayCount = 60;
  const maxRadius = 600;
  const originX = centerX + posterWidth / 2;
  const originY = centerY + posterHeight / 4;

  ctx.save();
  ctx.translate(originX, originY);
  ctx.rotate(frame * 0.001);

  for (let i = 0; i < rayCount; i++) {
    const angle = (Math.PI * 2 * i) / rayCount;
    const gradient = ctx.createLinearGradient(0, 0, Math.cos(angle) * maxRadius, Math.sin(angle) * maxRadius);
    gradient.addColorStop(0, 'rgba(255, 189, 91, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 200, 120, 0)');

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * maxRadius, Math.sin(angle) * maxRadius);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3 + Math.random() * 2;
    ctx.stroke();
  }

  const centerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
  centerGradient.addColorStop(0, 'rgba(255, 220, 180, 0.4)');
  centerGradient.addColorStop(1, 'rgba(255, 220, 180, 0)');
  ctx.beginPath();
  ctx.arc(0, 0, 40, 0, Math.PI * 2);
  ctx.fillStyle = centerGradient;
  ctx.fill();
  ctx.restore();
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const { x: offsetX, y: offsetY } = getOffset();
  ctx.drawImage(bg, offsetX, offsetY, posterWidth, posterHeight);
  drawSunRays(ctx, offsetX, offsetY, frameCount);
  ctx.fillStyle = 'rgba(255, 180, 100, 0.26)';
  ctx.fillRect(offsetX, offsetY, posterWidth, posterHeight);

  for (const petal of petals) {
    petal.update();
    petal.draw(ctx, offsetX, offsetY);
  }

  if (koiImagesLoaded === koiSrcs.length) {
    if (fishGroups.length < 2 && frameCount % 60 === 0) {
      fishGroups.push(createFishGroup(offsetX, offsetY));
    }

    if (fishGroups.length === 2) {
      const [g1, g2] = fishGroups;
      if (g1.immuneTimer > 0) g1.immuneTimer--;
      if (g2.immuneTimer > 0) g2.immuneTimer--;

      if (g1.immuneTimer === 0 && g2.immuneTimer === 0 && groupsCollide(g1, g2)) {
        g1.collisionCount++;
        g2.collisionCount++;
        g1.immuneTimer = 300;
        g2.immuneTimer = 300;
      }

      if (g1.collisionCount >= 3) g1.fleeing = true;
      if (g2.collisionCount >= 3) g2.fleeing = true;
    }

    for (const group of fishGroups) {
      updateFishGroup(group, offsetX, offsetY);
      for (const f of group.fish) drawFish(ctx, f);
    }

    fishGroups = removeInvisible(fishGroups);
  }

  frameCount++;
  requestAnimationFrame(animate);
}

bg.onload = () => animate();