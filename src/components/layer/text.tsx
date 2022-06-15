import React,{ useState, useRef, useEffect } from 'react';
import { Input } from 'antd';
import './text.css';

const TextLayer = (props: any) => {
    const { textInfo, index, setInfo, quit } = props;
    const {top, left, width, height, zIndex, fontInfo} = textInfo;
    const { value, names, fontSize, color} = fontInfo;
    const [editStatus, setEdit] = useState<boolean>(false);

    const textRef = useRef<HTMLDivElement>(null);

    const pieces = [];
    const len = fontInfo?.length;
    let textLines = 1;
    if (len) {
        for (let i = 0; i < len; i++) {
        const info = fontInfo[i];
        let { names, color, text } = info;
        const lineBreaks = text.match(/\r/g)?.length;
        lineBreaks && (textLines += lineBreaks);
        pieces.push({
            value: text,
            fontFamily: names,
            color,
        });
        }
    }

    const textHeight = height / textLines;

    const handleDrag = (e:any) => {
        const textCurrent = textRef.current!;
        const s = textCurrent.style
        const p = 'onmousemove';
        console.log('handleDrag', textRef,s)
        //在jsx中需要用e.persist()此方法会从池中移除合成事件，允许用户代码保留对事件的引用,否则clientX会是null
        let x = e.clientX - textCurrent.offsetLeft;
        let y = e.clientY - textCurrent.offsetTop;
        document[p] = function (e) {
            console.log('文字', e.clientX - x)
            s.left = e.clientX - x + 'px';
            s.top = e.clientY - y + 'px';
        }
        // this.setState({
        //     event: document[p]
        // })
        document.onmouseup = function () {
            document[p] = null
        }   
    }

    const edit = (e:any) => {
        console.log('edit', e)
        setEdit(true)
    }

    const textEdit = (e:any) => {
        console.log('textedit', e.target.value);
        setInfo(e.target.value);
        setEdit(false)
    }
    return (
        <div
        ref={textRef}
            style={{
                position: "absolute",
                top,
                left,
                zIndex,
                fontFamily: fontInfo.names,
                fontSize: fontInfo.fontSize,
                width,
                height,
                lineHeight: height,
            }}
            key={index}
            onDragStart={(e) => {
                e.preventDefault()
            }}
            onMouseDown={(e) => { e.persist(); handleDrag(e) }}
            onDoubleClick={edit}
        >
            <div style={{
                color,
                height: textHeight + 'px',
                lineHeight: textHeight + 'px'
            }}
                data-r-text={zIndex}
                data-r-text-info={JSON.stringify({
                    value,
                    color,
                    fontFamily: fontInfo.names,
                    fontSize: fontInfo.fontSize,
                    lineHeight: textHeight,
                })}
            >
                {editStatus ? <Input defaultValue={value} onPressEnter={textEdit} /> : <span>{value}</span>}
            </div>
        </div>
    )
}

export default TextLayer;