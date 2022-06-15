import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Popover, Modal, Form, message,Button, Input} from 'antd';
import './index.css'
import ImgLayer from './layer/img';
import TextLayer from './layer/text';

const defaultText = {
    top: 0,
    left: 0,
    width: 50,
    height: 10,
    zIndex: 2,
    fontInfo: {
        value: '默认值',
        names: '微软雅黑',
        fontSize: 10,
        color: 'red'
    }
}

const defaultImg = {
    imgData: {
        width: 236,
        height: 133,
        top: 0,
        left: 10,
        zIndex: 1,
        src: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.jj20.com%2Fup%2Fallimg%2F1114%2F113020142315%2F201130142315-1-1200.jpg&refer=http%3A%2F%2Fimg.jj20.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1657792247&t=506b46cadd248c9a584678aabd073460'
    }
}



export default  (props: any) => {
    const [imgs, setImgs] = useState<any>(null);
    const [texts, setText] = useState<any>(null);
    const [containerSize, setContainerSize] = useState<any>(null);
    const [scale, setScale] = useState<number>(1);
    const [quit, setQuit] = useState<boolean>(false);
    const editingLockRef = useRef(false);

    const [stageSize, setStageSize] = useState({
        width: props.width || 300,
        height: props.height || 200,
      });

    const containerRef = useRef<HTMLDivElement>(null);
    const stageSty = useMemo(() => {
        if (!containerSize) return {};
    
        return {
          top: (containerSize.height - stageSize.height) / 2,
          left: (containerSize.width - stageSize.width) / 2,
          width: stageSize.width,
          height: stageSize.height,
          ...(scale !== 1
            ? {
                transform: `scale(${scale})`,
              }
            : {}),
        };
      }, [containerSize]);


    // const textRender = (text: any, i: number) => {
    //     const {top, left, width, height, zIndex, fontInfo} = text;
    //     const { value, names, fontSize, color} = fontInfo;
    //     const pieces = [];
    //     const len = fontInfo?.length;
    //     let textLines = 1;
    //     if (len) {
    //         for (let i = 0; i < len; i++) {
    //           const info = fontInfo[i];
    //           let { names, color, text } = info;
    //           const lineBreaks = text.match(/\r/g)?.length;
    //           lineBreaks && (textLines += lineBreaks);
    //           pieces.push({
    //             value: text,
    //             fontFamily: names,
    //             color,
    //           });
    //         }
    //       }
    
    //       const textHeight = height / textLines;
    //       return (
    //           <div
    //           style={{
    //               top,
    //               left,
    //               zIndex,
    //               fontFamily: fontInfo.names,
    //               fontSize: fontInfo.fontSize,
    //               width,
    //               height,
    //               lineHeight: height,
    //           }}
    //           ref={textRef}
    //           key={i}
    //           >
    //               <div style={{
    //                   color,
    //                   height: textHeight + 'px',
    //                   lineHeight: textHeight + 'px'
    //               }}
    //                 data-r-text={zIndex}
    //                 data-r-text-info={JSON.stringify({
    //                     value,
    //                     color,
    //                     fontFamily: fontInfo.names,
    //                     fontSize: fontInfo.fontSize,
    //                     lineHeight: textHeight,
    //                 })}
    //               >
    //                 {value}
    //               </div>
    //           </div>
    //       )
    // }
    
    

    const onFinish =  (values: any, type: string) => {
        console.log('Success:', values, type);
        if(type === 'image') {
            getImgSize(values.url).then((size: any) => {
                console.log('img', size, size.width, size.height)
                const addImg = {
                    imgData:  {
                        width: size.width,
                        height: size.height,
                        top: 0,
                        left: 0,
                        zIndex: imgs.length + texts.length + 1,
                        src: values.url
                    }
                }
                setImgs([...imgs, addImg])
            })   
        }
    };

    // 获得图片的宽高
    const getImgSize = (url: string) => {
        return new Promise((resolve) => {
            var img = document.createElement("img");
            img.src = url;
            img.onload = () => {
            // 为什么要写 onload  是因为要等他加载完之后才能获取到图片宽高
                resolve({width:img.naturalWidth,height: img.naturalHeight});   //  2064,4608
            };
        });
    }
    const contentImg = (
        <Form
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{ remember: true }}
            onFinish={(values: any) => onFinish(values, 'image')}
            autoComplete="off"
            >
            <Form.Item
                label="图片地址"
                name="url"
                rules={[{ required: true, message: 'Please input your username!' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button type="primary" htmlType="submit">
                    添加
                </Button>
            </Form.Item>
        </Form>
    )

    const contentText = (
        <Form
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{ remember: true }}
            onFinish={(values: any) => onFinish(values, 'text')}
            autoComplete="off"
            >
            <Form.Item
                label="文字位置"
                name="top"
                rules={[{ required: true, message: 'Please input your username!' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="文字内容"
                name="value"
                rules={[{ required: true, message: 'Please input your username!' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button type="primary" htmlType="submit">
                    添加
                </Button>
            </Form.Item>
        </Form>
    )

    const triggerClick = () => {
        if (editingLockRef.current) return;
        setQuit(!quit);
      };

    useEffect(() => {
        setText([defaultText]);
        setImgs([defaultImg])
    }, [])
    
    return (
        <div>
            <div style={{ display: "flex", justifyContent: 'center'}}>
                <Popover content={contentText} title="插入文字信息">
                    <Button type="primary">插入文字</Button>
                </Popover>
                <Popover content={contentImg} title="插入图片信息">
                    <Button type="primary">插入图片</Button>
                </Popover>
            </div>
            <div style={{ position: 'relative', width: '500px',height: '300px', border: '2px solid red', margin: '20px auto'}}>
                <div ref={containerRef} 
                    onClick={() => {
                        console.log('画布')
                        triggerClick()
                }}
                >
                    <div className="stage"
                        style={stageSty}
                        onClick={e => {
                        e.stopPropagation();
                        }}
                        data-r-stage
                        data-r-stage-scale={scale}>
                        {imgs?.length ? imgs.map((img: any, i: number) => {
                            return <ImgLayer imgData={img.imgData} 
                                             scale={0} 
                                             quit={quit} 
                                             setEditingLock={(status: boolean) => {
                                                editingLockRef.current = status;
                                             }}
                                    />
                        }) : null}
                        {texts?.length ? texts.map((text: any, i:number) => {
                            // return textRender(text, i)
                            return <TextLayer index={i} textInfo={text} 
                                    quit={quit}
                                    setInfo={(letter: string) => {
                                        console.log('setInfo', letter,text);

                                        setText(() => {
                                            text.fontInfo.value = letter;
                                            return [...texts]
                                        })
                                    }}/>
                        }) : null}
                    </div>
                </div>
            </div>
        </div>
           
       
    )
}

// export default imgDesign;