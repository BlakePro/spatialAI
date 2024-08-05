'use client';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { GestureRecognizer, PoseLandmarker, FaceDetector } from '@mediapipe/tasks-vision';
import { debounce, get, is, processResponse, to } from '@utilities/tools';
import { detectHandSide, Position } from '@utilities/positions';
import { defaultConstraintsCamera, defaultPixel, defaultSystemPrompt, defautlOptionsLandmarker } from '@utilities/defaults';
import { Camera, SpinnerGap, GearSix, X, Warning, Sparkle, ChatText, Angle, ArrowsCounterClockwise, ArticleNyTimes, Barbell, CardsThree, VectorTwo } from '@phosphor-icons/react/dist/ssr';
import { streamAction } from '@utilities/actions';
import { readStreamableValue } from 'ai/rsc';
import { Modal } from '@components/Modal';
import { SpeechToTextInput } from '@components/SpeechToText';
import { Switch } from '@components/Switch';
import { calculateAngle2D } from '@utilities/angles';
import { DotLoader } from '@components/Loading';

export const CameraPose = (): ReactNode => {

  const videoRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);

  const [leftHand, setLeftHand] = useState<string>('');
  const [rightHand, setRightHand] = useState<string>('');
  const [textListen, setTextListen] = useState<string>('');
  const [textGeneration, setTextGeneration] = useState<any>('');
  const [isGeneration, setIsGeneration] = useState<boolean>(false);
  const [noRoutine, setNoRoutine] = useState<number>(0);
  const [routine, setRoutine] = useState<any>([]);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isStarting, setIsStarting] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isOpenModalSettings, setIsOpenModalSettings] = useState<boolean>(false);
  const [modalData, setModalData] = useState<{ title: string; message: string }>({ title: '', message: '' });
  const [isListen, setIsListen] = useState<boolean>(false);
  const [picture, setPicture] = useState<string>(defaultPixel);
  const [isAngleMode, setIsAngleMode] = useState<boolean>(false);
  const [isBothHandsMic, setIsBothHandsMic] = useState<boolean>(true);
  const [isLineMode, setIsLineMode] = useState<boolean>(false);
  const [isCounterMode, setIsCounterMode] = useState<boolean>(false);
  const [isOpenChat, setIsOpenChat] = useState<boolean>(true);
  const [isOpenRoutine, setIsOpenRoutine] = useState<boolean>(true);
  const [timer, setTimer] = useState<any>(null);

  const takePicture = (): string => {
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

  const onPicture = () => {
    setTimeout(() => {
      const base64 = takePicture();
      setPicture(base64);
    }, 300);
  };

  const onStartCamera = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setModalData({
        title: 'Camera problem!',
        message: 'Your browser doesn`t support accessing the camera. Please try a different browser'
      });
      return;
    }

    try {
      setIsLoading(true);
      const vision = { wasmLoaderPath: 'vision_wasm_internal.js', wasmBinaryPath: 'vision_wasm_internal.wasm' };
      const [stream, gestureRecognizer, poseLandmarker] = await Promise.all([ // faceLandmarker
        navigator.mediaDevices.getUserMedia(defaultConstraintsCamera),
        //FaceDetector.createFromOptions(vision, defautlOptionsLandmarker('blaze_face_short_range.tflite', undefined)),
        GestureRecognizer.createFromOptions(vision, defautlOptionsLandmarker('gesture_recognizer.task', 2)),
        PoseLandmarker.createFromOptions(vision, defautlOptionsLandmarker('pose_landmarker_lite.task', undefined))
      ]);

      if (stream && videoRef?.current) {
        const video = videoRef?.current;
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', () => {
          setIsCameraActive(true);
          setIsStarting(false);
          setIsLoading(false);
          detectMovement(video, gestureRecognizer, poseLandmarker); // faceLandmarker
          onPicture();
        });
      }
    } catch (error: any) {
      let message = '';
      if (error.name === 'NotAllowedError') {
        message = 'Camera access was denied. Please grant permission and try again';
      } else if (error.name === 'NotFoundError') {
        message = 'No camera found on your device';
      } else {
        message = `Error accessing camera: ${error.message}`;
      }
      setModalData({ title: 'Camera problem!', message });
      setIsOpenModal(true);
      setIsLoading(false);
      setIsCameraActive(false);
    }
  };

  const onText = (text: string) => {
    setTextListen(text);
    debouncedText(text);
  };

  const debouncedText = debounce((text: string) => {
    new Promise(async () => {
      text = text.toLocaleLowerCase();

      setIsCounterMode(text == 'contador');

      if (!isGeneration) {
        setTextGeneration(<DotLoader />);
        let systemPrompt = get.value.get('prompt');

        const result: any = await streamAction(text, systemPrompt, 'ollama');
        if (result) {
          for await (const value of readStreamableValue(result)) {
            setIsGeneration(true);
            let { text, exercise } = processResponse(value);
            setTextGeneration(text);
            setRoutine(exercise);
            to.scroll('textGeneration', 384);
            setIsGeneration(false);
          }
        } else {
          setTextGeneration('Tengo problemas con mi LLM 😥')
        }
      }
    })
  }, 800);

  const onRoutine = (index: number) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setNoRoutine(index);
  }

  let bicepCurlCount = 0;
  let isCurlingUp = false;


  const drawLandmarks = (handLandmarksArray: any, poseLandmarksArray: any) => { //faceLandmarksArray: any,

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
              ctx.fillText(index, x, y);
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

    const leftKnee = posePersonLandmarks?.[25]; // rodilla
    const rightKnee = posePersonLandmarks?.[26];

    const leftHell = posePersonLandmarks?.[29]; // tobillo
    const rightHell = posePersonLandmarks?.[30];

    const leftToe = posePersonLandmarks?.[31]; // pie
    const rightToe = posePersonLandmarks?.[32];

    const middleShoulder = {
      x: (leftShoulder?.x + rightShoulder?.x) / 2,
      y: (leftShoulder?.x + rightShoulder?.y) / 2,
      z: (leftShoulder?.z + rightShoulder?.z) / 2
    };

    let leftAngleFaceShoulder = calculateAngle2D(noise, middleShoulder, leftShoulder);

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

  };

  // drawLineEyeShoulder(leftEar, leftShoulder, canvas, ctx, 0);
  //drawLineEyeShoulder(rightEar, rightShoulder, canvas, ctx, -180);

  const detectMovement = (video: any, gestureRecognizer: any, poseLandmarker: any) => { // faceLandmarker: any,
    //const face = faceLandmarker.detectForVideo(video, performance.now());
    const recognitions = gestureRecognizer.recognizeForVideo(video, performance.now());
    const pose = poseLandmarker.detectForVideo(video, performance.now());

    if (recognitions?.landmarks || pose?.landmarks) { // face?.detections?.[0]?.keypoints ||
      // const detections = { faceLandmarks: face?.detections?.[0]?.keypoints };
      drawLandmarks(recognitions?.landmarks, pose?.landmarks); //detections?.faceLandmarks,

      if (Array.isArray(recognitions?.landmarks)) {
        const handSides: Position[] = recognitions.landmarks.map((hand: any) =>
          detectHandSide(hand, pose?.landmarks)
        );
        setRightHand('');
        setLeftHand('');

        recognitions.gestures.forEach((gesture: any, index: number) => {
          const handSide = handSides[index];
          const gestureName = gesture[0]?.categoryName || '';

          if (handSide === 'left') setLeftHand(gestureName);
          else if (handSide === 'right') setRightHand(gestureName);
        });
      }
      requestAnimationFrame(() => detectMovement(video, gestureRecognizer, poseLandmarker)); //faceLandmarker
    }
  };

  useEffect(() => {
    if (isBothHandsMic && leftHand == 'Open_Palm' && rightHand == 'Open_Palm') setIsListen(!isListen);

    if (textListen != '') {
      if (leftHand === 'Pointing_Up') {
        const newTimer = setTimeout(() => {
          setIsOpenChat(!isOpenChat);
          setTimer(null);
        }, 320);
        setTimer(newTimer);
      } else {
        if (timer) {
          clearTimeout(timer);
          setTimer(null);
        }
      }
    }

    if (rightHand === 'Pointing_Up') {
      const newTimer = setTimeout(() => {
        setIsOpenRoutine(!isOpenRoutine);
        setTimer(null);
      }, 320);
      setTimer(newTimer);
    } else {
      if (timer) {
        clearTimeout(timer);
        setTimer(null);
      }
    }

  }, [leftHand, rightHand])

  return (
    <>
      <div className="w-full flex md:justify-center items-center h-screen relative p-3">

        <div className={`${isCameraActive && !isStarting ? '' : 'hidden'}`}>
          <div className="relative w-full">

            <div className="w-full relative shadow-lg shadow-slate-800/20 rounded-lg">
              <video ref={videoRef} autoPlay={true} playsInline={true} muted={true} className="rounded-lg" style={{ transform: "rotateY(180deg)" }} />
              <canvas ref={canvasRef}
                style={{ transform: "rotateY(180deg)" }}
                className="absolute top-0 w-full h-full"
              />
              <div className="absolute bottom-3 right-3 z-30">
                <button type="button" onClick={() => setIsOpenModalSettings(true)} className="w-fit bg-white/10 dark:bg-black/10 hover:bg-white/30 dark:hover:bg-black/30 backdrop-blur rounded-full p-1.5">
                  <GearSix className="size-7 text-white" />
                </button>
              </div>

              <div className="w-full absolute bottom-3 z-20">
                <div className="flex justify-center">
                  <SpeechToTextInput lang="es-MX" listen={isListen} isBothHandsMic={isBothHandsMic} onListen={(listen: boolean) => setIsListen(listen)} onText={onText} />
                </div>
              </div>
            </div>

            {isCounterMode ?
              <div className="absolute w-full top-1/2 flex items-center justify-center">
                <div id="repetitions" className="size-20 bg-yellow-300/70 text-black rounded-full flex items-center justify-center text-4xl">
                </div>
              </div>
              : null}

            <div className={isOpenChat ? "hidden" : "absolute top-3 left-3 z-20"}>
              <button type="button" onClick={() => setIsOpenChat(true)} className="w-fit bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:opacity-90 backdrop-blur rounded-full p-1.5">
                <ChatText className="size-7 text-white" />
              </button>
            </div>

            <div className={isOpenRoutine ? "hidden" : "absolute top-3 right-3 z-20"}>
              <button type="button" onClick={() => setIsOpenRoutine(true)} className="w-fit bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:opacity-90 backdrop-blur rounded-full p-1.5">
                <Barbell className="size-7 text-white" />
              </button>
            </div>

            <div className="w-full md:absolute md:top-0 md:z-10 py-3 md:p-3 flex flex-col md:flex-row md:justify-between">

              {isOpenChat ? null : <div className="hidden md:block"></div>}

              <div className={isOpenChat ? "w-full max-w-[97%] md:w-full md:max-w-72 flex flex-col gap-6" : "hidden"}>

                {textListen == '' ? null :
                  <div className="w-fit py-2 px-3 text-white bg-indigo-500 md:bg-indigo-500/90 rounded-lg flex flex-row gap-3 items-start shadow-lg shadow-slate-800/20 relative">
                    <div className="absolute -right-4 -bottom-4">
                      <div className="size-8 bg-indigo-600 rounded-full">
                        <img src={picture} alt="Image profile" className="size-8 rounded-full border-2 border-indigo-600 object-cover" />
                      </div>
                    </div>
                    <div className="md:max-h-72 md:overflow-auto leading-relaxed whitespace-pre-wrap">
                      {textListen}
                    </div>
                  </div>
                }

                {textGeneration == '' ? null :
                  <div className="w-fit py-2 px-3 text-white bg-pink-500 md:bg-pink-500/90 rounded-lg flex flex-row gap-3 items-start shadow-lg shadow-slate-800/20 relative">
                    <div className="absolute -right-4 -bottom-4">
                      <div className="flex items-center justify-center size-8 bg-pink-700 border-2 border-pink-400 rounded-full">
                        <Sparkle className="size-6 text-white" />
                      </div>
                    </div>
                    <div id="textGeneration" className="md:max-h-72 md:overflow-auto leading-relaxed whitespace-pre-wrap">
                      {textGeneration}
                    </div>
                  </div>
                }
              </div>

              <div className={isOpenRoutine ? "flex" : "hidden"}>
                {is.array(routine) ?
                  <div className="w-full md:max-w-72 flex flex-col gap-3 p-3 md:lg:max-h-98 lg:max-h-max md:overflow-auto rounded-lg text-slate-900 dark:text-slate-100 bg-white md:bg-white/20 dark:bg-slate-800 dark:md:bg-slate-950/80 shadow-lg shadow-slate-800/20">

                    <div className="flex flex-row justify-between items-start">
                      <div className="flex flex-row gap-3">
                        <div>
                          <Barbell className="size-7 fill-purple-500" />
                        </div>
                        <div className="font-bold">{routine?.[noRoutine]?.ejercicio}</div>
                      </div>
                      <button type="button" onClick={() => setIsOpenRoutine(false)} className="text-xl text-black dark:text-white hover:opacity-80">
                        <X />
                      </button>
                    </div>

                    <div className="flex items-start gap-3">
                      <div>
                        <ArticleNyTimes className="size-7" />
                      </div>
                      <div>
                        {routine?.[noRoutine]?.instrucciones}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div>
                        <CardsThree className="size-7" />
                      </div>
                      <div>
                        {routine?.[noRoutine]?.series} series
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div>
                        <ArrowsCounterClockwise className="size-7" />
                      </div>
                      <div>
                        {routine?.[noRoutine]?.repeticiones} repeticiones
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div>
                        <Angle className="size-7" />
                      </div>
                      <div>
                        Inicia a {routine?.[noRoutine]?.angulo_inicio}º
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div>
                        <VectorTwo className="size-7" />
                      </div>
                      <div>
                        Finaliza a {routine?.[noRoutine]?.angulo_final}º
                      </div>
                    </div>

                    <div className="w-full flex justify-center">
                      <div className="w-fit flex flex-row gap-3 p-2 rounded-lg items-center text-slate-900 dark:text-slate-100 ">
                        {routine.map((item: any, index: number) => <button type="button" key={index} type="button" onClick={onRoutine(index)}
                          className={`${noRoutine == index ? 'text-white bg-gradient-to-br from-indigo-500 to-fuchsia-500' : 'text-black dark:text-white bg-slate-200 dark:bg-slate-500'} hover:opacity-70 size-6 rounded-full  flex items-center justify-center`}>{index + 1}</button>)}
                      </div>
                    </div>
                  </div>
                  : null}
              </div>

            </div>
          </div>
        </div>

        <div className={isStarting ? 'flex items-center' : 'hidden'}>
          <div className="group relative w-fit transition-transform duration-300 active:scale-95">
            <button type="button" onClick={onStartCamera} disabled={isLoading} className="relative z-10 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 p-1 duration-300 group-hover:scale-110">
              <span className="block rounded-full p-6 md:p-10 font-semibold text-slate-100 duration-300 group-hover:text-slate-50 bg-slate-950/10 dark:bg-slate-950/80">
                {isLoading ?
                  <SpinnerGap className="size-24 fill-white-50/90 animate-spin" /> :
                  <Camera weight="fill" className="size-16 md:size-20 fill-white" />
                }
              </span>
            </button>
            <span className="pointer-events-none absolute -inset-4 z-0 transform-gpu rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 opacity-30 blur-xl transition-all duration-300 group-hover:opacity-90 group-active:opacity-50"></span>
          </div>
        </div>
      </div>

      <Modal icon={<GearSix className="text-white/10 rotate-12 text-[250px] absolute z-0 -top-24 -left-24" />} isOpen={isOpenModalSettings}>
        <div className="w-full flex items-center justify-between">
          <h3 className="text-2xl font-bold text-center select-none">
            Configuración
          </h3>
          <div>
            <button type="button" onClick={() => setIsOpenModalSettings(false)} className="w-fit text-2xl text-white hover:opacity-80">
              <X />
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-4 ">
          <Switch id="bothHandsMode" label="Gestos con las manos" checked={isBothHandsMic}
            onChange={(bool: boolean) => setIsBothHandsMic(bool)} disabled={false} />

          <Switch id="angleMode" label="Ángulos de los movimientos" checked={isAngleMode}
            onChange={(bool: boolean) => setIsAngleMode(bool)} disabled={false} />

          <Switch id="lineMode" label="Líneas del cuerpo" checked={isLineMode}
            onChange={(bool: boolean) => setIsLineMode(bool)} disabled={false} />

          <Switch id="counterMode" label="Contador de repeticiones" checked={isCounterMode}
            onChange={(bool: boolean) => setIsCounterMode(bool)} disabled={false} />

          <div className="flex flex-col gap-1">
            <div className="text-white font-semibold">
              Prompt de sistema
            </div>
            <textarea id="prompt" defaultValue={defaultSystemPrompt} rows={6} className="w-full text-black dark:text-white border border-slate-400 bg-slate-200/60 dark:bg-slate-900/60 dark:border-slate-900 rounded-md p-2 outline-none resize-none" autoComplete="off"></textarea>
          </div>
        </div>
      </Modal>

      <Modal icon={<Warning className="text-white/10 rotate-12 text-[250px] absolute z-0 -top-24 -left-24" />} isOpen={isOpenModal}>
        <div className="w-full flex items-center justify-between">
          <h3 className="text-2xl font-bold text-center select-none">
            {modalData.title}
          </h3>
          <div>
            <button type="button" onClick={() => setIsOpenModal(false)} className="w-fit text-2xl text-white hover:opacity-80">
              <X />
            </button>
          </div>
        </div>
        <div className="w-full flex justify-center items-center">
          <div className="max-w-96 text-center text-lg">
            {modalData.message}
          </div>
        </div>
      </Modal>
    </>
  )
};