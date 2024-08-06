'use client';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { GestureRecognizer, PoseLandmarker } from '@mediapipe/tasks-vision';
import { debounce, get, is, processResponse, to } from '@utilities/tools';
import { detectHandSide, Position } from '@utilities/positions';
import { Provider, defaultConstraintsCamera, defaultPixel, defaultSystemPrompt, defautlOptionsLandmarker } from '@utilities/defaults';
import { Camera, SpinnerGap, GearSix, X, Warning, Sparkle, Angle, ArrowsCounterClockwise, ArticleNyTimes, Barbell, CardsThree, VectorTwo } from '@phosphor-icons/react/dist/ssr';
import { streamAction } from '@utilities/actions';
import { readStreamableValue } from 'ai/rsc';
import { Modal } from '@components/Modal';
import { SpeechToTextInput } from '@components/SpeechToText';
import { Switch } from '@components/Switch';
import { DotLoader } from '@components/Loading';
import { drawLandmarks, takePicture } from '@utilities/canvas';
import { motion } from 'framer-motion';
import { Card } from '@components/Card';

export const CameraPose = ({ lang }: { lang: string }): ReactNode => {

  const videoRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isStarting, setIsStarting] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [leftHand, setLeftHand] = useState<string>('');
  const [rightHand, setRightHand] = useState<string>('');
  const [textListen, setTextListen] = useState<string>('');
  const [textGeneration, setTextGeneration] = useState<any>('');
  const [isGeneration, setIsGeneration] = useState<boolean>(false);
  const [noRoutine, setNoRoutine] = useState<number>(0);
  const [routine, setRoutine] = useState<any>([]);

  const [modalData, setModalData] = useState<{ title: string; message: string }>({ title: '', message: '' });
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isOpenModalSettings, setIsOpenModalSettings] = useState<boolean>(false);
  const [isListen, setIsListen] = useState<boolean>(false);
  const [picture, setPicture] = useState<string>(defaultPixel);
  const [isAngleMode, setIsAngleMode] = useState<boolean>(false);
  const [isBothHandsMic, setIsBothHandsMic] = useState<boolean>(true);
  const [isLineMode, setIsLineMode] = useState<boolean>(false);
  //const [isCounterMode, setIsCounterMode] = useState<boolean>(false);

  const constraintsRef = useRef<any>(null);
  const [positionRight, setPositionRight] = useState({ x: 20, y: 20 });
  const [positionLeft, setPositionLeft] = useState({ x: 20, y: 200 });

  const onPicture = () => {
    setTimeout(() => {
      const base64 = takePicture(videoRef, canvasRef);
      setPicture(base64);
    }, 300);
  };

  const onStartCamera = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    startCamera();
  };

  const startCamera = async () => {

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
      const [stream, gestureRecognizer, poseLandmarker] = await Promise.all([
        navigator.mediaDevices.getUserMedia(defaultConstraintsCamera),
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
          detectMovement(video, gestureRecognizer, poseLandmarker);
          onPicture();
        });
      }
    } catch (error: any) {
      let message = '';
      if (error.name === 'NotAllowedError') {
        message = 'Dale permisos a tu cámara';
      } else if (error.name === 'NotFoundError') {
        message = 'Al parecer tu dispositivo no tiene cámara';
      } else {
        message = `Error al acceder a la cámar: ${error.message}`;
      }
      setModalData({ title: '¡Houston, tú cámara!', message });
      setIsOpenModal(true);
      setIsLoading(false);
      setIsCameraActive(false);
    }
  }

  const onText = (text: string) => {
    setTextListen(text);
    debounceText(text);
  };

  const debounceText = debounce((text: string) => {
    new Promise(async () => {
      text = text.toLocaleLowerCase();
      console.log(text);

      if (text == 'ángulos') {
        setIsLineMode(!isLineMode);
        return
      }

      if (!isGeneration) {
        setTextGeneration(<DotLoader />);
        let systemPrompt = get.value.get('prompt');

        const result: any = await streamAction(text, systemPrompt, Provider.openai);
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
          setTextGeneration('Tengo problemas con mi LLM 😥');
        }
      }
    })
  }, 800);

  const onRoutine = (index: number) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setNoRoutine(index);
  }

  const detectMovement = (video: any, gestureRecognizer: any, poseLandmarker: any) => {

    const recognitions = gestureRecognizer.recognizeForVideo(video, performance.now());
    const pose = poseLandmarker.detectForVideo(video, performance.now());

    if (recognitions?.landmarks || pose?.landmarks) {
      drawLandmarks(canvasRef, recognitions?.landmarks, pose?.landmarks);

      if (Array.isArray(recognitions?.landmarks)) {
        const handSides: Position[] = recognitions.landmarks.map((hand: any) =>
          detectHandSide(hand, pose?.landmarks)
        );
        setRightHand('');
        setLeftHand('');
        get.value.set('leftHand', '')
        get.value.set('rightHand', '')

        recognitions.gestures.forEach((gesture: any, index: number) => {
          const handSide = handSides[index];
          const gestureName = gesture[0]?.categoryName || '';

          if (handSide === 'left') {
            get.value.set('leftHand', gestureName)
            setLeftHand(gestureName);
          } else if (handSide === 'right') {
            get.value.set('rightHand', gestureName)
            setRightHand(gestureName);
          }
        });
      }

      if (is.array(recognitions?.landmarks)) {

        const valueRightHand = get.value.get('rightHand');
        const valueLeftHand = get.value.get('leftHand');
        const canvas: any = canvasRef.current;
        const { width, height } = canvas.getBoundingClientRect();

        for (let handSide of recognitions?.landmarks) {
          if (is.array(handSide)) {
            let index = 0;
            for (let elem of handSide) {
              if (index == 8) {
                const x = (1 - elem.x) * width;
                const y = (elem.y) * height;
                const coords = { x, y };
                console.log('right;', valueRightHand)
                if (valueRightHand == 'Pointing_Up') setPositionRight(coords);
                else if (valueLeftHand == 'Pointing_Up') setPositionLeft(coords);
              }
              ++index;
            }
          }
        }
      }
      requestAnimationFrame(() => detectMovement(video, gestureRecognizer, poseLandmarker));
    }
  };

  useEffect(() => {
    if (isBothHandsMic && leftHand == 'Open_Palm' && rightHand == 'Open_Palm') setIsListen(!isListen);
  }, [leftHand, rightHand])

  return (
    <>
      <div className="w-full flex justify-center md:items-center h-screen relative p-3">

        <input type="hidden" id="leftHand" />
        <input type="hidden" id="rightHand" />

        <div className={`${isCameraActive && !isStarting ? '' : 'hidden'}`}>

          <div className="relative w-full z-10">

            <div className="w-full relative shadow-lg shadow-slate-800/20 rounded-lg">

              <video ref={videoRef} autoPlay={true} playsInline={true} muted={true} className="rounded-lg rotate-180" style={{ transform: "rotateY(180deg)" }} />
              <canvas ref={canvasRef} className="absolute top-0 w-full h-full" style={{ transform: "rotateY(180deg)" }} />

              <div className="absolute bottom-3 right-3 z-30">
                <button type="button" onClick={() => setIsOpenModalSettings(true)} className="w-fit bg-white/10 dark:bg-black/10 hover:bg-white/30 dark:hover:bg-black/30 backdrop-blur rounded-full p-1.5">
                  <GearSix className="size-7 text-white" />
                </button>
              </div>

              <div className="w-full absolute bottom-3 z-20">
                <div className="flex justify-center">
                  <SpeechToTextInput lang={lang} listen={isListen} isBothHandsMic={isBothHandsMic} onListen={(listen: boolean) => setIsListen(listen)} onText={onText} />
                </div>
              </div>

              <motion.div className="absolute top-0 w-full h-full" ref={constraintsRef}>

                {textListen == '' ? null :
                  <Card text="👆🏻" position={positionRight} constraintsRef={constraintsRef} backgroundColor="bg-indigo-500/80">
                    <div className="flex flex-row gap-3 items-start relative">
                      <div className="absolute -right-8 -bottom-8">
                        <div className="size-8 bg-indigo-600 rounded-full">
                          <img src={picture} alt="Image profile" className="size-8 rounded-full border-2 border-indigo-600 object-cover" style={{ transform: "rotateY(180deg)" }} />
                        </div>
                      </div>
                      <div className="w-full max-h-48 md:max-h-72 md:overflow-auto leading-relaxed whitespace-pre-wrap">
                        {textListen}
                      </div>
                    </div>
                  </Card>
                }

                {textGeneration != '' || is.array(routine) ?
                  <Card text="👆🏻" position={positionLeft} constraintsRef={constraintsRef} backgroundColor="bg-pink-500/80 dark:bg-slate-950/80">
                    <div className="flex flex-col gap-3 items-start relative text-white">

                      <div className="absolute -right-8 -bottom-8">
                        <div className="flex items-center justify-center size-8 bg-pink-700 border-2 border-pink-400 rounded-full">
                          <Sparkle className="size-6 text-white" />
                        </div>
                      </div>

                      <div id="textGeneration" className="md:max-h-72 md:overflow-auto leading-relaxed whitespace-pre-wrap">
                        {textGeneration}
                      </div>

                      {is.array(routine) ?
                        <div className="w-full max-w-48 md:max-w-72 flex flex-col gap-3 md:lg:max-h-98 lg:max-h-max md:overflow-auto">
                          <div className="flex flex-row gap-3">
                            <div>
                              <Barbell className="size-7" />
                            </div>
                            <div className="font-bold">{routine?.[noRoutine]?.nombre}</div>
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
                              {routine.map((item: any, index: number) => <button type="button" key={index} onClick={onRoutine(index)}
                                className={`${noRoutine == index ? 'text-white bg-fuchsia-600' : 'text-black dark:text-white bg-slate-200 dark:bg-slate-500'} hover:opacity-70 size-6 rounded-full  flex items-center justify-center`}>{index + 1}</button>)}
                            </div>
                          </div>
                        </div>
                        : null}
                    </div>
                  </Card>
                  : null}
              </motion.div>

            </div>

            {/*isCounterMode ?
              <div className="absolute w-full top-1/2 flex items-center justify-center">
                <div id="repetitions" className="size-20 bg-yellow-300/70 text-black rounded-full flex items-center justify-center text-4xl">
                </div>
              </div>
              : null*/}
          </div>
        </div>

        <div className={isStarting ? 'flex items-center' : 'hidden'}>
          <div className="group relative w-fit transition-transform duration-300 active:scale-95">
            <button type="button" onClick={onStartCamera} disabled={isLoading} className="relative z-10 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 p-1 duration-300 group-hover:scale-110">
              <span className="block rounded-full p-6 md:p-10 font-semibold text-slate-100 duration-300 group-hover:text-slate-50 dark:bg-slate-950/60">
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

          {/*<Switch id="counterMode" label="Contador de repeticiones" checked={isCounterMode}
            onChange={(bool: boolean) => setIsCounterMode(bool)} disabled={false} />
            */}

          <div className="flex flex-col gap-1">
            <div className="text-white font-semibold">
              Lenguaje del habla
            </div>
            <select id="languageSelect" defaultValue={lang} className="w-full text-black dark:text-white border border-slate-400 bg-slate-200/60 dark:bg-slate-900/60 dark:border-slate-900 rounded-md p-3 outline-none">
              <option value="en-US">English (United States)</option>
              <option value="en-GB">English (United Kingdom)</option>
              <option value="en-AU">English (Australia)</option>
              <option value="en-CA">English (Canada)</option>
              <option value="en-IN">English (India)</option>
              <option value="es-ES">Spanish (Spain)</option>
              <option value="es-MX">Spanish (Mexico)</option>
              <option value="es-AR">Spanish (Argentina)</option>
              <option value="es-CO">Spanish (Colombia)</option>
              <option value="es-US">Spanish (United States)</option>
            </select>
          </div>

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