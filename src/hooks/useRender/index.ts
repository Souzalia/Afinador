import { useCallback, useEffect, useState } from 'react';

interface Wave {
  color: string,
  width: number,
}

interface Text {
  font: string;
  align: CanvasTextAlign,
  value: string,
}

interface Prameters {
  autoinit?: boolean;
  bufferLength: number;
  background?: string;
  wave?: Wave;
  text?: Text
}

function useRender(config: Prameters) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  const [context, setContext] = useState<CanvasRenderingContext2D>();
  const [bufferLength, setBufferLength] = useState<number>(config.bufferLength || 0);
  const [buffer, setBuffer] = useState<Uint8Array>(new Uint8Array(bufferLength));
  const [text, setText] = useState<string>(config.text ? config.text.value : 'empty');
  const [update, setUpdate] = useState<() => void>(() => {});

  const draw = useCallback(() => {
    if (context) {
      requestAnimationFrame(draw);
      update();
      const textWidth = context.measureText(text).width + 30;
      const textHeight = 50;
      const textBackground = {
        x: (canvas.width / 2) - (textWidth / 2),
        y: (canvas.height / 2) - (textHeight / 2),
      };

      context.fillStyle = config.background || 'rgba(255, 255, 255)';
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.lineWidth = config.wave ? config.wave.width : 2;
      context.strokeStyle = config.wave ? config.wave.color : '#20dd35';

      context.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i += 1) {
        const v = buffer[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }

        x += sliceWidth;
      }

      context.lineTo(canvas.width, canvas.height / 2);
      context.stroke();

      context.fillStyle = 'rgba(30, 30, 30, 0.5)';
      context.fillRect(textBackground.x, textBackground.y, textWidth, textHeight);

      context.font = config.text ? config.text.font : '30px Arial';
      context.textAlign = config.text ? config.text.align : 'center';
      context.fillStyle = 'rgb(255,255,255)';
      context.fillText(text, canvas.width / 2, (canvas.height / 2) + 8);
      return;
    }
    throw new Error('The context isn\'t initialized. Set de canvas first');
  }, [canvas, context, bufferLength, buffer, text, config, update]);

  useEffect(() => {
    if (canvas) {
      setContext(canvas.getContext('2d', { alpha: true }));
    }
  }, [canvas]);

  useEffect(() => {
    if (context && config.autoinit) draw();
  }, [context, draw, config]);

  return {
    setBufferLength,
    setBuffer,
    setCanvas,
    setText,
    setUpdate,
    draw,
  };
}

export default useRender;
