export function getRandomFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// get random int between min and max
export function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}