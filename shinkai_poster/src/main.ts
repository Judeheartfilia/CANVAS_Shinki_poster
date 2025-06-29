const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const posterWidth = 800;
const posterHeight = 1200;

function getScale() {
  const scaleX = canvas.width / posterWidth;
  const scaleY = canvas.height / posterHeight;
  return Math.min(scaleX, scaleY); // pour contenir l'affiche dans l'écran
}

function getOffset(scale: number) {
  const x = (canvas.width - posterWidth * scale) / 2;
  const y = (canvas.height - posterHeight * scale) / 2;
  return { x, y };
}

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

const bg = new Image();
bg.src = '/assets/bg-fuji.jpg';

const sakuraImage = new Image();
sakuraImage.src = '/assets/sakura.png';

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

  draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number, scale: number) {
    ctx.save();
    ctx.translate(offsetX + this.x * scale, offsetY + this.y * scale);
    ctx.rotate(this.angle);
    ctx.drawImage(this.image, -this.size / 2 * scale, -this.size / 2 * scale, this.size * scale, this.size * scale);
    ctx.restore();
  }
}

function drawSunRays(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number, frame: number, scale: number) {
  const rayCount = 60;
  const maxRadius = 300 * scale;
  const originX = offsetX + (posterWidth / 2) * scale;
  const originY = offsetY + (posterHeight / 4) * scale;

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
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  const centerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 40 * scale);
  centerGradient.addColorStop(0, 'rgba(255, 220, 180, 0.4)');
  centerGradient.addColorStop(1, 'rgba(255, 220, 180, 0)');
  ctx.beginPath();
  ctx.arc(0, 0, 40 * scale, 0, Math.PI * 2);
  ctx.fillStyle = centerGradient;
  ctx.fill();

  ctx.restore();
}

const petals: Petal[] = [];
const PETAL_COUNT = 30;
sakuraImage.onload = () => {
  for (let i = 0; i < PETAL_COUNT; i++) {
    petals.push(new Petal(sakuraImage));
  }
};

const branchImages = ['/assets/branche.png', '/assets/branche2.png', '/assets/branche3.png'];
const branches: { img: HTMLImageElement; x: number; y: number; width: number; height: number; angle: number; targetAngle: number; hovering: boolean; }[] = [];

const branchSound = new Audio('/assets/branche-touch.mp3');

branchImages.forEach((src) => {
  const img = new Image();
  img.src = src;
  img.onload = () => {
    const width = 100;
    const height = 100;
    branches.push({
      img,
      x: 0,
      y: 0,
      width,
      height,
      angle: 0,
      targetAngle: 0,
      hovering: false,
    });
  };
});

canvas.addEventListener('mousemove', (e) => {
  const scale = getScale();
  const { x: offsetX, y: offsetY } = getOffset(scale);
  const mouseX = (e.clientX - offsetX) / scale;
  const mouseY = (e.clientY - offsetY) / scale;

  for (const branch of branches) {
    const dx = mouseX - (branch.x + branch.width / 2);
    const dy = mouseY - (branch.y + branch.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);

    const isHovering = dist < branch.width / 1.5;

    if (isHovering && !branch.hovering) {
      branchSound.currentTime = 0;
      branchSound.play();
    }

    branch.hovering = isHovering;

    if (isHovering) {
      branch.targetAngle = dx * 0.005;
    } else {
      branch.targetAngle = 0;
    }
  }
});

function drawBranches(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number, scale: number) {
  const spacing = 20;
  const totalWidth = branches.reduce((sum, b) => sum + b.width, 0) + spacing * (branches.length - 1);
  const startX = (posterWidth - totalWidth) / 2;

  for (let i = 0; i < branches.length; i++) {
    const branch = branches[i];
    if (!branch.img.complete) continue;

    branch.x = startX + i * (branch.width + spacing);
    branch.y = 0;

    branch.angle += (branch.targetAngle - branch.angle) * 0.1;

    ctx.save();
    ctx.translate(offsetX + branch.x * scale + (branch.width / 2) * scale, offsetY + branch.y * scale + (branch.height / 2) * scale);
    ctx.rotate(branch.angle);
    ctx.drawImage(branch.img, -branch.width / 2 * scale, -branch.height / 2 * scale, branch.width * scale, branch.height * scale);
    ctx.restore();
  }
}

let frameCount = 0;

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const scale = getScale();
  const { x: offsetX, y: offsetY } = getOffset(scale);

  // Dessiner l'affiche avec scale
  ctx.drawImage(bg, offsetX, offsetY, posterWidth * scale, posterHeight * scale);

  // Dessiner les branches en haut
  drawBranches(ctx, offsetX, offsetY, scale);

  // Soleil fixé à l’affiche
  drawSunRays(ctx, offsetX, offsetY, frameCount, scale);

  // Teinte
  ctx.fillStyle = 'rgba(255, 180, 100, 0.4)';
  ctx.fillRect(offsetX, offsetY, posterWidth * scale, posterHeight * scale);

  // Pétales tombant sur l'affiche
  for (const petal of petals) {
    petal.update();
    petal.draw(ctx, offsetX, offsetY, scale);
  }

  frameCount++;
  requestAnimationFrame(animate);
}

bg.onload = () => animate();
