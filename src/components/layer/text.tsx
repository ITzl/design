import React,{ useState, useRef, useEffect } from 'react';
import { Input, Popover, Button, Form, Radio } from 'antd';
import './text.css';

const TextLayer = (props: any) => {
    const { textInfo, index, setInfo, quit } = props;
    const {top, left,  height, zIndex, fontInfo} = textInfo;
    const { value, names, fontSize, color, fontWeight} = fontInfo;
    const [editStatus, setEdit] = useState<boolean>(false);

    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        console.log('setEdit text', editStatus)
        setEdit(false);
    }, [quit])

    let textLines = 1;

    const textHeight = height / textLines;

    // 文字拖拽
    const handleDrag = (e:any) => {
        const textCurrent = textRef.current!;
        const s = textCurrent.style
        const p = 'onmousemove';
        // console.log('handleDrag', textRef,s)
        //在jsx中需要用e.persist()此方法会从池中移除合成事件，允许用户代码保留对事件的引用,否则clientX会是null
        let x = e.clientX - textCurrent.offsetLeft;
        let y = e.clientY - textCurrent.offsetTop;
        document[p] = function (e) {
            // console.log('文字', e.clientX - x)
            s.left = e.clientX - x + 'px';
            s.top = e.clientY - y + 'px';
            setInfo('updatePos', {top: e.clientY - y, left: e.clientX - x })
        }
        // this.setState({
        //     event: document[p]
        // })
        
        document.onmouseup = function () {
            document[p] = null;
            

        }   
    }

    // 文字进入编辑状态
    const edit = (e:any) => {
        console.log('edit', e)
        setEdit(true)
    }

    // 编辑完成
    const onFinish = (values: any) => {
        console.log('onfinish', values);
        setEdit(false);
        setInfo('update', values)
    }

    // 删除文字图层
    const delText = (textInfo: any) => {
        setInfo('delete', textInfo)
    }

    const editText = (
        <Form
            name="basic"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 19 }}
            initialValues={{ ...fontInfo }}
            onFinish={onFinish}
            autoComplete="off"
            
            >
            <Form.Item
                label="内容"
                name="value"
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="颜色"
                name="color"
            >
                <Input  />
            </Form.Item>
            <Form.Item
                label="字体"
                name="names"
            >
                <Input  />
            </Form.Item>
            <Form.Item
                label="字号"
                name="fontSize"
            >
                <Input   />
            </Form.Item>
            <Form.Item
                label="加粗"
                name="fontWeight"
            >
                <Radio.Group>
                    <Radio value={'normal'}>是</Radio>
                    <Radio value={'bold'}>否</Radio>
                </Radio.Group>
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 4, span: 20 }}>
                <Button type="primary" htmlType="submit">
                    修改
                </Button>
                <Button onClick={() => delText(textInfo)}>
                    删除
                </Button>
            </Form.Item>
        </Form>
    )
    return (
        <div
        ref={textRef}
            style={{
                position: "absolute",
                top,
                left,
                zIndex,
                fontFamily: names,
                fontSize,
                // width,
                height,
                fontWeight,
                lineHeight: height +'px',
            }}
            key={zIndex}
            onDragStart={(e) => {
                e.preventDefault()
            }}
            onMouseDown={(e) => { e.persist(); handleDrag(e) }}
            onDoubleClick={edit}
        >
            <div style={{
                color,
                height: textHeight + 'px',
                lineHeight: textHeight + 'px',
                // position: "relative"
            }}
                data-r-text={zIndex}
                data-r-text-info={JSON.stringify({
                    value,
                    color,
                    fontFamily: names,
                    fontSize,
                    lineHeight: textHeight,
                    fontWeight
                })}
            >
                {editStatus ?  (
                    <div style={{
                        border: '1px dashed rgba(0,0,0,0.75)',
                        padding: '2px 5px'
                    }}>
                        <Popover placement="top" content={editText}>
                            <span style={{ 
                                color,
                                height: textHeight + 'px',
                                lineHeight: textHeight + 'px',
                                fontSize: fontSize + 'px',
                                fontWeight
                            }}
                            >
                                {value}
                            </span>
                        </Popover>
                    </div>
                ) : 
                <span style={{ 
                    color,
                    height: textHeight + 'px',
                    lineHeight: textHeight + 'px',
                    fontSize: fontSize + 'px',
                    fontWeight: fontWeight,
                }}
                >
                    {value}
                </span>
                }
                
            </div>
        </div>
    )
}

export default TextLayer;