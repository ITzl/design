const imgRender = (root: HTMLDivElement) => {
    if (!root) return;
  
    const stage = root.querySelectorAll('[data-r-stage]')[0];
    const backgrounds = root.querySelectorAll('[data-r-background]');
    const products = root.querySelectorAll('[data-r-product]');
    const otherImgs = root.querySelectorAll('[data-r-img]');
    const texts = root.querySelectorAll('[data-r-text]');
    const arrows = root.querySelectorAll('[data-r-arrow]');
    const originStageScale = Number(
      stage.getAttribute('data-r-stage-scale') || 1,
    );
    const stageScale = 1 / originStageScale;
    const renderArr: any = [];
  
    const stageRect = stage.getBoundingClientRect();
    const {
      top: stageTop,
      left: stageLeft,
      right: stageRight,
      bottom: stageBottom,
      width: stageWidth,
      height: stageHeight,
    } = stageRect;
  
    // create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
  
    canvas.width = stageWidth * stageScale;
    canvas.height = stageHeight * stageScale;
  
    // 背景图
    for (let i = 0; i < backgrounds.length; i++) {
      const dom = backgrounds[i];
      const imgDom = dom.querySelectorAll('img')?.[0];
      const zIndex = dom.getAttribute('data-r-background') || 0;
      const rect = dom.getBoundingClientRect();
      const imgRect = imgDom.getBoundingClientRect();
      const { top, left, right, bottom, width, height } = rect;
      const {
        top: imgTop,
        left: imgLeft,
        right: imgRight,
        bottom: imgBottom,
        width: imgWidth,
        height: imgHeight,
      } = imgRect;
      const naturalWidth = imgDom.naturalWidth;
      const scale = naturalWidth / imgWidth;
  
      if (!renderArr[zIndex]) {
        renderArr[zIndex] = [];
      }
  
      const sx = left < stageLeft ? stageLeft - imgLeft : left - imgLeft;
      const sy = top < stageTop ? stageTop - imgTop : top - imgTop;
      const sWidth =
        (right > stageRight ? stageRight : right) -
        (left < stageLeft ? stageLeft : left);
      const sHeight =
        (bottom > stageBottom ? stageBottom : bottom) -
        (top < stageTop ? stageTop : top);
      const dx = left < stageLeft ? 0 : left - stageLeft;
      const dy = top < stageTop ? 0 : top - stageTop;
  
      renderArr[zIndex].push({
        type: 'background',
        image: imgDom,
        sx: sx * scale,
        sy: sy * scale,
        sWidth: sWidth * scale,
        sHeight: sHeight * scale,
        dx: dx * stageScale,
        dy: dy * stageScale,
        dWidth: sWidth * stageScale,
        dHeight: sHeight * stageScale,
      });
    }
  
    // 商品图
    for (let i = 0; i < products.length; i++) {
      const dom = products[i];
      const imgDom = dom.querySelectorAll('img')?.[0];
      const zIndex = dom.getAttribute('data-r-product') || 0;
      const angle = Number(dom.getAttribute('data-r-product-angle')) || 0;
      const productRect = dom.getBoundingClientRect();
      const imgRect = imgDom.getBoundingClientRect();
      const {
        top: imgTop,
        left: imgLeft,
        right: imgRight,
        bottom: imgBottom,
        width: imgWidth,
        height: imgHeight,
      } = imgRect;
      const naturalWidth = imgDom.naturalWidth;
      const naturalHeight = imgDom.naturalHeight;
  
      if (!renderArr[zIndex]) {
        renderArr[zIndex] = [];
      }
  
      const sx = 0;
      const sy = 0;
  
      // rotate之后元素宽高会改变，这里一通计算还原回原始宽高
      const dWidth =
        (imgHeight * Math.abs(Math.sin(angle)) - imgWidth * Math.cos(angle)) /
        (Math.sin(angle) * Math.sin(angle) - Math.cos(angle) * Math.cos(angle));
      const dHeight = Math.sin(angle)
        ? (imgWidth - dWidth * Math.cos(angle)) / Math.abs(Math.sin(angle))
        : imgHeight;
  
      // rotate之后left、top会改变，这里一通计算还原
      const deg = Math.atan(naturalHeight / naturalWidth);
      const side = dWidth / 2 / Math.cos(deg); // 斜边长
      const dx =
        imgLeft -
        stageLeft +
        (Math.cos(deg - Math.abs(angle)) * side - dWidth / 2);
      const dy =
        imgTop -
        stageTop +
        (Math.cos(Math.abs(angle) - Math.PI / 2 + deg) * side - dHeight / 2);
      renderArr[zIndex].push({
        type: 'product',
        image: imgDom,
        sx,
        sy,
        sWidth: naturalWidth,
        sHeight: naturalHeight,
        dx: dx * stageScale,
        dy: dy * stageScale,
        dWidth: dWidth * stageScale,
        dHeight: dHeight * stageScale,
        angle,
      });
    }
  
    // 其他图
    for (let i = 0; i < otherImgs.length; i++) {
      const dom = otherImgs[i];
      const zIndex = dom.getAttribute('data-r-img') || 0;
      const {
        left: imgLeft,
        top: imgTop,
        width: imgWidth,
        height: imgHeight,
      } = dom.getBoundingClientRect();
  
      if (!renderArr[zIndex]) {
        renderArr[zIndex] = [];
      }
  
      renderArr[zIndex].push({
        type: 'img',
        image: dom,
        sx: 0,
        sy: 0,
        sWidth: imgWidth * stageScale,
        sHeight: imgHeight * stageScale,
        dx: (imgLeft - stageLeft) * stageScale,
        dy: (imgTop - stageTop) * stageScale,
        dWidth: imgWidth * stageScale,
        dHeight: imgHeight * stageScale,
      });
    }
  
    // 文字
    for (let i = 0; i < texts.length; i++) {
      const dom = texts[i];
      const info = JSON.parse(dom.getAttribute('data-r-text-info') || '{}');
      const zIndex = dom.getAttribute('data-r-text') || 0;
      const textRect = dom.getBoundingClientRect();
      const { value, color, fontFamily, fontSize, lineHeight } = info;
      const { left, top } = textRect;
  
      if (!renderArr[zIndex]) {
        renderArr[zIndex] = [];
      }
  
      renderArr[zIndex].push({
        type: 'text',
        value,
        color,
        fontFamily,
        fontSize,
        left: (left - stageLeft) * stageScale,
        top: (top - stageTop) * stageScale,
        lineHeight,
      });
    }
  
    // 箭头
    for (let i = 0; i < arrows.length; i++) {
      const dom = arrows[i];
      const zIndex = dom.getAttribute('data-r-arrow') || 0;
      const { left: imgLeft, top: imgTop } = dom.getBoundingClientRect();
  
      if (!renderArr[zIndex]) {
        renderArr[zIndex] = [];
      }
  
      renderArr[zIndex].push({
        type: 'img',
        image: dom,
        sx: 0,
        sy: 0,
        sWidth: 40 * stageScale,
        sHeight: 40 * stageScale,
        dx: (imgLeft - stageLeft) * stageScale,
        dy: (imgTop - stageTop) * stageScale,
        dWidth: 20 * stageScale,
        dHeight: 20 * stageScale,
      });
    }
  
    for (let i = 0; i < renderArr.length; i++) {
      const layers = renderArr[i];
      if (!layers) continue;
  
      for (let j = 0; j < layers.length; j++) {
        const layer = layers[j];
        if (layer.type === 'background' || layer.type === 'img') {
          const { image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight } =
            layer;
          ctx?.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        } else if (layer.type === 'product') {
          const {
            image,
            sx,
            sy,
            sWidth,
            sHeight,
            dx,
            dy,
            dWidth,
            dHeight,
            angle,
          } = layer;
          ctx?.save();
          ctx?.translate(dx + dWidth / 2, dy + dHeight / 2);
          ctx?.rotate(angle);
          ctx?.drawImage(
            image,
            sx,
            sy,
            sWidth,
            sHeight,
            -dWidth / 2,
            -dHeight / 2,
            dWidth,
            dHeight,
          );
          ctx?.restore();
        } else if (layer.type === 'text') {
          const { value, color, fontFamily, fontSize, left, top, lineHeight } =
            layer;
          // ctx!.
          ctx!.textBaseline = 'middle';
          ctx!.fillStyle = color;
          ctx!.font = `${fontSize}px ${fontFamily}`;
          ctx?.fillText(value, left, top + lineHeight / 2);
        }
      }
    }
  
    return canvas.toDataURL('"image/jpeg"');
  };
  
  export { imgRender };
  