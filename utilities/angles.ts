type Point = [number, number];
type Angle = { x: number, y: number };

export const calculateAngle2D = (pointA: Angle, pointB: Angle, pointC: Angle): number => {

  if (!pointA || !pointB || !pointC ||
    pointA.x === undefined || pointA.y === undefined ||
    pointB.x === undefined || pointB.y === undefined ||
    pointC.x === undefined || pointC.y === undefined) {
    return 0;
  }

  // Calculate the vectors
  const vectorAB = {
    x: pointB.x - pointA.x,
    y: pointB.y - pointA.y
  };

  const vectorBC = {
    x: pointC.x - pointB.x,
    y: pointC.y - pointB.y
  };

  // Calculate the dot product of the vectors
  const dotProduct = vectorAB.x * vectorBC.x + vectorAB.y * vectorBC.y;

  // Calculate the magnitudes of the vectors
  const magnitudeAB = Math.sqrt(vectorAB.x * vectorAB.x + vectorAB.y * vectorAB.y);
  const magnitudeBC = Math.sqrt(vectorBC.x * vectorBC.x + vectorBC.y * vectorBC.y);

  // Calculate the angle in radians
  const angleRadians = Math.acos(dotProduct / (magnitudeAB * magnitudeBC));

  // Convert the angle to degrees
  const angleDegrees = angleRadians * (180 / Math.PI);

  return parseFloat(angleDegrees.toFixed(0));
}

export const calculateAngle3D = (pointA: { x: number, y: number, z: number }, pointB: { x: number, y: number, z: number }, pointC: { x: number, y: number, z: number }): number => {

  if (!pointA || !pointB || !pointC ||
    pointA.x === undefined || pointA.y === undefined || pointA.z === undefined ||
    pointB.x === undefined || pointB.y === undefined || pointB.z === undefined ||
    pointC.x === undefined || pointC.y === undefined || pointC.z === undefined) {
    return 0;
  }

  // Calculate the vectors
  const vectorAB = {
    x: pointB.x - pointA.x,
    y: pointB.y - pointA.y,
    z: pointB.z - pointA.z
  };

  const vectorBC = {
    x: pointC.x - pointB.x,
    y: pointC.y - pointB.y,
    z: pointC.z - pointB.z
  };

  // Calculate the dot product of the vectors
  const dotProduct = vectorAB.x * vectorBC.x + vectorAB.y * vectorBC.y + vectorAB.z * vectorBC.z;

  // Calculate the magnitudes of the vectors
  const magnitudeAB = Math.sqrt(vectorAB.x * vectorAB.x + vectorAB.y * vectorAB.y + vectorAB.z * vectorAB.z);
  const magnitudeBC = Math.sqrt(vectorBC.x * vectorBC.x + vectorBC.y * vectorBC.y + vectorBC.z * vectorBC.z);

  // Calculate the angle in radians
  const angleRadians = Math.acos(dotProduct / (magnitudeAB * magnitudeBC));

  // Convert the angle to degrees
  const angleDegrees = angleRadians * (180 / Math.PI);

  return parseFloat(angleDegrees.toFixed(0));
}

export const angleOfSingleLine = (point1: Point, point2: Point): number => {
  // Calculate angle of a single line
  const xDiff = point2[0] - point1[0];
  const yDiff = point2[1] - point1[1];
  const result = Math.atan2(yDiff, xDiff) * 180 / Math.PI;
  return parseFloat(result.toFixed(0));
}

export const euclideanDistance = (point1: Angle, point2: Angle): number => {
  // Euclidean distance between two points point1, point2
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  const result = Math.sqrt(dx * dx + dy * dy);
  return result;
}

export const pointPosition = (point: Point, linePt1: Point, linePt2: Point): 'left' | 'right' => {
  // Left or Right position of the point from a line
  const value = (linePt2[0] - linePt1[0]) * (point[1] - linePt1[1]) -
    (linePt2[1] - linePt1[1]) * (point[0] - linePt1[0]);

  return value >= 0 ? 'left' : 'right';
}
