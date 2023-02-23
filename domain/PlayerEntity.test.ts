import { PlayerEntity } from "./PlayerEntity";

Object.defineProperty(globalThis, "DOMPoint", {
  writable: true,
  enumerable: true,
  value: jest.fn().mockImplementation((x?: number, y?: number, z?: number, w?: number) => {
      return {
          x: x ?? 0,
          y: y ?? 0,
          z: z ?? 0,
          w: w ?? 0,
          matrixTransform: jest.fn(),
          toJSON: jest.fn(),
      };
  }),
});

test('PlayerEntity defines', () => {
  const player = new PlayerEntity();

  expect(player).toBeDefined();
  expect(player.speed).toBeInstanceOf(DOMPoint);
  expect(player.update).toBeDefined();
});

test('PlayerEntity updates its speed correctly', () => {
  const player = new PlayerEntity();
  const engine = { keyboard: { pressed: new Set(), released: new Set() } };

  // Check no change with empty input
  let speedBefore = JSON.stringify(player.speed);
  player.update(0, engine);
  let speedAfter = JSON.stringify(player.speed);
  expect(speedBefore).toEqual(speedAfter);

  // W+Shift
  engine.keyboard.pressed.add('w');
  engine.keyboard.pressed.add('Shift');
  speedBefore = JSON.stringify(player.speed);
  player.update(0, engine);
  speedAfter = JSON.stringify(player.speed);
  expect(speedAfter).not.toEqual(speedBefore);
  expect(player.speed.x).toBe(-PLAYER.SPEED * PLAYER.ACCELERATION);
  expect(player.speed.y).toBe(-PLAYER.SPEED * PLAYER.ACCELERATION);

  // W+S+A+D
  engine.keyboard.released.add('w');
  engine.keyboard.pressed.add('s');
  engine.keyboard.pressed.add('a');
  engine.keyboard.pressed.add('d');
  speedBefore = JSON.stringify(player.speed);
  player.update(0, engine);
  speedAfter = JSON.stringify(player.speed);
  expect(speedAfter).not.toEqual(speedBefore);
  expect(player.speed.x).toBe(0);
  expect(player.speed.y).toBe(PLAYER.SPEED);

  // Shift+W+S+A+D
  engine.keyboard.pressed.add('Shift');
  speedBefore = JSON.stringify(player.speed);
  player.update(0, engine);
  speedAfter = JSON.stringify(player.speed);
  expect(speedAfter).not.toEqual(speedBefore);
  expect(player.speed.x).toBe(-PLAYER.SPEED * PLAYER.ACCELERATION);
  expect(player.speed.y).toBe(PLAYER.SPEED * PLAYER.ACCELERATION);
});