import React,{ useState, useRef, useEffect } from 'react';
import './img.css';
// import styles from './img.less';

const SAFE_PAD = 10;
const MAX_RAD = 0.3839724354387525;

interface IProps {
    imgData: any;
    quit: boolean;
    rootRef?: any;
    scale: number;
    setEditingLock?: (status: boolean) => void;
    setImg: (type: string, imgInfo: any) => void;
  }

const ImgLayer = (props: IProps) => {
    const { imgData, quit, rootRef, setEditingLock, scale, setImg } = props;
    const {  top, left, zIndex } = imgData;

    const [width, setWidth] = useState<number>(imgData.width);
    const [height, setHeight] = useState<number>(imgData.height);

    const productRef = useRef<HTMLImageElement>(null);
    const cornerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const [borderOpacity, setBorderOpacity] = useState<string>('0');
    useEffect(() => {
        if (borderOpacity === '1') {
          setBorderOpacity('0');
        }
      }, [quit]);

    const getContainerWrapprerSty = () => {
        // return {
        //   width: width + SAFE_PAD * 2,
        //   height: height + SAFE_PAD * 2,
        //   top: top - SAFE_PAD,
        //   left: left - SAFE_PAD,
        //   zIndex,
        // };
        return {
            width: width,
            height: height,
            top: top,
            left: left,
            zIndex,
          };
    };

    const getBoderWrapperSty = () => {
        return {
          width: width,
          height: height,
        //   top: SAFE_PAD,
        //   left: SAFE_PAD,
        top: 0,
        left: 0,
        };
    };

    const mouseEnter = () => {
        setBorderOpacity('1');
    };

    const getDragAngle = (event: any, element: any) => {
    // var element = event.target
    var startAngle = parseFloat(element.dataset.angle) || 0;
    var center = {
        x: parseFloat(element.dataset.centerX) || 0,
        y: parseFloat(element.dataset.centerY) || 0,
    };
    var angle = Math.atan2(event.clientY - center.y, event.clientX - center.x);
    let res = angle - startAngle;
    return res;
    };

    useEffect(() => {
    if (!cornerRef.current) return;

    let angle = 0;
    let lock = true;

    const move = (event: any) => {
        const element = productRef.current!;
        let _angle = getDragAngle(event, element);

        // 0.26179939是15度的弧度制
        if (_angle >= MAX_RAD) {
        _angle = MAX_RAD;
        // !showTooltip && setShowTooltip(true);
        lock = true;
        } else if (_angle <= -MAX_RAD) {
        _angle = -MAX_RAD;
        // !showTooltip && setShowTooltip(true);
        lock = true;
        } else {
        lock = false;
        }

        if (!lock) {
        angle = _angle;
        }

        // update transform style on dragmove
        element.style.transform = 'rotate(' + angle + 'rad' + ')';
    };

    const up = (event: any) => {
        const element = productRef.current!;
        wrapperRef.current!.dataset.rProductAngle = String(angle);
        element.dataset.angle = String(angle);
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);

        // 延时解锁是让父组件的triggerClick方法先触发
    //   setTimeout(() => {
    //     setEditingLock(false);
    //   }, 0);
    };

    cornerRef.current.addEventListener('mousedown', event => {
        // 拖动时上锁
    //   setEditingLock(true);
        // event.preventDefault();

        const element = productRef.current!;
        const rect = element.getBoundingClientRect();

        // store the center as the element has css `transform-origin: center center`
        element.dataset.centerX = String(rect.left + rect.width / 2);
        element.dataset.centerY = String(rect.top + rect.height / 2);
        // get the angle of the element when the drag starts
        element.dataset.angle = String(getDragAngle(event, element));

        document.addEventListener('mousemove', move);

        document.addEventListener('mouseup', up);
    });
    }, [cornerRef]);

    const handleDrag = (e:any) => {
        
    const imgCurrent = productRef.current!;
    const s = imgCurrent.style
    const p = 'onmousemove';
    //在jsx中需要用e.persist()此方法会从池中移除合成事件，允许用户代码保留对事件的引用,否则clientX会是null
    let x = e.clientX - imgCurrent.offsetLeft;
    let y = e.clientY - imgCurrent.offsetTop;
    document[p] = function (e) {
        s.left = e.clientX - x + 'px';
        s.top = e.clientY - y + 'px';
        setImg('updatePos', {top: e.clientY - y, left: e.clientX - x })
    }
    // this.setState({
    //     event: document[p]
    // })
    document.onmouseup = function () {
        document[p] = null
    }
    }

    const handleZoom = (e: any) => {
        let { clientWidth, style } = productRef.current!;
        let newWidth = width;
        let newHeight = height;
        if (e.nativeEvent.deltaY <= 0 && clientWidth < 500) {
            newWidth = clientWidth + 10;
            newHeight = height * (clientWidth + 10) / width;
            style.width = newWidth + 'px' //图片宽度每次增加10
            style.height = newHeight + 'px';
            // setWidth(newWidth);
            // setHeight(newHeight);
            
        } else if (e.nativeEvent.deltaY > 0) {
            if (clientWidth > 50) {
                newWidth = clientWidth - 10;
                newHeight = height * (clientWidth - 10) / width;
                style.width = newWidth + 'px'   //图片宽度
                style.height = newHeight + 'px';
                
            }
        }
        setWidth(newWidth);
        setHeight(newHeight);
        setImg('updateSize', {width: newWidth, height: newHeight})
    }

    return (
         <div
            className="containerWrapper"
            style={getContainerWrapprerSty()}
            data-r-product={zIndex}
            ref={wrapperRef}
        >
        <div
          className="productWrapper"
          ref={productRef}
        //   style={{ padding: SAFE_PAD }}
          onDragStart={(e) => {
            e.preventDefault()
        }}
        onMouseDown={(e) => { e.persist(); handleDrag(e) }}
        onWheel={handleZoom} 
        >
            
          <img
            className="product"
            src={imgData.src}
            width={width}
            height={height}
            // src='https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.jj20.com%2Fup%2Fallimg%2F1114%2F113020142315%2F201130142315-1-1200.jpg&refer=http%3A%2F%2Fimg.jj20.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1657792247&t=506b46cadd248c9a584678aabd073460'
            alt=""
            crossOrigin="anonymous"
            
          />
          <div
            className="borderWrapper"
            style={{ ...getBoderWrapperSty(), opacity: borderOpacity }}
            onMouseEnter={mouseEnter}
          >
            <div ref={cornerRef}>
              <div
                className="corner corner1`"
                style={{ transform: `scale(${1 / scale})` }}
              />
              <div
                className="corner corner2"
                style={{ transform: `scale(${1 / scale})` }}
              />
              <div
                className="corner corner3"
                style={{ transform: `scale(${1 / scale})` }}
              />
              <div
                className="corner corner4"
                style={{ transform: `scale(${1 / scale})` }}
              />
            </div>
            <div
              className="block block1"
              style={{ transform: `scale(${1 / scale})` }}
            ></div>
            <div
              className="block block2"
              style={{ transform: `scale(${1 / scale})` }}
            ></div>
            <div
              className="block block3"
              style={{ transform: `scale(${1 / scale})` }}
            ></div>
            <div
              className="block block4"
              style={{ transform: `scale(${1 / scale})` }}
            ></div>
          </div>
        </div>
        </div>
       
    )
    
}

export default ImgLayer;