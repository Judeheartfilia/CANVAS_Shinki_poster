const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const posterWidth = 800;
const posterHeight = 1200;

function getScale() {
  const scaleX = canvas.width / posterWidth;
  const scaleY = canvas.height / posterHeight;
  return Math.min(scaleX, scaleY);
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

const branchImage1 = new Image();
branchImage1.src = '/assets/branche.png';
const branchImage2 = new Image();
branchImage2.src = '/assets/branche2.png';
const branchImage3 = new Image();
branchImage3.src = '/assets/branche3.PNG';

const branchSound = new Audio('/assets/branch-sound.mp3');

let prevMouseX = 0;

class Branch {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number = 0;
  targetRotation: number = 0;
  image: HTMLImageElement;
  soundPlayed = false;

  constructor(x: number, y: number, image: HTMLImageElement) {
    this.x = x;
    this.y = y;
    this.image = image;
    this.width = 300;
    this.height = 300;
  }

  update() {
    this.rotation += (this.targetRotation - this.rotation) * 0.1;
  }

  draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number, scale: number) {
    ctx.save();
    ctx.translate(offsetX + this.x * scale, offsetY + this.y * scale);
    ctx.rotate(this.rotation);
    ctx.drawImage(
      this.image,
      -this.width / 2 * scale,
      -this.height / 2 * scale,
      this.width * scale,
      this.height * scale
    );
    ctx.restore();
  }
}

const branches: Branch[] = [
  new Branch(200, 100, branchImage1),
  new Branch(400, 100, branchImage2),
  new Branch(600, 100, branchImage3),
];

window.addEventListener('mousemove', (e) => {
  const direction = e.clientX > prevMouseX ? 1 : -1;
  prevMouseX = e.clientX;

  const scale = getScale();
  const { x: offsetX, y: offsetY } = getOffset(scale);
  const mx = (e.clientX - offsetX) / scale;
  const my = (e.clientY - offsetY) / scale;

  for (const b of branches) {
    if (
      mx >= b.x - b.width / 2 &&
      mx <= b.x + b.width / 2 &&
      my >= b.y - b.height / 2 &&
      my <= b.y + b.height / 2
    ) {
      b.targetRotation = 0.3 * direction;
      if (!b.soundPlayed) {
        branchSound.currentTime = 0;
        branchSound.play();
        b.soundPlayed = true;
      }
    } else {
      b.targetRotation = 0;
      b.soundPlayed = false;
    }
  }
});

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

let frameCount = 0;

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const scale = getScale();
  const { x: offsetX, y: offsetY } = getOffset(scale);

  ctx.drawImage(bg, offsetX, offsetY, posterWidth * scale, posterHeight * scale);

  drawSunRays(ctx, offsetX, offsetY, frameCount, scale);

  ctx.fillStyle = 'rgba(255, 180, 100, 0.4)';
  ctx.fillRect(offsetX, offsetY, posterWidth * scale, posterHeight * scale);

  for (const petal of petals) {
    petal.update();
    petal.draw(ctx, offsetX, offsetY, scale);
  }

  for (const b of branches) {
    b.update();
    b.draw(ctx, offsetX, offsetY, scale);
  }

  frameCount++;
  requestAnimationFrame(animate);
}

bg.onload = () => animate();
