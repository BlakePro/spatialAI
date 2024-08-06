import { get } from '@utilities/tools';
import { calculateAngle2D } from '@utilities/angles';

export const takePicture = (videoRef: any, canvasRef: any): string => {
  const video = videoRef?.current;
  const canvas: any = canvasRef.current;
  let { width, height } = canvas.getBoundingClientRect();
  width = width / 2;
  height = height / 2;
  const ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(video, 0, 0, width, height);
  return canvas.toDataURL('image/png', 1);
}


export const drawLandmarks = (canvasRef: any, poseLandmarksArray: any, handLandmarksArray: any) => { //faceLandmarksArray: any,

  //let bicepCurlCount = 0;
  //let isCurlingUp = false;

  const canvas: any = canvasRef.current;
  const { width, height } = canvas.getBoundingClientRect();
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);

  ctx.font = "32px serif";
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;

  const angleMode = get.value.get('angleMode');
  const lineMode = get.value.get('lineMode');

  // Hands
  /*
  if (is.array(handLandmarksArray)) {
    handLandmarksArray.forEach((landmarks: any) => {

      // Draw landmarks
      landmarks.forEach((landmark: any, index: number) => {
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;
        //ctx.beginPath();
        //ctx.arc(x, y, 2, 0, 2 * Math.PI); // Draw a circle for each landmark
        //ctx.stroke();

        if (index == 8) {
          let xPos = to.truncate(x, 1);
          let yPos = to.truncate(y, 1);
          ctx.fillText(`x: ${xPos} --- y: ${yPos}`, x, y);
        } //else ctx.fillText(index, x, y);
      });
    });
  }
  */

  const posePersonLandmarks = poseLandmarksArray?.[0];

  const noise = posePersonLandmarks?.[0]; // nariz

  const leftWrist = posePersonLandmarks?.[15]; // muñeca
  const rightWrist = posePersonLandmarks?.[16];

  const leftElbow = posePersonLandmarks?.[13]; // codo
  const rightElbow = posePersonLandmarks?.[14];

  const leftShoulder = posePersonLandmarks?.[11]; // hombro
  const rightShoulder = posePersonLandmarks?.[12];

  const leftHip = posePersonLandmarks?.[23]; // cadera
  const rightHip = posePersonLandmarks?.[24];
  /*
    const leftKnee = posePersonLandmarks?.[25]; // rodilla
    const rightKnee = posePersonLandmarks?.[26];
  
    const leftHell = posePersonLandmarks?.[29]; // tobillo
    const rightHell = posePersonLandmarks?.[30];
  
    const leftToe = posePersonLandmarks?.[31]; // pie
    const rightToe = posePersonLandmarks?.[32];
  */
  const middleShoulder = {
    x: (leftShoulder?.x + rightShoulder?.x) / 2,
    y: (leftShoulder?.x + rightShoulder?.y) / 2,
    z: (leftShoulder?.z + rightShoulder?.z) / 2
  };

  let leftAngleBicep = calculateAngle2D(leftShoulder, leftElbow, leftWrist);
  let leftAngleShoulder = calculateAngle2D(leftWrist, leftShoulder, leftHip);
  leftAngleShoulder = 180 - leftAngleShoulder;
  let leftAngleShoulderElbow = calculateAngle2D(leftShoulder, leftElbow, leftWrist);
  leftAngleShoulderElbow = 180 - leftAngleShoulderElbow;

  let rightAngleBicep = calculateAngle2D(rightShoulder, rightElbow, rightWrist);
  let rightAngleShoulder = calculateAngle2D(rightWrist, rightShoulder, rightHip);
  rightAngleShoulder = 180 - rightAngleShoulder;
  let rightAngleShoulderElbow = calculateAngle2D(rightShoulder, rightElbow, rightWrist);
  rightAngleShoulderElbow = 180 - rightAngleShoulderElbow;


  if (lineMode == '1') {
    // ----------------------------  LEFT SIDE ----------------------------

    ctx.beginPath();
    ctx.moveTo(leftHip?.x * canvas.width, leftHip?.y * canvas.height);
    ctx.lineTo(leftShoulder?.x * canvas.width, leftShoulder?.y * canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(leftWrist?.x * canvas.width, leftWrist?.y * canvas.height);
    ctx.lineTo(leftHip?.x * canvas.width, leftHip?.y * canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(leftWrist?.x * canvas.width, leftWrist?.y * canvas.height);
    ctx.lineTo(leftShoulder?.x * canvas.width, leftShoulder?.y * canvas.height);
    ctx.stroke();

    // ----------------------------  RIGHT SIDE ----------------------------

    ctx.beginPath();
    ctx.moveTo(rightHip?.x * canvas.width, rightHip?.y * canvas.height);
    ctx.lineTo(rightShoulder?.x * canvas.width, rightShoulder?.y * canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rightWrist?.x * canvas.width, rightWrist?.y * canvas.height);
    ctx.lineTo(rightHip?.x * canvas.width, rightHip?.y * canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rightWrist?.x * canvas.width, rightWrist?.y * canvas.height);
    ctx.lineTo(rightShoulder?.x * canvas.width, rightShoulder?.y * canvas.height);
    ctx.stroke();

    // ----------------------------  BOTH SIDE ----------------------------

    ctx.beginPath();
    ctx.moveTo(leftShoulder?.x * canvas.width, leftShoulder?.y * canvas.height);
    ctx.lineTo(rightShoulder?.x * canvas.width, rightShoulder?.y * canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(noise?.x * canvas.width, noise?.y * canvas.height);
    ctx.lineTo(
      middleShoulder?.x * canvas.width,
      middleShoulder?.y * canvas.height
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(middleShoulder?.x * canvas.width, middleShoulder?.y * canvas.height);
    ctx.lineTo(
      leftShoulder?.x * canvas.width,
      leftShoulder?.y * canvas.height
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(middleShoulder?.x * canvas.width, middleShoulder?.y * canvas.height);
    ctx.lineTo(
      rightShoulder?.x * canvas.width,
      rightShoulder?.y * canvas.height
    );
    ctx.stroke();
  }

  if (angleMode == '1') {

    // ----------------------------  LEFT SIDE ----------------------------

    ctx.fillText(`💪 ${leftAngleBicep}º`,
      (leftElbow?.x * canvas.width),
      40 + (leftElbow?.y * canvas.height)
    );

    ctx.fillText(`${leftAngleShoulder}º`,
      ((leftWrist?.x + leftHip?.x) / 2) * canvas.width,
      ((leftWrist?.y + leftHip?.y) / 2) * canvas.height
    );

    ctx.fillText(`${leftAngleShoulderElbow}º`,
      ((leftWrist?.x + leftShoulder?.x) / 2) * canvas.width,
      ((leftWrist?.y + leftShoulder?.y) / 2) * canvas.height
    );

    // ----------------------------  RIGHT SIDE ----------------------------

    ctx.fillText(`💪 ${rightAngleBicep}º`,
      (rightElbow?.x * canvas.width),
      40 + (rightElbow?.y * canvas.height)
    );

    ctx.fillText(`${rightAngleShoulder}º`,
      ((rightWrist?.x + rightHip?.x) / 2) * canvas.width,
      ((rightWrist?.y + rightHip?.y) / 2) * canvas.height
    );

    ctx.fillText(`${rightAngleShoulderElbow}º`,
      ((rightWrist?.x + rightShoulder?.x) / 2) * canvas.width,
      ((rightWrist?.y + rightShoulder?.y) / 2) * canvas.height
    );

    // ----------------------------  BOTH SIDE ----------------------------
  }


  // ----------------------------  COUNTER RIGHT SIDE ----------------------------
  // Bicep curl counter logic
  /*
  const counterMode = get.value.get('counterMode');
  if (counterMode == '1') {
    if (rightWrist && rightShoulder && rightElbow) {

      if (bicepCurlCount <= 10) {
        if (rightAngleBicep < 6) {
          // Arm is straight
          if (isCurlingUp) {
            isCurlingUp = false;
            bicepCurlCount++;
            get.html.set('repetitions', `${bicepCurlCount}`)
            console.log(`Bicep curl count: ${bicepCurlCount}  - ${rightAngleBicep}º`);
          }
        } else if (rightAngleBicep > 90) {
          // Arm is bent
          isCurlingUp = true;
        }
      } else bicepCurlCount = 0;

    }
  } else bicepCurlCount = 0;
   */
};
