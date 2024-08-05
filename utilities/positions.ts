import { is, to } from '@utilities/tools';
import { angleOfSingleLine } from '@utilities/angles';

export type Position = 'right' | 'left' | '';

export const drawLineEyeShoulder = (earPosition: any, shoulderPosition: any, canvas: any, ctx: any, fixNumber: number): number => {
  const earX = to.number(earPosition?.x) * canvas.width;
  const earY = to.number(earPosition?.y) * canvas.height;
  const shoulderX = to.number(shoulderPosition?.x) * canvas.width;
  const shoulderY = to.number(shoulderPosition?.y) * canvas.height
  if (earX > 0 && earY > 0 && shoulderX > 0 && shoulderY > 0) {
    let singleAngle = angleOfSingleLine([earX, earY], [shoulderX, shoulderY]) + fixNumber;
    if (singleAngle < 0) singleAngle = singleAngle * -1;
    ctx.fillText(`${singleAngle}º`, 15 + ((earX + shoulderX) / 2), (earY + shoulderY) / 2);
    ctx.beginPath();
    ctx.moveTo(earX, earY);
    ctx.lineTo(shoulderX, shoulderY);
    ctx.stroke();
    return singleAngle;
  }
  return 0;
}

export const detectHandSide = (handLandmarks: any, poseLandmarks: any): Position => {
  if (!handLandmarks || !poseLandmarks || handLandmarks.length === 0 || poseLandmarks.length === 0) {
    return '';
  }

  const leftShoulder = poseLandmarks[0][11];
  const rightShoulder = poseLandmarks[0][12];
  const handWrist = handLandmarks[0]; // Wrist landmark

  // Compare x-coordinate of hand wrist to the midpoint of shoulders
  const shoulderMidpointX = (leftShoulder.x + rightShoulder.x) / 2;
  return handWrist.x < shoulderMidpointX ? 'right' : 'left';
};

export const detectFacePosition = (faceLandmarks: any): Position => {
  if (is.array(faceLandmarks)) {
    const noseTip = faceLandmarks?.[2];
    if (is.object(noseTip)) {
      const threshold = 0.03; // Adjust this value to change the sensitivity
      if (noseTip.x < 0.5 - threshold) {
        return 'right';
      } else if (noseTip.x > 0.5 + threshold) {
        return 'left';
      }
    }
  }
  return '';
};
