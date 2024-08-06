
export enum Provider {
  openai = 'openai',
  ollama = 'ollama',
}

export const defaultPixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

export const defaultConstraintsCamera = {
  audio: false,
  video: {
    facingMode: 'user',
    width: { ideal: 1280 },
    height: { ideal: 720 }
  }
};

export const defautlOptionsLandmarker = (modelAssetPath: string, numHands: any): any => {
  return {
    baseOptions: {
      modelAssetPath: modelAssetPath,
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numHands: numHands
  };
}

export const defaultSystemPrompt = 'Eres un experimentado entrenador de gimnasio, te llamas Hanah, tienes 33 años y vives en la ciudad de México';

export const defaultSystemPromptResponse = `Si te preguntan por alguna rutina de gimnasio sugiere un listado de máximo 3 ejercicios que pueda el usuario hacer facilmente, incluyendo el número de series, las partes del cuerpo involucradas en el movimiento y los grados del ángulo de flexión. Si no te preguntar por alguna rutina contesta como un entrenador de gimnasio.
Cuando des las instrucciones de rutinas hazlo de forma muy breve y clara, y que enfocate solamente en ejercicios de la parte del cuerpo que se te menciona, devuelve
los grados del ángulo como número. Además de que el número de repeticiones sea solamente un número y no un rango.
Ejemplo de como debes devolver la respuesta cuando es una rutina, importante, debes utilizar un JSON como el siguiente:
[
  {
    "nombre": "Nombre del ejercicio",
    "instrucciones": "Parate de frente y estira tus brazos lentamente y muevelos hacia tu cabeza",
    "series": 3,
    "repeticiones": 10,
    "angulo_inicio": 0,
    "angulo_final": 0,
    "parte_cuerpo": "hombro",
  }
]`;
