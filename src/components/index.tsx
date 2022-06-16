import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Popover, Modal, Form, message,Button, Input} from 'antd';
import './index.css'
import ImgLayer from './layer/img';
import TextLayer from './layer/text';

const defaultText = {
    top: 0,
    left: 0,
    // width: 100,
    height: 20,
    zIndex: 2,
    fontInfo: {
        value: '默认值默认值',
        names: '微软雅黑',
        fontSize: 15,
        color: 'red',
        fontWeight: 'normal'
    }
}

const defaultImg = {
        width: 236,
        height: 133,
        top: 0,
        left: 10,
        zIndex: 1,
        src: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.jj20.com%2Fup%2Fallimg%2F1114%2F113020142315%2F201130142315-1-1200.jpg&refer=http%3A%2F%2Fimg.jj20.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1657792247&t=506b46cadd248c9a584678aabd073460'
}



export default  (props: any) => {
    const [imgs, setImgs] = useState<any>([]);
    const [texts, setText] = useState<any>([]);
    const [containerSize, setContainerSize] = useState<any>(null);
    const [scale, setScale] = useState<number>(1);
    const [quit, setQuit] = useState<boolean>(false);
    const editingLockRef = useRef(false);

    const [stageSize, setStageSize] = useState({
        width: props.width || 300,
        height: props.height || 200,
      });

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setText([defaultText]);
        setImgs([defaultImg]);
    
    }, []);

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


    // 获得最大层级关系
    const getzIndex = () => {
        const totalLayer = texts.concat(imgs);
        const curzIndex = Math.max.apply(Math,totalLayer.map((layer: any) => { return layer.zIndex }))
   
        return curzIndex;
    }

 
    
    const onFinish =  (values: any, type: string) => {
        // getzIndex();
        if(type === 'image') {
            getImgSize(values.url).then((size: any) => {
                const addImg = {
                        width: size.width,
                        height: size.height,
                        top: 0,
                        left: 0,
                        zIndex: getzIndex() + 1,
                        src: values.url
                }
                setImgs([...imgs, addImg])
            })   
        }else if(type === 'text') {
            const addText = {
                top: 0,
                left: 0,
                height: 10,
                zIndex: getzIndex() + 1,
                fontInfo: {
                    value: values.value,
                    names: '微软雅黑',
                    fontSize: 15,
                    color: 'black',
                    fontWeight: 'normal'
                }
            }
            setText([...texts, addText]);
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
                rules={[{ required: true, message: '输入图片地址' }]}
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
                label="文字内容"
                name="value"
                rules={[{ required: true, message: '输入文本内容' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 2, span: 22 }}>
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

    // 文字的操作
    const textOperate = (type: string, textInfo: any, text: any) => {
            if(type === 'update') {
                setText(() => {
                    text.fontInfo= textInfo;
                    return [...texts]
                })
            }else if(type === 'delete') {
                let newTexts =  texts.filter((item: any) => item.zIndex !== textInfo.zIndex);
                setText(newTexts);
            }else if(type === 'updatePos') {
                setText(() => {
                    text.top =  textInfo.top;
                    text.left =  textInfo.left;
                    return [...texts]
                })
            }
            
    }

    const imgOperate = (type: string, imgInfo: any, img: any) => {
        if(type === 'update') {
            
        }else if(type === 'delete') {
            let newImgs =  img.filter((item: any) => item.zIndex !== imgInfo.zIndex);
            setImgs(newImgs);
        }else if(type === 'updatePos') {
            setImgs(() => {
                img.top =  imgInfo.top;
                img.left =  imgInfo.left;
                return [...imgs]
            })
        }else if(type === 'updateSize') {
            setImgs(() => {
                img.width =  imgInfo.width;
                img.height =  imgInfo.height;
                return [...imgs]
            })
        }
    }


    const exportImg = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = 500;
        canvas.height = 300;
        const renderArr: any = [];
        const stage = document.querySelectorAll('[data-r-stage]')[0];
        const stageRect = stage.getBoundingClientRect();

        const productsLayer = document.querySelectorAll('[data-r-product]');
        const textsLayer = document.querySelectorAll('[data-r-text]');
        const originStageScale = Number(
            stage.getAttribute('data-r-stage-scale') || 1,
        );
        const stageScale = 1 / originStageScale;

        const {
            top: stageTop,
            left: stageLeft,
            right: stageRight,
            bottom: stageBottom,
            width: stageWidth,
            height: stageHeight,
          } = stageRect;

         // 商品图
        for (let i = 0; i < productsLayer.length; i++) {
            const dom = productsLayer[i];
            const imgDom = dom.querySelectorAll('img')?.[0];
            
            const zIndex = dom.getAttribute('data-r-product') || 0;
            
            const angle = Number(dom.getAttribute('data-r-product-angle')) || 0;
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
                type: 'img',
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

        // 文字
        for (let i = 0; i < textsLayer.length; i++) {
            const dom = textsLayer[i];
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


        for (let i = 0; i < renderArr.length; i++) {
            const layers = renderArr[i];
            if (!layers) continue;
        
            for (let j = 0; j < layers.length; j++) {
              const layer = layers[j];
            if (layer.type === 'img') {
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

          const url = canvas.toDataURL('"image/jpeg"');

          downImg('导出图片', url);
        
    }

    // 下载图片
    const downImg = (fileName: string, url: string) => {
        let aLink = document.createElement('a')
        let blob = base64ToBlob(url) // new Blob([content]);
        let evt = document.createEvent('HTMLEvents')
        evt.initEvent('click', true, true)// initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
        aLink.download = fileName;
        aLink.href = URL.createObjectURL(blob)
        aLink.click()
    }

    // base64转blob
    const base64ToBlob = (code: string) => {
        let parts = code.split(';base64,')
        let contentType = parts[0].split(':')[1]
        let raw = window.atob(parts[1]) // 解码base64得到二进制字符串
        let rawLength = raw.length
        let uInt8Array = new Uint8Array(rawLength) // 创建8位无符号整数值的类型化数组
        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i) // 数组接收二进制字符串
        }
        return new Blob([uInt8Array], {type: contentType})
    }

    return (
        <div>
            <div style={{ display: "flex", justifyContent: 'center'}}>
                <Popover content={contentText} title="插入文字信息">
                    <Button type="primary">插入文字</Button>
                </Popover>
                <Popover content={contentImg} title="插入图片信息">
                    <Button type="primary" style={{ marginLeft: '50px'}}>插入图片</Button>
                </Popover>
            </div>
            <div style={{ position: 'relative', width: '500px',height: '300px', border: '2px solid red', margin: '20px auto'}} 
                 onClick={() => {
                        triggerClick()
                 }}>
                <div ref={containerRef} 
                    
                >
                    <div className="stage"
                        style={stageSty}
                        onClick={e => {
                        e.stopPropagation();
                        }}
                        data-r-stage
                        data-r-stage-scale={scale}>
                        {imgs?.length ? imgs.map((img: any, i: number) => {
                            return <ImgLayer imgData={img} 
                                             scale={0} 
                                             quit={quit} 
                                             setEditingLock={(status: boolean) => {
                                                editingLockRef.current = status;
                                             }}
                                             setImg={(type: string, imgInfo: any) => imgOperate(type, imgInfo, img)}
                                    />
                        }) : null}
                        {texts?.length ? texts.map((text: any, i:number) => {
                            // return textRender(text, i)
                            return <TextLayer key={text.zIndex} textInfo={text} 
                                    quit={quit}
                                    setInfo={(type: string, textInfo?: any) => textOperate(type, textInfo, text)}
                                   
                                    />
                        }) : null}
                    </div>
                </div>
            </div>
            <div>
                <Button onClick={exportImg}>导出图片</Button>
            </div>
            
        </div>
           
       
    )
}

// export default imgDesign;