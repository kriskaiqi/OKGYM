declare module '@techstark/opencv-js' {
  export interface Mat {
    delete(): void;
    empty(): boolean;
    cols: number;
    rows: number;
    data: Uint8Array;
    data8S: Int8Array;
    data16U: Uint16Array;
    data16S: Int16Array;
    data32S: Int32Array;
    data32F: Float32Array;
    data64F: Float64Array;
    type(): number;
  }

  export interface VideoCapture {
    delete(): void;
    read(): Mat;
    get(propId: number): number;
    isOpened(): boolean;
    release(): void;
  }

  export interface OpenCV {
    Mat: {
      new(rows: number, cols: number, type: number): Mat;
    };
    VideoCapture: {
      new(filename: string): VideoCapture;
    };
    imdecode(buffer: Buffer | Uint8Array, flags: number): Mat;
    CAP_PROP_FRAME_COUNT: number;
    CAP_PROP_FPS: number;
    IMREAD_COLOR: number;
    CV_8U: number;
    CV_8UC1: number;
    CV_8UC2: number;
    CV_8UC3: number;
    CV_8UC4: number;
    CV_8S: number;
    CV_8SC1: number;
    CV_8SC2: number;
    CV_8SC3: number;
    CV_8SC4: number;
    CV_16U: number;
    CV_16UC1: number;
    CV_16UC2: number;
    CV_16UC3: number;
    CV_16UC4: number;
    CV_16S: number;
    CV_16SC1: number;
    CV_16SC2: number;
    CV_16SC3: number;
    CV_16SC4: number;
    CV_32S: number;
    CV_32SC1: number;
    CV_32SC2: number;
    CV_32SC3: number;
    CV_32SC4: number;
    CV_32F: number;
    CV_32FC1: number;
    CV_32FC2: number;
    CV_32FC3: number;
    CV_32FC4: number;
    CV_64F: number;
    CV_64FC1: number;
    CV_64FC2: number;
    CV_64FC3: number;
    CV_64FC4: number;
  }

  const cv: OpenCV;
  export default cv;
} 